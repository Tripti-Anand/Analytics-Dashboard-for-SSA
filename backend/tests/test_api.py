"""
SSA Dashboard – Automated API Test Suite
Run with: pytest tests/test_api.py -v -s
The -s flag prints actual output for each test → copy into Excel "Actual Result" column
"""

import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app.main import app

client = TestClient(app)


# ══════════════════════════════════════════════════════════
#  ROOT & SYSTEM
# ══════════════════════════════════════════════════════════

def test_BE001_root_returns_running_message():
    """BE-001: GET / returns running message"""
    res = client.get("/")
    data = res.json()
    print(f"\n[BE-001] Status: {res.status_code} | Body: {data}")
    assert res.status_code == 200
    assert "message" in data
    assert "running" in data["message"].lower()


def test_BE002_system_status_returns_health_info():
    """BE-002: GET /system/status returns health info"""
    res = client.get("/system/status")
    data = res.json()
    print(f"\n[BE-002] Status: {res.status_code} | Keys: {list(data.keys())} | magnetogram_cached: {data.get('magnetogram_cached')}")
    assert res.status_code == 200
    for key in ["service", "time", "magnetogram_cached", "cache_location"]:
        assert key in data


# ══════════════════════════════════════════════════════════
#  SOLAR FLARES
# ══════════════════════════════════════════════════════════

def test_BE008_flares_returns_list():
    """BE-008: GET /space-weather/flares returns list (skips if NASA rate-limited)"""
    res = client.get("/space-weather/flares")
    if res.status_code == 500:
        print(f"\n[BE-008] Status: 500 — NASA API rate limit or error. Marking as expected.")
        pytest.skip("NASA API unavailable (rate limit or network)")
    data = res.json()
    count = len(data) if isinstance(data, list) else "N/A"
    first = data[0] if isinstance(data, list) and data else {}
    print(f"\n[BE-008] Status: {res.status_code} | Total flares: {count} | First item keys: {list(first.keys())}")
    assert res.status_code == 200
    assert isinstance(data, list)
    if data:
        assert "classType" in data[0]


def test_BE011_aia_invalid_wavelength_returns_400():
    """BE-011: Invalid wavelength returns 400"""
    res = client.get("/space-weather/aia-image?wavelength=9999")
    data = res.json()
    print(f"\n[BE-011] Status: {res.status_code} | Detail: {data.get('detail')}")
    assert res.status_code == 400
    assert "detail" in data


def test_BE012_aia_valid_wavelengths():
    """BE-012: All valid wavelengths return 200 or upstream error"""
    wavelengths = ["0094", "0131", "0171", "0193", "0211", "0304", "0335", "1600", "1700"]
    results = {}
    for wl in wavelengths:
        res = client.get(f"/space-weather/aia-image?wavelength={wl}")
        results[wl] = res.status_code
    print(f"\n[BE-012] Wavelength results: {results}")
    for wl, code in results.items():
        assert code in [200, 500, 503], f"Unexpected status {code} for wavelength {wl}"


# ══════════════════════════════════════════════════════════
#  GOES X-RAY
# ══════════════════════════════════════════════════════════

def test_BE013_goes_xray_returns_primary_and_secondary():
    """BE-013: /noaa/goes-xray returns primary and secondary"""
    res = client.get("/noaa/goes-xray")
    assert res.status_code == 200
    data = res.json()
    p_len = len(data.get("primary", []))
    s_len = len(data.get("secondary", []))
    print(f"\n[BE-013] Status: {res.status_code} | primary items: {p_len} | secondary items: {s_len}")
    assert "primary" in data
    assert "secondary" in data
    assert isinstance(data["primary"], list)
    assert isinstance(data["secondary"], list)


def test_BE014_goes_primary_max_200_items():
    """BE-014: primary list has ≤ 200 items"""
    res = client.get("/noaa/goes-xray")
    if res.status_code != 200:
        pytest.skip("NOAA unavailable")
    count = len(res.json().get("primary", []))
    print(f"\n[BE-014] Primary count: {count} (must be ≤ 200)")
    # NOAA returns exactly 200 (tail of last 200): ≤ 200 is correct
    assert count <= 200


def test_BE015_goes_flux_values_positive():
    """BE-015: All flux values > 0"""
    res = client.get("/noaa/goes-xray")
    items = res.json().get("primary", [])
    negatives = [i["flux"] for i in items if i["flux"] <= 0]
    print(f"\n[BE-015] Total primary items: {len(items)} | Non-positive flux values: {negatives}")
    assert negatives == [], f"Non-positive flux found: {negatives}"


# ══════════════════════════════════════════════════════════
#  CME
# ══════════════════════════════════════════════════════════

def test_BE016_cme_full_returns_events():
    """BE-016: /cme/full returns up to 10 CME events (skips if NASA rate-limited)"""
    res = client.get("/space-weather/cme/full")
    if res.status_code == 500:
        print(f"\n[BE-016] Status: 500 — NASA API rate limit or error. Skipping.")
        pytest.skip("NASA API unavailable (rate limit or network)")
    data = res.json()
    events = data.get("cme_events", [])
    first = {k: events[0][k] for k in ["activityID", "speed", "impactProbability"]} if events else {}
    print(f"\n[BE-016] Status: {res.status_code} | total: {data.get('total')} | first event: {first}")
    assert res.status_code == 200
    assert data["status"] == "success"
    assert len(events) <= 10


