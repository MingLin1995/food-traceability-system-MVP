#!/bin/bash
set -e

echo "Pointing shell to Minikube's Docker daemon..."
eval $(minikube docker-env)

echo "Building images (this may take a while)..."
echo "   - Building Backend..."
docker build -t food-traceability-backend:latest -f backend/Dockerfile.prod backend/
echo "   - Building Frontend..."
# Note: In a real scenario, we might need to inject NEXT_PUBLIC_API_URL here
docker build -t food-traceability-frontend:latest -f frontend/Dockerfile.prod frontend/
echo "   - Building LLM Service..."
docker build -t food-traceability-llm:latest -f llm-service/Dockerfile.prod llm-service/

echo "Deploying to Kubernetes..."
kubectl apply -f k8s/base/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/ollama/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/llm-service/
kubectl apply -f k8s/frontend/

echo "Restarting deployments to pick up new images..."
kubectl rollout restart deployment backend
kubectl rollout restart deployment frontend
kubectl rollout restart deployment llm-service

echo "Deployment complete!"
echo "Run 'kubectl get pods' to check status."
echo "Frontend URL: http://$(minikube ip):30001"
echo "Backend URL: http://$(minikube ip):30000"
