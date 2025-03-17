from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import edge_tts
import asyncio
import tempfile
import os

app = FastAPI()

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

@app.post("/generate")
async def generate_speech(request: TTSRequest):
    try:
        # 构建SSML
        ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
            <voice name="{request.voice}">
                <prosody rate="{request.speed}" pitch="{request.pitch}%">
                    {request.text}
                </prosody>
            </voice>
        </speak>"""
        
        # 生成语音文件
        communicate = edge_tts.Communicate(ssml, request.voice)
        
        # 使用临时文件保存
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            await communicate.save(tmp.name)
            return FileResponse(
                tmp.name,
                media_type="audio/mpeg",
                filename="generated.mp3"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp and os.path.exists(tmp.name):
            os.unlink(tmp.name)  # 清理临时文件

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 