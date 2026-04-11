from fastapi import APIRouter
from app.services.nasa_service import get_solar_flares

router = APIRouter()

@router.get("/solar-flares")
def solar_flares():
    """
    Returns recent solar flare data from NASA DONKI API
    """
    return get_solar_flares()
