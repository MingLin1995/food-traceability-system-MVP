from pydantic_settings import BaseSettings
from typing import Union

class Settings(BaseSettings):
    # Service Configuration
    SERVICE_NAME: str = "LLM Service"
    SERVICE_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    
    # PORT: 容器內部監聽端口（固定為 8000）
    PORT: int = 8000
    
    # Ollama Configuration
    # OLLAMA_INTERNAL_URL: Ollama 服務的內部網路位址
    OLLAMA_INTERNAL_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "llama2"
    
    # BACKEND_INTERNAL_URL: Backend 服務的內部網路位址
    BACKEND_INTERNAL_URL: str = "http://app:3000"
    

    # Redis Configuration
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_TTL: int = 3600  # 1 hour default
    
    # CORS Configuration
    # CORS_ORIGINS: 允許的跨域來源（逗號分隔）
    CORS_ORIGINS: str = "http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

