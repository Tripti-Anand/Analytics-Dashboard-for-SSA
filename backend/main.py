from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import flare

app = FastAPI(title="Solar Space Weather Dashboard API")

# CORS: Allow your Next.js frontend (port 3000) to fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routers
app.include_router(flare.router)

@app.get("/")
def root():
    return {"status": "running", "modules": ["flare"]}

if __name__ == "__main__":
    import uvicorn
    # Run on localhost:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)