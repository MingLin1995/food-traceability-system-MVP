# Food Traceability System (食材履歷追溯系統)

這是一個基於區塊鏈概念（未來擴充）與 AI 智能查詢的食材履歷追溯系統。
提供消費者查詢食材來源、檢驗報告，並提供管理員後台進行數據管理。

## 系統架構

本專案採用 Monorepo 結構，包含前後端與基礎設施：

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: NestJS + Prisma + PostgreSQL
- **Infrastructure**: Docker Compose

## 目錄結構

```
food-traceability-system/
├── backend/                # NestJS 後端應用 (獨立 package.json)
├── frontend/               # Next.js 前端應用 (獨立 package.json)
├── docker-compose.dev.yml  # 開發環境 Docker 配置
├── dev.sh                  # 啟動腳本
├── docs/                   # 專案文檔
└── 开发流程.md              # 開發進度規劃
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
# 啟動系統 (包含 Database, Backend, Frontend)
./dev.sh
# 或
bun run dev
```

啟動後，您可以訪問：

- **前端頁面 (Consumer)**: [http://localhost:3001](http://localhost:3001)
- **管理後台 (Admin)**: [http://localhost:3001/admin](http://localhost:3001/admin)
- **後端 API**: [http://localhost:3000](http://localhost:3000)
- **Swagger API 文件**: [http://localhost:3000/apidoc](http://localhost:3000/apidoc)

## 功能說明

### 1. 消費者查詢 (Consumer)

- 輸入批號 (例如: `MG20241201-001`) 查詢食材詳細資訊。
- 顯示資訊：品名、產地、供應商、生產/有效日期、檢驗結果。

### 2. 管理後台 (Admin)

- 查看所有食材列表。
- 新增食材批號資料。
- 刪除錯誤資料。
- 預設帳號: 無 (目前為開放後台，未來將整合後端 Auth)。

### 3. API 服務

- `GET /ingredients`: 取得列表
- `GET /ingredients/:batchNumber`: 依批號查詢
- `POST /ingredients`: 新增資料
- `DELETE /ingredients/:id`: 刪除資料

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

---

**專案狀態**: MVP Phase 2 Update (Frontend Integrated)
