from typing import List, Optional
from pydantic import BaseModel, Field

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    voice: str = "en-US-AriaNeural"
    azure_key: str = Field(..., min_length=32, max_length=128)
    azure_region: str = Field(..., pattern=r"^[a-z-]+$") 