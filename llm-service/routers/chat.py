from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.ollama_service import ollama_service
from services.query_service import query_service
from services.redis_service import redis_service
import hashlib

def generate_cache_key(prompt: str, history: list, model: str, context: str) -> str:
    """生成快取鍵"""
    content = f"{prompt}:{model}:{context}"
    return f"llm_cache:{hashlib.sha256(content.encode()).hexdigest()}"

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    處理聊天請求
    
    使用者可以詢問關於食材的問題，系統會：
    1. 從後端 API 取得食材資料
    2. 將資料轉換為 LLM 可理解的上下文
    3. 使用 Ollama 生成回應
    """
    try:
        # 取得所有食材資料作為上下文
        ingredients = await query_service.get_all_ingredients()
        
        # 建立上下文
        context = query_service.build_context_from_ingredients(ingredients)
        
        # 建立系統提示詞，並將食材資料作為上下文注入
        system_prompt = query_service.create_system_prompt()
        system_prompt_with_context = f"{system_prompt}\n\n食材資料：\n{context}"
        
        # 使用者問題
        user_prompt = request.message
        
        # 生成回應
        history_msgs = []
        if request.conversation_history:
            history_msgs = [{"role": m.role, "content": m.content} for m in request.conversation_history]

        # 檢查快取
        cache_key = generate_cache_key(user_prompt, history_msgs, ollama_service.model, context)
        cached_response = await redis_service.get_cache(cache_key)
        
        if cached_response:
            return ChatResponse(
                response=cached_response,
                model=ollama_service.model
            )

        response_text = await ollama_service.generate_response(
            prompt=user_prompt,
            system_prompt=system_prompt_with_context,
            history=history_msgs,
            temperature=0.7
        )
        
        # 寫入快取
        await redis_service.set_cache(cache_key, response_text)
        
        return ChatResponse(
            response=response_text,
            model=ollama_service.model
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )
