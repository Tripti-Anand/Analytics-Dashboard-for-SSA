from operator import neg, pos
import os
from pyexpat import features
import requests
import numpy as np
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from sunpy.map import Map
import astropy.units as u
from scipy.ndimage import label, find_objects

class SunPyProcessor:
    """
    Handles downloading and processing of scientific FITS files (HMI Magnetograms).
    """
    
    ASSETS_DIR = "./assets/flare/magnetogram"
    HMI_URL_BASE = "http://jsoc.stanford.edu/data/hmi/fits/"

    def __init__(self):
        os.makedirs(self.ASSETS_DIR, exist_ok=True)

    def _get_latest_hmi_url(self):
        """Scrapes the JSOC directory to find the absolute latest FITS file."""
        now = datetime.utcnow()
        # HMI data is usually 15-30 mins behind, so check today's folder
        date_str = now.strftime('%Y/%m/%d/')
        url = f"{self.HMI_URL_BASE}{date_str}"
        
        try:
            resp = requests.get(url, timeout=5)
            soup = BeautifulSoup(resp.text, 'html.parser')
            links = soup.select('a[href$=".fits"]')
            if not links:
                return None
            # Return the last link (most recent time)
            return f"{url}{links[-1]['href']}"
        except:
            return None

    def get_latest_magnetogram(self):
        """
        Downloads HMI FITS if a new one exists, or loads the cached local copy.
        Returns: Numpy array (image data) and Metadata.
        """
        local_file = f"{self.ASSETS_DIR}/latest_hmi.fits"
        
        # 1. CACHING STRATEGY: 
        # If file exists and is less than 30 mins old, use it. Don't redownload.
        should_download = True
        if os.path.exists(local_file):
            file_time = datetime.fromtimestamp(os.path.getmtime(local_file))
            if datetime.now() - file_time < timedelta(minutes=30):
                should_download = False
                print("Loading cached HMI FITS...")

        # 2. DOWNLOAD (If needed)
        if should_download:
            print("Fetching new HMI FITS...")
            latest_url = self._get_latest_hmi_url()
            if latest_url:
                with requests.get(latest_url, stream=True) as r:
                    r.raise_for_status()
                    with open(local_file, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)

        # 3. PROCESS WITH SUNPY
        # Load the FITS file into a SunPy Map
        hmi_map = Map(local_file)
        hmi_map = hmi_map.rotate() # Align Solar North up

        # Downsample for web performance (1024x1024 -> 512x512)
        # This makes the API response 4x faster
        new_dim = [512, 512] * u.pixel
        hmi_resampled = hmi_map.resample(new_dim)

        # Normalize data (clipping magnetic field values for visualization)
        data = np.nan_to_num(hmi_resampled.data, nan=0)
        data = np.clip(data, -150, 150) # Clip extreme gauss values

        return {
            "data": data.tolist(), # Convert numpy -> list for JSON
            "meta": {
                "date": hmi_map.meta['date-obs'],
                "instrument": "SDO/HMI",
                "unit": "Gauss"
            }
        }

    def analyze_magnetogram(self, data):

        arr = np.array(data)

        # Mean magnetic strength
        mean_field = float(np.mean(np.abs(arr)))

        # Magnetic gradient (detect complexity)
        gx, gy = np.gradient(arr)
        gradient_strength = float(np.mean(np.sqrt(gx**2 + gy**2)))

        # Polarity mixing
        pos = np.sum(arr > 0)
        neg = np.sum(arr < 0)

        polarity_mix = float(min(pos, neg) / max(pos, neg)) if max(pos, neg) != 0 else 0

        return {
            "mean_field": round(mean_field, 2),
            "gradient_strength": round(gradient_strength, 2),
            "polarity_mix": round(polarity_mix, 3)
        }    

    def calculate_flare_probability(self, strength, area):
        """
        Simple heuristic model for flare probability
        """

        # Normalize values
        strength_factor = min(strength / 150, 1)   # 0 → 1
        area_factor = min(area / 2000, 1)          # 0 → 1

        score = (0.7 * strength_factor) + (0.3 * area_factor)

        if score > 0.75:
            return {"C": 40, "M": 40, "X": 20}
        elif score > 0.38:
            return {"C": 60, "M": 30, "X": 10}
        else:
            return {"C": 80, "M": 15, "X": 5}
        
    def detect_active_regions(self, data):

        arr = np.array(data)

        # Balanced threshold
        threshold = 100
        mask = np.abs(arr) > threshold

        labeled, num = label(mask)
        objects = find_objects(labeled)

        regions = []

        for obj in objects:

            if obj is None:
                continue

            y_slice, x_slice = obj

            x1 = x_slice.start
            x2 = x_slice.stop
            y1 = y_slice.start
            y2 = y_slice.stop

            width = x2 - x1
            height = y2 - y1
            area = width * height

            # Balanced filtering
            if area < 80:
                continue

            region = arr[y1:y2, x1:x2]

            mean_strength = float(np.mean(np.abs(region)))

            flare_prob = self.calculate_flare_probability(mean_strength, area)

            regions.append({
                "id": len(regions) + 1,
                "bbox": [x1, y1, x2, y2],
                "strength": round(mean_strength, 2),
                "area": area,
                "flare": flare_prob
            })

        return regions        