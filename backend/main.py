from fastapi import FastAPI, Request  # 添加Request导入
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse, Response
from pydantic import BaseModel, Field, field_validator
import logging
import edge_tts
import asyncio
import tempfile
import os
from config import settings
from tts.azure_adapter import AzureTTS
from models.schemas import TTSRequest
import io
import traceback
from dotenv import load_dotenv
from routers.tts_router import router as tts_router  # 使用相对导入
import uuid  # 添加请求ID生成
from contextlib import asynccontextmanager
from fastapi.exceptions import RequestValidationError

# 配置结构化日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """生命周期管理"""
    logger.info("Service starting...")
    yield
    logger.info("Service shutting down...")

app = FastAPI(lifespan=lifespan)

# 中间件顺序非常重要！
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """增强版请求日志中间件"""
    request_id = str(uuid.uuid4())
    logger.info(
        f"Incoming request: {request.method} {request.url}",
        extra={"request_id": request_id}
    )
    
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(
            f"Request failed: {str(e)}",
            exc_info=True,
            extra={"request_id": request_id}
        )
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error"},
            headers={"X-Request-ID": request_id}
        )
    
    response.headers["X-Request-ID"] = request_id
    logger.info(
        f"Completed request: {response.status_code}",
        extra={"request_id": request_id}
    )
    return response

# 自定义异常类
class BusinessException(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

@app.exception_handler(BusinessException)
async def business_exception_handler(request: Request, exc: BusinessException):
    return JSONResponse(
        status_code=exc.code,
        content={"message": exc.message},
        headers=request.headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "参数校验失败", "detail": exc.errors()},
    )

# 注册路由
app.include_router(tts_router, prefix="/api")

@app.get("/")
async def root():
    """服务健康检查接口"""
    return {"status": "active", "version": "1.2.0"}

def cleanup_tempfile(filepath: str):
    try:
        if os.path.exists(filepath):
            os.unlink(filepath)
            logger.info(f"已清理临时文件: {filepath}")
    except Exception as e:
        logger.error(f"清理文件失败: {str(e)}")

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": f"参数错误: {str(exc)}"}
    )

# 加载环境变量
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """生命周期管理"""
    logger.info("Service starting...")
    # 原startup逻辑放在这里
    logger.info("=== 已注册路由 ===")
    for route in app.routes:
        logger.info(f"Path: {route.path} | Methods: {route.methods}")
    yield
    logger.info("Service shutting down...")

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_config=None  # 禁用uvicorn默认日志配置
    ) 