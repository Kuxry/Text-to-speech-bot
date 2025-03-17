from pydantic import BaseModel, Field, field_validator

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=3000)
    voice: str = Field(default="en-US-JennyNeural", pattern=r"^[a-z]{2}-[A-Z]{2}-[a-zA-Z]+Neural$")
    azure_key: str = Field(..., min_length=32, max_length=128)
    azure_region: str = Field(..., pattern=r"^[a-z]+$")
    
    @field_validator("text")
    def validate_text(cls, v):
        forbidden_chars = {"<", ">", "&"}
        if any(c in v for c in forbidden_chars):
            raise ValueError("文本包含非法字符")
        return v 