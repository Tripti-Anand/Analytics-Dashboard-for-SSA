import httpx
import pandas as pd
from datetime import datetime

class NOAAFetcher:
    """
    Handles lightweight data fetching from NOAA SWPC (Space Weather Prediction Center).
    """
    
    GOES_URL_PRIMARY = "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json"
    GOES_URL_SECONDARY = "https://services.swpc.noaa.gov/json/goes/secondary/xrays-6-hour.json"

    @staticmethod
    async def get_goes_xray_flux():
        """
        Fetches and merges GOES-16 and GOES-17 X-ray flux data.
        Returns cleaned JSON for the frontend Plotly graph.
        """
        async with httpx.AsyncClient() as client:
            try:
                # Try Primary Satellite (GOES-16)
                response = await client.get(NOAAFetcher.GOES_URL_PRIMARY, timeout=5.0)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                print(f"Primary GOES failed: {e}. Trying Secondary...")
                # Fallback to Secondary (GOES-17/18)
                response = await client.get(NOAAFetcher.GOES_URL_SECONDARY, timeout=5.0)
                data = response.json()

        # Process with Pandas (cleaning data as per Professor's logic)
        df = pd.DataFrame(data)
        
        # Filter for 'Long' channel (0.1-0.8nm) used for Flare Class (A, B, C, M, X)
        long_flux = df[
            (df['energy'] == '0.1-0.8nm') & 
            (df['observed_flux'] > 0)
        ].copy()

        # Select only necessary columns for bandwidth efficiency
        result = long_flux[['time_tag', 'flux']].tail(200) # Last 200 points (~3 hours)
        
        return result.to_dict(orient='records')