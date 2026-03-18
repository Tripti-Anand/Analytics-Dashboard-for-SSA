from turtle import speed

import requests
from sunpy.net import Fido, attrs as a
from sunpy.map import Map
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import numpy as np
import os


NASA_CME_URL = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME"


class CMEProcessor:

    def get_latest_metadata(self):
        response = requests.get(NASA_CME_URL)
        data = response.json()

        cme_list = []

        for item in data[-10:]:

            analysis = None
            if item.get("cmeAnalyses"):
                analysis = item["cmeAnalyses"][0]

            speed = analysis.get("speed") if analysis else None
            latitude = analysis.get("latitude") if analysis else None
            longitude = analysis.get("longitude") if analysis else None
            half_angle = analysis.get("halfAngle") if analysis else None
            cme_type = analysis.get("type") if analysis else None

            impact = self.calculate_impact_probability(speed, longitude, cme_type)

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

                "impactProbability": impact
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

            response = requests.get(image_url, stream=True)

            if response.status_code != 200:
                raise Exception("Unable to download LASCO image")

            with open(image_path, "wb") as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)

            return image_path

        except Exception as e:
            raise Exception(f"CME Image Error: {str(e)}")

    def get_full_cme_package(self):
        metadata = self.get_latest_metadata()
        self.get_latest_lasco_image()

        return metadata

    def get_lasco_animation(self):
        return {
            "animation_url": "https://soho.nascom.nasa.gov/data/LATEST/current_c2.gif"
        }
    
    def calculate_impact_probability(self, speed, longitude, cme_type):

        score = 0

        # Speed factor
        if speed:
            if speed > 1500:
                score += 3
            elif speed > 800:
                score += 2
            elif speed > 400:
                score += 1

        # Direction factor (Earth-facing longitudes roughly between -30 to +30)
        if longitude is not None:
            if -30 <= longitude <= 30:
                score += 2

        # Halo CME factor
        if cme_type and "halo" in cme_type.lower():
            score += 3

        # Classification
        if score >= 5:
            return "High"
        elif score >= 3:
            return "Moderate"
        else:
            return "Low"