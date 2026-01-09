# Food Traceability System (食材履歷追溯系統)

這是一個基於區塊鏈概念（未來擴充）與 AI 智能查詢的食材履歷追溯系統。
提供消費者查詢食材來源、檢驗報告，並提供管理員後台進行數據管理。

## 系統架構

本專案採用 Monorepo 結構，包含前後端、AI 服務與基礎設施：

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: NestJS + Prisma + PostgreSQL
- **LLM Service**: Python + FastAPI + Ollama (本地 AI 模型)
- **Cache**: Redis (快取 AI 回應)
- **Infrastructure**: Docker Compose & Kubernetes (Minikube)

### 服務架構圖

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│ LLM Service │
│  (Next.js)  │      │  (NestJS)   │      │  (FastAPI)  │
│  Port 3001  │      │  Port 3000  │      │  Port 8001  │
└─────────────┘      └──────┬──────┘      └──────┬─┬────┘
                            │                    │ │
                     ┌──────▼──────┐             │ │
                     │  PostgreSQL │             │ │
                     │  Port 5432  │      ┌──────▼─▼────┐
                     └─────────────┘      │   Red is    │
                                          │  Port 6379  │
                                          └─────────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │   Ollama    │
                                          │  Port 11434 │
                                          └─────────────┘
```

## 目錄結構

```
food-traceability-system/
├── backend/                # NestJS 後端應用 (獨立 package.json)
├── frontend/               # Next.js 前端應用 (獨立 package.json)
├── llm-service/            # Python FastAPI LLM 服務 (獨立 requirements.txt)
├── docker-compose.dev.yml  # 開發環境 Docker 配置
├── docker-compose.yml      # 生產環境 Docker 配置
├── dev.sh                  # 開發環境啟動腳本
├── deploy.sh               # 生產環境部署腳本
└── Development-process.md  # 開發進度規劃
```

## Monorepo 與版本管理

本專案採用 Monorepo 架構，根目錄負責編排 (Orchestration)，而前後端各自維護依賴與版本。

### 1. 為什麼有三個 package.json?

- **根目錄 (`./package.json`)**:

  - 用途：管理全域腳本 (如 `dev`, `deploy`) 與開發工具 (Prettier)。
  - 不含業務邏輯。

- **後端 (`backend/package.json`)**:

  - 用途：管理 NestJS、Prisma、資料庫連線等後端依賴。

- **前端 (`frontend/package.json`)**:
  - 用途：管理 React、Next.js、Tailwind CSS 等前端依賴。

### 2. 如何切換資料夾並管理版本?

每個子專案都有獨立的版本號。若要更新特定服務的版本（例如前端更新到 v0.1.1）：

```bash
# 進入前端目錄
cd frontend

# 使用 npm version 更新版本號 (會自動修改 package.json 並建立 Git Tag)
npm version patch  # v0.1.0 -> v0.1.1
# npm version minor # v0.1.0 -> v0.2.0
# npm version major # v0.1.0 -> v1.0.0

