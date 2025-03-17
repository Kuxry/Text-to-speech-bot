import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Azure配置
    AZURE_SPEECH_KEY: str
    AZURE_SPEECH_REGION: str = "eastus"
    
    # 应用配置
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    CORS_ORIGINS: list = ["http://localhost:3000"]
    MAX_TEXT_LENGTH: int = 2000
    RATE_LIMIT: str = "100/minute"

    # 配置类
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False  # 允许不区分大小写
    )

settings = Settings() 