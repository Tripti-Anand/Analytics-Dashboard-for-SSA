from fastapi import APIRouter
import requests

router = APIRouter()

NASA_API_KEY = "DEMO_KEY"

@router.get("/flares")
def get_solar_flares():
    url = f"https://api.nasa.gov/DONKI/FLR?api_key={NASA_API_KEY}"

    try:
        response = requests.get(url)
        data = response.json()

        formatted = []

        for flare in data:
            formatted.append({
                "classType": flare.get("classType"),
                "startTime": flare.get("beginTime"),
                "peakTime": flare.get("peakTime"),
                "endTime": flare.get("endTime"),
                "activeRegion": flare.get("activeRegionNum")
            })

        return formatted

    except Exception as e:
        return {"error": str(e)}
