from fastapi import APIRouter
import requests
import httpx
from fastapi.responses import StreamingResponse
router = APIRouter()

NASA_API_KEY = "8hyxjzgej9raSt2MDc8D14zTZCIILzw5oJrmFMe6"

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


@router.get("/aia-image")
async def get_aia_image(wavelength: str = "0171"):
    url = f"https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_{wavelength}.jpg"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)
        return StreamingResponse(
            response.aiter_bytes(),
            media_type="image/jpeg"
        )