def test_BE018_cme_impact_probability_valid_values():
    """BE-018: impactProbability only Low/Moderate/High"""
    res = client.get("/space-weather/cme/full")
    events = res.json().get("cme_events", [])
    probs = {e["activityID"]: e.get("impactProbability") for e in events}
    print(f"\n[BE-018] Impact probabilities: {probs}")
    valid = {"Low", "Moderate", "High"}
    for aid, prob in probs.items():
        if prob:
            assert prob in valid, f"{aid} has invalid value: {prob}"


def test_BE017_cme_image_returns_file():
    """BE-017: /cme/image returns file"""
    res = client.get("/space-weather/cme/image")
    ctype = res.headers.get("content-type", "unknown")
    print(f"\n[BE-017] Status: {res.status_code} | Content-Type: {ctype} | Body size: {len(res.content)} bytes")
    assert res.status_code in [200, 500]


# ══════════════════════════════════════════════════════════
#  SOLAR WIND
# ══════════════════════════════════════════════════════════

def test_BE019_wind_speed_returns_data():
    """BE-019: /wind/speed returns speed, density, temperature"""
    res = client.get("/space-weather/wind/speed")
    data = res.json()
    items = data.get("data", [])
    latest = items[-1] if items else {}
    print(f"\n[BE-019] Status: {res.status_code} | data points: {len(items)} | latest: {latest}")
    assert res.status_code == 200
    assert data["status"] == "success"
    if items:
        for key in ["time_tag", "speed", "density", "temperature"]:
            assert key in items[0]


def test_BE020_wind_imf_returns_components():
    """BE-020: /wind/imf returns bx, by, bz, bt"""
    res = client.get("/space-weather/wind/imf")
    data = res.json()
    items = data.get("data", [])
    latest = items[-1] if items else {}
    print(f"\n[BE-020] Status: {res.status_code} | data points: {len(items)} | latest: {latest}")
    assert res.status_code == 200
    if items:
        for key in ["bx", "by", "bz", "bt"]:
            assert key in items[0]


def test_BE021_wind_all_returns_both():
    """BE-021: /wind/all returns solar_wind and imf"""
    res = client.get("/space-weather/wind/all")
    data = res.json()
    sw_len = len(data.get("solar_wind", []))
    imf_len = len(data.get("imf", []))
    print(f"\n[BE-021] Status: {res.status_code} | solar_wind points: {sw_len} | imf points: {imf_len}")
    assert res.status_code == 200
    assert "solar_wind" in data and "imf" in data


# ══════════════════════════════════════════════════════════
#  SEP
# ══════════════════════════════════════════════════════════

def test_BE023_sep_particle_flux():
    """BE-023: /sep/particle-flux returns proton and electron"""
    res = client.get("/space-weather/sep/particle-flux")
    data = res.json()
    p_len = len(data.get("proton", []))
    e_len = len(data.get("electron", []))
    print(f"\n[BE-023] Status: {res.status_code} | proton points: {p_len} | electron points: {e_len}")
    assert res.status_code == 200
    assert "proton" in data and "electron" in data


def test_BE024_sep_alerts_risk_level():
    """BE-024: /sep/alerts returns risk_level and alerts"""
    res = client.get("/space-weather/sep/alerts")
    data = res.json()
    print(f"\n[BE-024] Status: {res.status_code} | risk_level: {data.get('risk_level')} | alert count: {len(data.get('alerts', []))}")
    valid_levels = {"quiet", "low", "moderate", "high", "severe", "unknown"}
    assert data["risk_level"] in valid_levels
    assert isinstance(data["alerts"], list)


def test_BE025_sep_all_keys():
    """BE-025: /sep/all returns particle_flux, alerts, radiation_risk"""
    res = client.get("/space-weather/sep/all")
    data = res.json()
    risk = data.get("radiation_risk", {})
    print(f"\n[BE-025] Status: {res.status_code} | keys: {list(data.keys())} | radiation_risk: {risk}")
    assert "particle_flux" in data
    assert "alerts" in data
    assert "radiation_risk" in data


def test_BE026_sep_radiation_risk_valid():
    """BE-026: radiation_risk values are valid levels"""
    res = client.get("/space-weather/sep/all")
    risk = res.json().get("radiation_risk", {})
    valid = {"low", "moderate", "high", "severe", "extreme"}
    print(f"\n[BE-026] radiation_risk: {risk}")
    for key in ["crew", "satellite", "deep_space"]:
        if key in risk:
            assert risk[key] in valid


# ══════════════════════════════════════════════════════════
#  AI INFERENCE
# ══════════════════════════════════════════════════════════

def test_BE027_ai_chat_text_only():
    """BE-027: POST /ai/chat with text returns response"""
    res = client.post("/ai/chat", data={"message": "What is a solar flare?"})
    data = res.json()
    print(f"\n[BE-027] Status: {res.status_code} | source: {data.get('source')} | response preview: {str(data.get('response',''))[:80]}")
    assert res.status_code == 200
    assert "response" in data
    assert data.get("annotated_image") is None


def test_BE028_ai_flare_predict_live():
    """BE-028: POST /ai/flare-predict with live data"""
    res = client.post("/ai/flare-predict", json={"use_live_data": True})
    data = res.json()
    print(f"\n[BE-028] Status: {res.status_code} | predicted_class: {data.get('predicted_class')} | confidence: {data.get('confidence')} | model: {data.get('model_source')}")
    assert res.status_code == 200
    assert "predicted_class" in data
    assert "confidence" in data
