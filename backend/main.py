from fastapi import FastAPI, HTTPException, BackgroundTasks, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, validator
import logging
import edge_tts
import asyncio
import tempfile
import os
from config import settings
from tts.azure_adapter import AzureTTS

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()
router = APIRouter(prefix=settings.API_PREFIX)

# 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    speed: float = 1.0
    pitch: float = 1.0
    api_key: str = None
    region: str = "eastus"

    @validator('text')
    def check_text_length(cls, v):
        if len(v) > 2000:
            raise ValueError('文本长度不能超过2000字符')
        return v

def cleanup_tempfile(filepath: str):
    try:
        if os.path.exists(filepath):
            os.unlink(filepath)
            logger.info(f"已清理临时文件: {filepath}")
    except Exception as e:
        logger.error(f"清理文件失败: {str(e)}")

@router.post("/generate")
async def generate_speech(
    request: TTSRequest,
    background_tasks: BackgroundTasks
):
    try:
        # 输入验证日志
        logger.info(f"收到请求 - 语言: {request.voice}, 字符数: {len(request.text)}")

        # 生成SSML
        ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
            <voice name="{request.voice}">
                <prosody rate="{request.speed}" pitch="{request.pitch}%">
                    {request.text}
                </prosody>
            </voice>
        </speak>"""
        
        # 生成语音
        communicate = edge_tts.Communicate(ssml, request.voice)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        await communicate.save(tmp.name)
        
        # 添加后台清理任务
        background_tasks.add_task(cleanup_tempfile, tmp.name)
        
        return FileResponse(
            tmp.name,
            media_type="audio/mpeg",
            filename="generated.mp3"
        )
            
    except ValueError as ve:
        logger.warning(f"无效请求参数: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except edge_tts.exceptions.NoAudioReceived:
        logger.error("TTS引擎未返回音频数据")
        raise HTTPException(500, "语音生成失败：无音频数据")
    except Exception as e:
        logger.error(f"服务器错误: {str(e)}", exc_info=True)
        raise HTTPException(500, "内部服务器错误")

azure_tts = AzureTTS()

@app.post("/azure/generate")
async def generate_azure(request: TTSRequest):
    try:
        audio = await azure_tts.synthesize(
            request.text, 
            {"voice": request.voice}
        )
        return audio_response(audio)
    except Exception as e:
        handle_error(e)

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": f"参数错误: {str(exc)}"}
    )

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 