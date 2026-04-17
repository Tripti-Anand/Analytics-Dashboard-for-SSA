import pymysql
pymysql.install_as_MySQLdb()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.space_weather import router as space_weather_router
from app.api.noaa import router as noaa_router
from app.api import magnetogram_routes
from app.api import system_routes
from app.api import cme_routes
from app.api import solar_routes

app = FastAPI(title="SSA Backend")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SSA Backend running successfully"}

# Routes
app.include_router(space_weather_router, prefix="/space-weather")
app.include_router(noaa_router, prefix="/noaa")
app.include_router(magnetogram_routes.router, prefix="/space-weather")
app.include_router(system_routes.router, prefix="/system")
app.include_router(cme_routes.router, prefix="/space-weather")
app.include_router(solar_routes.router, prefix="/space-weather")
