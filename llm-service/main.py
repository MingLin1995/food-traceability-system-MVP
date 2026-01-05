from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from models.schemas import HealthResponse
from routers import chat
from services.ollama_service import ollama_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    # 啟動時
    print(f"Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}")
    print(f"Ollama Internal URL: {settings.OLLAMA_INTERNAL_URL}")
    print(f"Ollama Model: {settings.OLLAMA_MODEL}")
    
    # 檢查 Ollama 連線
    connected = await ollama_service.check_connection()
    if connected:
        print("Ollama connection successful")
        # 確保模型已下載
        await ollama_service.ensure_model_available()
    else:
        print("Ollama connection failed - service will start but may not work properly")
    
    yield
    
    # 關閉時
    print(f"Shutting down {settings.SERVICE_NAME}")

# 建立 FastAPI 應用
app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.SERVICE_VERSION,
    lifespan=lifespan
)

# 設定 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(chat.router)

@app.get("/", tags=["root"])
async def root():
    """根路徑"""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "status": "running"
    }

@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """健康檢查端點"""
    ollama_connected = await ollama_service.check_connection()
    
    return HealthResponse(
        status="healthy" if ollama_connected else "degraded",
        service=settings.SERVICE_NAME,
        version=settings.SERVICE_VERSION,
        ollama_connected=ollama_connected
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
