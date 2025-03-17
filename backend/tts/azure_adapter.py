import os
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, ResultReason
import logging
from Crypto.Cipher import AES
import base64
from utils.crypto import AESCipher
import requests
from fastapi import HTTPException
import traceback

logger = logging.getLogger(__name__)

class AzureTTS:
    def __init__(self, azure_key: str, azure_region: str):
        self.azure_key = azure_key
        self.azure_region = azure_region
        self.endpoint = f"https://{azure_region}.tts.speech.microsoft.com/cognitiveservices/v1"

    def _build_headers(self):
        """根据文档要求构建请求头"""
        return {
            "Ocp-Apim-Subscription-Key": self.azure_key,  # 直接使用密钥头
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",  # 文档指定格式
            "User-Agent": "TTS-WebApp/1.0"
        }

    def get_access_token(self):
        token_url = f"https://{self.azure_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
        headers = {
            'Ocp-Apim-Subscription-Key': self.azure_key
        }
        response = requests.post(token_url, headers=headers)
        if response.status_code != 200:
            logger.error(f"获取访问令牌失败: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="获取访问令牌失败")
        return response.text

    async def synthesize(self, text: str, voice: str):
        try:
            # 验证输入参数
            if not text or len(text) > 3000:
                raise ValueError("文本长度需在1-3000字符之间")
                
            ssml = self._build_ssml(text, voice)
            headers = self._build_headers()
            
            # 发送符合文档规范的POST请求
            response = requests.post(
                self.endpoint,
                headers=headers,
                data=ssml.encode("utf-8"),
                timeout=30
            )
            
            # 处理响应
            if response.status_code != 200:
                logger.error(f"Azure API错误 | 状态码: {response.status_code} | 响应头: {response.headers} | 响应体: {response.text[:200]}")
                raise HTTPException(status_code=response.status_code, detail=response.text[:200])
                
            if not response.content:
                logger.error("收到空音频响应")
                raise HTTPException(502, "无效的音频数据")
                
            return response.content
            
        except requests.exceptions.RequestException as e:
            logger.error(f"网络请求异常: {type(e).__name__} - {str(e)}")
            raise HTTPException(503, "服务暂时不可用")
        except HTTPException:
            raise  # 直接抛出已处理的异常
        except Exception as e:
            logger.error(f"未捕获异常: {traceback.format_exc()}")
            raise HTTPException(500, "内部处理错误")

    def _build_ssml(self, text: str, voice_name: str = "en-US-JennyNeural"):
        """根据文档要求生成标准SSML"""
        return f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
    <voice name='{voice_name}'>
        {text}
    </voice>
</speak>""" 