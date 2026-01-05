from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    """聊天訊息模型"""
    role: str = Field(
        ...,
        description="訊息角色: user, assistant, system",
        examples=["user"]
    )
    content: str = Field(
        ...,
        description="訊息內容",
        examples=["請問有哪些食材？"]
    )

class ChatRequest(BaseModel):
    """聊天請求模型"""
    message: str = Field(
        ...,
        description="使用者當前輸入的訊息",
        min_length=1,
        examples=["芒果的檢驗結果為何？"]
    )
    conversation_history: Optional[List[ChatMessage]] = Field(
        default=None,
        description="對話歷史（不含當前這筆使用者訊息）"
    )

class ChatResponse(BaseModel):
    """聊天回應模型"""
    response: str = Field(..., description="AI 回應內容")
    model: str = Field(..., description="使用的模型名稱")
    
class HealthResponse(BaseModel):
    """健康檢查回應"""
    status: str = Field(..., description="服務狀態", examples=["healthy"])
    service: str = Field(..., description="服務名稱", examples=["llm-service"])
    version: str = Field(..., description="版本號", examples=["0.1.0"])
    ollama_connected: bool = Field(..., description="是否成功連接到 Ollama", examples=[True])
