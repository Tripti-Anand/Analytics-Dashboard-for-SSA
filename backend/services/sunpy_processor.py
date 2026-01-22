import os
import requests
import numpy as np
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from sunpy.map import Map
import astropy.units as u

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