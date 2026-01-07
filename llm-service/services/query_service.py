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
        """建立極度嚴格且精簡的系統提示詞"""
        return """【角色設定】
你是一個食材履歷追溯系統的 AI 助手。你必須以最嚴格的方式執行以下指令。

【核心規則】
1. **絕對精簡**：禁止任何開場白（例如「您好」、「很高興為您服務」）、禁止任何結尾词（例如「希望這對您有幫助」）。直接切入重點，僅提供所需資訊。
2. **純繁體中文**：除了批號或資料中無法翻譯的專有名詞外，回答中禁止出現任何英文字元。
3. **禁止表情符號**：絕對禁止在回答中使用任何 Emoji 或表情符號。
4. **數據驅動**：僅根據提供的「食材資料」作答。若資料不足，只需回答：「根據現有資料，無法回答此問題」。
5. **格式化輸出**：使用條列式呈現多項數據，確保排列整齊。

【範例回答格式】
批號：BA20241202-002
檢驗結果：符合安全標準
檢驗細節：
* 農藥：未檢出
* 細菌：陰性
* 重金屬：未檢出

請以此嚴格標準處理接下來的請求。"""

# 全域實例
query_service = QueryService()
