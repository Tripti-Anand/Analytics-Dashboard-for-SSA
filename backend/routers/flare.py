from fastapi import APIRouter, HTTPException
from services.noaa_fetcher import NOAAFetcher
from services.sunpy_processor import SunPyProcessor

router = APIRouter(prefix="/api/flare", tags=["Flare Module"])
processor = SunPyProcessor()

@router.get("/flux")
async def get_flux_data():
    """Endpoint for the X-Ray Flux Plot"""
    try:
        data = await NOAAFetcher.get_goes_xray_flux()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/magnetogram")
async def get_magnetogram_data():
    """Endpoint for the HMI Magnetogram Map"""
    try:
        # This is a synchronous operation (SunPy is CPU bound), 
        # so we don't await it unless we wrap it in a threadpool (advanced optimization).
        result = processor.get_latest_magnetogram()
        return {"status": "success", "heatmap": result}
    except Exception as e:
        print(f"Error processing HMI: {e}")
        raise HTTPException(status_code=500, detail="Failed to process magnetogram")