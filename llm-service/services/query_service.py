import httpx
from typing import List, Dict, Any, Optional
from config import settings

class QueryService:
    """查詢處理服務"""
    
    def __init__(self):
        self.backend_url = settings.BACKEND_INTERNAL_URL
    
    async def get_ingredient_by_batch(self, batch_number: str) -> Optional[Dict[str, Any]]:
        """根據批號查詢食材資訊"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.backend_url}/ingredients/{batch_number}",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('data')
                return None
        except Exception as e:
            print(f"Error fetching ingredient: {e}")
            return None
    
    async def get_all_ingredients(self) -> List[Dict[str, Any]]:
        """取得所有食材列表"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.backend_url}/ingredients",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('data', [])
                return []
        except Exception as e:
            print(f"Error fetching ingredients: {e}")
            return []
    
    def build_context_from_ingredients(self, ingredients: List[Dict[str, Any]]) -> str:
        """將食材資訊轉換為 LLM 可理解的上下文"""
        if not ingredients:
            return "目前沒有食材資訊。"
        
        sorted_ingredients = sorted(ingredients, key=lambda x: x.get('batchNumber', ''))
        
        context_parts = []
        for ing in sorted_ingredients:
            info = (
                f"批號: {ing.get('batchNumber')}, "
                f"名稱: {ing.get('name')}, "
                f"產地: {ing.get('origin')}, "
                f"供應商: {ing.get('supplier')}, "
                f"檢驗結果: {ing.get('testResult')}"
            )
            
            test_details = ing.get('testDetails')
            if test_details and isinstance(test_details, dict):
                sorted_details = sorted(test_details.items())
                details_str = "; ".join([f"{key}: {value}" for key, value in sorted_details])
                info += f", 檢驗細節: ({details_str})"
            
            context_parts.append(info)
        
        return "\n".join(context_parts)
    
    def create_system_prompt(self) -> str:
        """建立系統提示詞"""
        return """你是一個食材履歷追溯系統的 AI 助手。你的角色是根據提供的資料，以繁體中文（台灣用語）簡潔、精確地回答問題。

請嚴格遵循以下規則：
1. **精簡扼要**：直接回答問題，省略任何開場白或結尾詞。
2. **僅限繁體中文**：你的世界裡不存在英文。所有回答都必須使用繁體中文。唯一的例外是資料中無法翻譯的專有名詞（例如批號）。
3. **禁止表情符號**：絕不使用任何表情符號。
4. **根據資料**：僅使用提供的「食材資料」作答。若資料不足，就回答「根據現有資料，無法回答此問題」。
5. **清晰格式**：若回答包含多個項目，請使用條列式呈現。

你現在是這個系統的化身，請完全遵循上述指示，並只用繁體中文作答。"""

# 全域實例
query_service = QueryService()
