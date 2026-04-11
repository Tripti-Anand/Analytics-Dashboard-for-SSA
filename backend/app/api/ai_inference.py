import logging
import numpy as np
from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io

from app.services.ai_service import AIService
from app.services.detection_service import detect_and_annotate

logger     = logging.getLogger(__name__)
router     = APIRouter()
ai_service = AIService()

EXPECTED_CHANNELS = 13


def _fake_multichannel(h: int = 512, w: int = 512) -> np.ndarray:
    rng  = np.random.default_rng(seed=42)
    base = rng.standard_normal((h, w)).astype(np.float32)
    channels = [
        base + rng.standard_normal((h, w)).astype(np.float32) * 0.1
        for _ in range(EXPECTED_CHANNELS)
    ]
    return np.stack(channels, axis=0)


def _image_to_stack(raw: bytes) -> np.ndarray:
    pil = Image.open(io.BytesIO(raw)).convert("L")
    arr = np.array(pil, dtype=np.float32) / 255.0
    return np.stack([arr] * EXPECTED_CHANNELS, axis=0)


@router.post("/chat")
async def chat(
    message: str               = Form(...),
    image:   UploadFile | None = File(default=None),
):
    raw_bytes        = None
    image_stack      = _fake_multichannel()
    detection_result = None

    if image is not None:
        try:
            raw_bytes   = await image.read()
            image_stack = _image_to_stack(raw_bytes)

            # ── Run detection + annotation ──────────────────────
            detection_result = detect_and_annotate(raw_bytes)

        except Exception:
            logger.exception("Failed to process uploaded image")
            raise HTTPException(
                status_code=422,
                detail="Could not read the uploaded image."
            )

    try:
        result = ai_service.chat(
            message=message,
            image_stack=image_stack,
            image_bytes=raw_bytes,
        )
    except Exception:
        logger.exception("ai_service.chat raised unexpectedly")
        raise HTTPException(status_code=500, detail="Inference error.")

    return JSONResponse({
        "response":        result["text"],
        "surya_data":      result["surya_data"],
        "source":          result["source"],
        # ── New fields ──────────────────────────────────────────
        "annotated_image": detection_result["annotated_image"] if detection_result else None,
        "regions":         detection_result["regions"]         if detection_result else [],
    })