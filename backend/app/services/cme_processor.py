import requests
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

load_dotenv()

NASA_CME_URL = "https://api.nasa.gov/DONKI/CME"
NASA_API_KEY = os.getenv("NASA_API_KEY", "8ZMQhHDs5WkHqm761lOCn9x20SafyO52o3HDMbSR")

class CMEProcessor:

    def _get_session(self):
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    def get_full_cme_package(self):
        session = self._get_session()

        try:
            response = session.get(
                NASA_CME_URL,
                params={"api_key": NASA_API_KEY},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            raise Exception(f"CME fetch failed: {str(e)}")

        cme_list = []
        for item in data[-10:]:
            analysis = item["cmeAnalyses"][0] if item.get("cmeAnalyses") else None

            speed = analysis.get("speed") if analysis else None
            latitude = analysis.get("latitude") if analysis else None
            longitude = analysis.get("longitude") if analysis else None
            half_angle = analysis.get("halfAngle") if analysis else None
            cme_type = analysis.get("type") if analysis else None

            cme_list.append({
                "activityID": item.get("activityID"),
                "startTime": item.get("startTime"),
                "sourceLocation": item.get("sourceLocation"),
                "note": item.get("note"),
                "instruments": [
                    inst["displayName"]
                    for inst in item.get("instruments", [])
                ],
                "speed": speed,
                "latitude": latitude,
                "longitude": longitude,
                "halfAngle": half_angle,
                "type": cme_type,
                "impactProbability": self.calculate_impact_probability(
                    speed, longitude, cme_type
                )
            })

        return {
            "status": "success",
            "total": len(cme_list),
            "cme_events": cme_list
        }

    def get_latest_lasco_image(self):
        try:
            image_url = "https://soho.nascom.nasa.gov/data/LATEST/current_c2.gif"
            image_path = "app/assets/cme/latest_cme.gif"
            os.makedirs(os.path.dirname(image_path), exist_ok=True)

            session = self._get_session()
            response = session.get(image_url, stream=True, timeout=15)

            if response.status_code != 200:
                raise Exception("Unable to download LASCO image")

            with open(image_path, "wb") as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)

            return image_path
        except Exception as e:
            raise Exception(f"CME Image Error: {str(e)}")

    def calculate_impact_probability(self, speed, longitude, cme_type):
        score = 0
        if speed:
            if speed > 1500: score += 3
            elif speed > 800: score += 2
            elif speed > 400: score += 1
        if longitude is not None:
            if -30 <= longitude <= 30: score += 2
        if cme_type and "halo" in cme_type.lower(): score += 3
        if score >= 5: return "High"
        elif score >= 3: return "Moderate"
        else: return "Low"