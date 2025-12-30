#!/bin/bash

# 生產環境部署腳本

echo "Deploying to production..."

# 確保 .env 檔案存在
if [ ! -f .env ]; then
    echo ".env file not found. Creating from .env.example..."
    cp .env.example .env
    echo ".env file created. You can edit it later if needed."
    echo ""
fi

# 停止舊的容器
echo "Stopping old containers..."
docker compose -f docker-compose.yml down

# 建置並啟動
echo "Building and starting containers..."
docker compose -f docker-compose.yml up -d --build

echo "Check logs with: docker compose -f docker-compose.yml logs -f app"