import redis.asyncio as redis
from config import settings
import logging

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        self.redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )

    async def check_connection(self) -> bool:
        """檢查 Redis 連線"""
        try:
            await self.redis.ping()
            return True
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            return False

    async def get_cache(self, key: str) -> str | None:
        """取得快取"""
        try:
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"Redis get failed: {e}")
            return None

    async def set_cache(self, key: str, value: str, ttl: int = settings.REDIS_TTL) -> bool:
        """設定快取"""
        try:
            await self.redis.set(key, value, ex=ttl)
            return True
        except Exception as e:
            logger.error(f"Redis set failed: {e}")
            return False

redis_service = RedisService()
