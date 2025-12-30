# 食材追溯系統 + AI Agent - 開發流程

> 從原物料追溯到 AI 智能查詢的最小可行性專案（MVP）

## 專案目標

建立一套食材履歷追溯系統，結合小型 LLM 提供智能查詢功能，讓客戶、員工、消費者、供應商都能透過自然語言查詢食材來源、檢驗報告等資訊。

---

## 技術架構

### 技術棧

- **前端**: React + Next.js + Tailwind CSS
- **後端**: NestJS + PostgreSQL + Prisma
- **LLM**: Python (FastAPI) + Ollama
- **容器化**: Docker + Docker Compose
- **未來部署**: Kubernetes

### 服務架構

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │─────▶│   NestJS    │─────▶│ PostgreSQL  │
│  (Frontend) │      │  (Backend)  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Python    │
                     │ LLM Service │
                     └─────────────┘
```

---

## 開發流程

### Phase 1: 資料庫設計與後端 API

**目標**: 建立基礎的食材資料模型與 CRUD API

#### 1.1 設計 Prisma Schema

```prisma
model Ingredient {
  id              String   @id @default(uuid())
  batchNumber     String   @unique @map("batch_number")
  name            String   // 品名：芒果、香蕉
  origin          String   // 產地：台南、屏東
  supplier        String   // 供應商
  productionDate  DateTime @map("production_date")
  expiryDate      DateTime @map("expiry_date")
  testResult      String   @map("test_result") // 合格/不合格
  testDetails     Json?    @map("test_details") // JSON 格式的詳細檢驗數據
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("ingredients")
}
```

#### 1.2 實作 Ingredients API

**重點**: CRUD 操作（Create, Read, Update, Delete）

- `GET /ingredients` - 列出所有食材
- `GET /ingredients/:batchNumber` - 根據批號查詢
- `POST /ingredients` - 新增食材
- `PUT /ingredients/:id` - 更新食材
- `DELETE /ingredients/:id` - 刪除食材

#### 1.3 塞入測試資料

seed script:

```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.ingredient.createMany({
    data: [
      {
        batchNumber: 'MG20241201-001',
        name: '愛文芒果',
        origin: '台南玉井',
        supplier: '玉井果農合作社',
        productionDate: new Date('2024-12-01'),
        expiryDate: new Date('2024-12-15'),
        testResult: '合格',
        testDetails: {
          pesticide: '0.01ppm',
          heavyMetal: '未檢出',
          bacteria: '陰性',
        },
      },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

---

### Phase 2: 前端開發

**目標**: 建立查詢介面與管理後台

#### 2.1 開發消費者查詢頁面

**功能**:

- 輸入批號查詢食材資訊
- 顯示產地、日期、檢驗結果
- 美觀的卡片式 UI

#### 2.2 開發管理後台

**功能**:

- 列表顯示所有食材
- 新增/編輯食材表單
- 刪除功能

#### 2.3 API 串接

使用 `fetch` 或 `axios` 串接後端 API

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getIngredientByBatch(batchNumber: string) {
  const res = await fetch(`${API_URL}/ingredients/${batchNumber}`);
  return res.json();
}
```

---

### Phase 3: LLM 服務整合

**目標**: 實作 AI 對話查詢功能

#### 3.1 初始化 Python 專案

```bash
cd llm-service
mkdir llm-service && cd llm-service

# requirements.txt
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
ollama==0.1.0  # 如果用 Ollama
```

#### 3.2 建立 FastAPI 服務

**llm-service/main.py**

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    question: str
    batch_number: str | None = None

@app.post("/chat")
async def chat(request: ChatRequest):
    # 1. 從資料庫查詢相關資料
    # 2. 組合 prompt 給 LLM
    # 3. 返回 LLM 回應
    return {"answer": "這批芒果農藥殘留為 0.01ppm，符合標準"}
```

#### 3.3 整合資料庫查詢

使用 SQLAlchemy 連接 PostgreSQL，讓 LLM 能取得食材資料

#### 3.4 選擇 LLM 方案

**方案 A: Ollama（本地 LLM）**

```python
import requests

def get_llm_response(question, ingredient_data):
    prompt = f"食材資料：{ingredient_data}\n問題：{question}"

    response = requests.post('http://localhost:11434/api/generate', json={
        'model': 'llama3.2',
        'prompt': prompt
    })
    return response.json()['response']
```

#### 3.5 在 NestJS 中呼叫 LLM 服務

```typescript
// backend/src/chat/chat.service.ts
async askLLM(question: string, batchNumber?: string) {
  const response = await fetch('http://llm-service:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, batch_number: batchNumber })
  });
  return response.json();
}
```

#### 3.6 前端對話介面

**app/chat/page.tsx**

- 簡單的聊天 UI
- 顯示對話記錄
- 輸入框 + 送出按鈕

---

### Phase 4: 測試與優化

#### 4.1 功能測試

- [ ] 批號查詢正常運作
- [ ] 管理後台 CRUD 正常
- [ ] AI 對話回應正確

#### 4.2 資料驗證

- [ ] 批號格式檢查
- [ ] 日期邏輯驗證（生產日期 < 到期日期）
- [ ] 必填欄位檢查

#### 4.3 錯誤處理

- [ ] API 錯誤回傳適當訊息
- [ ] 前端顯示友善錯誤提示
- [ ] LLM 服務異常時的降級處理

---

### Phase 5: 準備 Kubernetes 部署

**目標**: 將 Docker Compose 專案轉換為 K8s

---

## 注意事項

### 開發階段

1. **先跑起來再優化**: 不要一開始就追求完美，先讓功能運作
2. **頻繁測試**: 每完成一個小功能就測試，避免積累 bug
3. **版本控制**: 記得 commit，寫清楚的 commit message

### K8s 階段

1. **先在 Docker Compose 測試生產版 Dockerfile**: 確保 build 沒問題
2. **使用 Minikube 本地測試**: 不要急著上雲端
3. **一次部署一個服務**: 先讓 backend + postgres 跑起來，再加其他服務
4. **善用 kubectl logs**: 出問題先看 logs

### LLM 選擇建議

- **學習階段**: 用 Ollama（理解本地 LLM 運作）
- **生產階段**: 用 Ollama

---

## 下一步

完成 MVP 後可以考慮：

1. **功能擴充**

   - 檔案上傳（檢驗報告 PDF）
   - 多語言支援
   - 行動版 App（React Native）

2. **技術優化**

   - Redis 快取 LLM 回應
   - 使用 RAG（Retrieval-Augmented Generation）提升 LLM 準確度
   - 實作 SSO 登入

3. **K8s 進階**

   - 設定 Horizontal Pod Autoscaler（自動擴展）
   - 使用 Helm 管理部署
   - CI/CD pipeline（GitHub Actions）
   - 部署到雲端（GKE、EKS、AKS）

4. **監控與可觀測性**
   - Prometheus + Grafana
   - 日誌收集（ELK Stack）
   - Distributed Tracing（Jaeger）

---

## 參考資源

- [NestJS 官方文件](https://docs.nestjs.com/)
- [Next.js 官方文件](https://nextjs.org/docs)
- [Prisma 官方文件](https://www.prisma.io/docs)
- [Kubernetes 官方教學](https://kubernetes.io/docs/tutorials/)
- [FastAPI 官方文件](https://fastapi.tiangolo.com/)
- [Ollama 文件](https://ollama.ai/docs)