# 檢查新版本
cat package.json | grep version
```

### 3. 配置檔案最佳實踐

- **環境變數 (.env)**:

  - 統一放在**根目錄**。
  - 原因：Docker Compose 需要在啟動時將環境變數注入到各個容器中。若分散在子目錄，orchestration 會變得複雜且難以同步。

- **忽略檔 (.gitignore / .dockerignore)**:
  - 建議放在**各個子目錄** (`backend/`, `frontend/`)。
  - 原因：Docker 建置時 context 是設為子目錄 (如 `context: ./backend`)，因此它只會讀取該目錄下的 `.dockerignore`。這樣可以確保構建高效且乾淨。

## 快速開始

### 前置需求

- Docker & Docker Compose
- Bun (推薦) 或 Node.js

### 啟動開發環境

我們提供了一鍵啟動腳本，會自動處理容器建置與服務啟動：

```bash
# 啟動系統 (包含 Database, Backend, Frontend, LLM Service, Ollama)
./dev.sh
# 或
bun run dev
```

啟動後，您可以訪問：

- **前端頁面 (Consumer)**: [http://localhost:3001](http://localhost:3001)
- **管理後台 (Admin)**: [http://localhost:3001/admin](http://localhost:3001/admin)
- **後端 API**: [http://localhost:3000](http://localhost:3000)
- **Swagger API 文件 (Backend)**: [http://localhost:3000/apidoc](http://localhost:3000/apidoc)
- **LLM Service API**: [http://localhost:8001](http://localhost:8001)
- **LLM Service 文件**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **Ollama API**: [http://localhost:11434](http://localhost:11434)

## Kubernetes 部署 (Minikube)

本專案支援在 Kubernetes 環境中運行。詳細操作請參考 [Kubernetes (K8s) 學習筆記](https://medium.com/@MingLin1995/kubernetes-k8s-%E5%BE%9E%E8%A7%80%E5%BF%B5%E5%88%B0%E5%AF%A6%E6%88%B0-%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-f99b31c31cf3)。

### 一鍵部署

執行以下腳本，會自動指向 Minikube Docker daemon 並編譯、佈署所有服務：

```bash
./scripts/k8s-deploy.sh
```

### 監控模型下載進度 (必備步驟)

由於 **Llama2** 模型檔案較大 (3.8GB)，首次啟動時 `llm-service` 會在背景自動下載模型。開發者**務必**執行以下指令確認下載進度：

```bash
# 持續觀察下載進度
kubectl logs -l app=llm-service -f
```

**注意**：請等到日誌顯示 `Model llama2 pulled successfully` 後，再進行 AI 功能的測試。若在下載完成前呼叫，API 會傳回 503 錯誤。

### 存取位址

部署後可透過 Minikube IP 及其 NodePort 存取：

- **前端頁面**: `http://$(minikube ip):30001`
- **後端 API**: `http://$(minikube ip):30000`

## 功能說明

### 1. 消費者查詢 (Consumer)

- 輸入批號 (例如: `MG20241201-001`) 查詢食材詳細資訊。
- 顯示資訊：品名、產地、供應商、生產/有效日期、檢驗結果。

### 2. AI 智能查詢 (AI Chat)

- 使用自然語言詢問食材相關問題
- 例如：「請問有哪些食材？」、「芒果的檢驗結果如何？」
- 基於本地 Ollama LLM 模型（llama2）提供智能回應
- 自動從資料庫取得最新食材資訊作為上下文

### 3. 管理後台 (Admin)

- 查看所有食材列表
- 新增、更新、刪除食材批號資料
- 需要登入（預設帳號請參考 `.env` 中的 `ADMIN_ACCOUNT_*` 設定）

### 4. API 服務

#### Backend API (NestJS)

- `GET /ingredients`: 取得食材列表
- `GET /ingredients/:batchNumber`: 依批號查詢
- `POST /ingredients`: 新增資料
- `PUT /ingredients/:id`: 更新資料
- `DELETE /ingredients/:id`: 刪除資料
- `POST /auth/login`: 管理員登入
- `POST /llm/chat`: AI 聊天（透過 LLM Service）
- `GET /llm/health`: LLM 服務健康檢查

#### LLM Service API (FastAPI)

- `POST /chat/`: AI 聊天端點
- `GET /health`: 健康檢查（包含 Ollama 連線狀態）
- `GET /`: 服務資訊
- `GET /docs`: FastAPI 自動生成的 API 文件（Swagger UI）

## 常用指令

```bash
# 查看日誌
bun run docker:dev:logs

# 停止服務
bun run docker:dev:down

# 重建並啟動
bun run docker:dev:build
```

## 開發指南

### 資料庫 (Prisma)

若修改了 `backend/prisma/schema.prisma`，請執行：

```bash
# 進入後端容器執行 migration
docker compose -f docker-compose.dev.yml exec app bunx prisma migrate dev
```

### 前端開發

前端程式碼位於 `frontend/`，修改後存檔即時生效 (HMR)。

### LLM Service 開發

LLM Service 使用 Python + FastAPI，程式碼位於 `llm-service/`。

```bash
# 查看 LLM Service 日誌
docker logs food-traceability-llm-dev -f

# 重啟 LLM Service
docker compose -f docker-compose.dev.yml restart llm-service

# 測試 LLM Service
curl -X POST http://localhost:8001/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "請問有哪些食材？"}'
```

**注意事項：**

- 首次啟動時，Ollama 會自動下載 `llama2` 模型（約 3.8GB），需要一些時間
- LLM 推理需要較多記憶體，建議至少 8GB RAM
- 模型載入後的首次查詢可能需要 30-60 秒

---

**專案狀態**: MVP Phase 3 (LLM Service Integrated with Redis Caching)
