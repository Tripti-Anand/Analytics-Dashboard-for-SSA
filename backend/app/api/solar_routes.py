import os
from fastapi import APIRouter, HTTPException
import httpx
from fastapi.responses import StreamingResponse
from app.services.solar_wind_service import SolarWindFetcher
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

NASA_API_KEY = os.getenv("NASA_API_KEY")


@router.get("/flares")
async def get_solar_flares():
    """
    Returns solar flare events from NASA DONKI API.
    """
    if not NASA_API_KEY:
        raise HTTPException(status_code=500, detail="NASA API key not configured")

    url = f"https://api.nasa.gov/DONKI/FLR?api_key={NASA_API_KEY}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()

        formatted = [
            {
                "classType": flare.get("classType"),
                "startTime": flare.get("beginTime"),
                "peakTime": flare.get("peakTime"),
                "endTime": flare.get("endTime"),
                "activeRegion": flare.get("activeRegionNum"),
            }
            for flare in data
        ]
        return formatted

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"NASA API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/aia-image")
async def get_aia_image(wavelength: str = "0171"):
    """
    Streams the latest AIA solar image from SDO for a given wavelength.
    """
    VALID_WAVELENGTHS = {"0094", "0131", "0171", "0193", "0211", "0304", "0335", "1600", "1700"}

    if wavelength not in VALID_WAVELENGTHS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid wavelength. Must be one of: {', '.join(sorted(VALID_WAVELENGTHS))}"
        )

    url = f"https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_{wavelength}.jpg"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            return StreamingResponse(
                response.aiter_bytes(),
                media_type="image/jpeg"
            )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"SDO image fetch error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Solar Wind Data Endpoints

@router.get("/wind/speed")
async def get_solar_wind_speed():
    """
    Returns solar wind speed, density, and temperature data from NOAA SWPC.
    """
    data = await SolarWindFetcher.get_solar_wind_data()

    if not data:
        raise HTTPException(status_code=503, detail="Solar wind data unavailable")

    return {
        "status": "success",
        "data": data
    }


@router.get("/wind/imf")
async def get_imf_data():
    """
    Returns Interplanetary Magnetic Field (IMF) data from NOAA SWPC.
    Includes Bx, By, Bz components and total magnitude.
    """
    data = await SolarWindFetcher.get_imf_data()

    if not data:
        raise HTTPException(status_code=503, detail="IMF data unavailable")

    return {
        "status": "success",
        "data": data
    }


@router.get("/wind/all")
async def get_all_solar_wind():
    """
    Returns combined solar wind speed, density, temperature, and IMF data.
    """
    data = await SolarWindFetcher.get_all_solar_wind_data()

    if not data["solar_wind"] and not data["imf"]:
        raise HTTPException(status_code=503, detail="All solar wind data unavailable")

    return {
        "status": "success",
        "solar_wind": data["solar_wind"],
        "imf": data["imf"]
    }

# Solar Energetic Particle (SEP) Endpoints

from app.services.sep_service import SEPFetcher

@router.get("/sep/particle-flux")
async def get_particle_flux():
    """Returns proton and electron flux data from NOAA SWPC."""
    data = await SEPFetcher.get_particle_flux_data()
    if not data["proton"] and not data["electron"]:
        raise HTTPException(status_code=503, detail="Particle flux data unavailable")
    return {"status": "success", "proton": data["proton"], "electron": data["electron"]}


@router.get("/sep/alerts")
async def get_radiation_alerts():
    """Returns current radiation alerts and risk levels."""
    data = await SEPFetcher.get_radiation_alerts()
    return {"status": "success", "risk_level": data["risk_level"], "alerts": data["alerts"]}


@router.get("/sep/all")
async def get_all_sep_data():
    """Returns combined SEP data: particle flux, alerts, and risk assessment."""
    data = await SEPFetcher.get_all_sep_data()
    return {
        "status": "success",
        "particle_flux": data["particle_flux"],
        "alerts": data["alerts"],
        "radiation_risk": data["radiation_risk"],
    }