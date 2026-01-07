from ollama import AsyncClient
from typing import List, Dict, Any
from config import settings

class OllamaService:
    """Ollama LLM 服務封裝"""
    
    def __init__(self):
        self.client = AsyncClient(host=settings.OLLAMA_INTERNAL_URL)
        self.model = settings.OLLAMA_MODEL
    
    async def check_connection(self) -> bool:
        """檢查 Ollama 連線狀態"""
        try:
            models = await self.client.list()
            return True
        except Exception as e:
            print(f"Ollama connection failed: {e}")
            return False
    
    async def ensure_model_available(self) -> bool:
        """確保模型已下載"""
        try:
            models = await self.client.list()
            model_names = [m['name'] for m in models.get('models', [])]
            
            if self.model not in model_names:
                print(f"Pulling model {self.model}...")
                stream = await self.client.pull(self.model, stream=True)
                async for progress in stream:
                    print(f"Pull progress: {progress.get('status', '')} {progress.get('completed', 0)}/{progress.get('total', 1)}")
                print(f"Model {self.model} pulled successfully")
            return True
        except Exception as e:
            print(f"Failed to ensure model availability: {e}")
            return False
    
    async def generate_response(
        self, 
        prompt: str, 
        system_prompt: str = None,
        history: List[Dict[str, str]] = None,
        temperature: float = 0.7
    ) -> str:
        """生成 LLM 回應"""
        try:
            messages = []
            
            # 1. 加入系統提示詞
            if system_prompt:
                messages.append({
                    'role': 'system',
                    'content': system_prompt
                })
            
            # 2. 加入對話歷史
            if history:
                messages.extend(history)
            
            # 3. 加入當前使用者問題
            messages.append({
                'role': 'user',
                'content': prompt
            })
            
            response = await self.client.chat(
                model=self.model,
                messages=messages,
                options={
                    'temperature': temperature,
                }
            )
            
            return response['message']['content']
        
        except Exception as e:
            print(f"Error generating response: {e}")
            raise Exception(f"LLM generation failed: {str(e)}")

# 全域實例
ollama_service = OllamaService()
