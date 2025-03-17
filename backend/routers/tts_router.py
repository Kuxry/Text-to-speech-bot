from fastapi import APIRouter, HTTPException, Response
from models.schemas import TTSRequest
from tts.azure_adapter import AzureTTS
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_speech(request: TTSRequest):
    try:
        logger.info(f"收到生成请求: {request.dict()}")
        tts = AzureTTS(request.azure_key, request.azure_region)
        audio = await tts.synthesize(request.text, request.voice)
        return Response(content=audio, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"生成失败: {str(e)}", exc_info=True)
        raise HTTPException(500, detail="语音生成失败，请检查日志") 