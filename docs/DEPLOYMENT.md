# Vasundhara Deployment Guide

This guide covers different deployment options for the Vasundhara food waste management system.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for production)
- Domain name and SSL certificates
- MongoDB and Redis instances (for production)

## Local Development

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/vasundhara/vasundhara.git
cd vasundhara
```

2. Run the setup script:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:5000
- ML Service: http://localhost:8000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Manual Setup

1. Start the infrastructure services:
```bash
docker-compose up -d mongodb redis rabbitmq
```

2. Start the ML service:
```bash
cd vasundhara-ml
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. Start the API service:
```bash
cd vasundhara-api
npm install
npm run dev
```

4. Start the frontend:
```bash
cd vasundhara-frontend
npm install
npm run dev
```

## Docker Deployment

### Using Docker Compose

1. Configure environment variables:
```bash
cp vasundhara-api/env.example vasundhara-api/.env
cp vasundhara-ml/env.example vasundhara-ml/.env
cp vasundhara-frontend/env.example vasundhara-frontend/.env.local
```

2. Update the configuration in `.env` files

3. Start all services:
```bash
docker-compose up -d
```

4. Check service status:
```bash
docker-compose ps
```

5. View logs:
```bash
docker-compose logs -f
```

### Individual Services

#### ML Service
```bash
cd vasundhara-ml
docker build -t vasundhara/ml-service .
docker run -p 8000:8000 vasundhara/ml-service
```

#### API Service
```bash
cd vasundhara-api
docker build -t vasundhara/api-service .
docker run -p 5000:5000 vasundhara/api-service
```

#### Frontend
```bash
cd vasundhara-frontend
docker build -t vasundhara/frontend .
docker run -p 3000:3000 vasundhara/frontend
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.x installed
- Ingress controller (nginx recommended)
- cert-manager for SSL certificates

### Using Helm Charts

1. Add the Helm repository:
```bash
helm repo add vasundhara https://charts.vasundhara.app
helm repo update
```

2. Install Vasundhara:
```bash
helm install vasundhara vasundhara/vasundhara \
  --namespace vasundhara \
  --create-namespace \
  --set mongodb.auth.password=your-secure-password \
  --set apiService.env.JWT_SECRET=your-jwt-secret
```

3. Check deployment status:
```bash
kubectl get pods -n vasundhara
kubectl get services -n vasundhara
```

### Manual Kubernetes Deployment

1. Create namespace:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Deploy infrastructure:
```bash
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml
```

3. Deploy services:
```bash
kubectl apply -f k8s/ml-service.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/frontend.yaml
```

4. Configure ingress:
```bash
kubectl apply -f k8s/ingress.yaml
```

## Production Deployment

### Environment Setup

1. **Database**: Use managed MongoDB Atlas or self-hosted MongoDB cluster
2. **Cache**: Use managed Redis (AWS ElastiCache, Google Cloud Memorystore)
3. **Storage**: Use S3-compatible storage for media files
4. **Monitoring**: Set up Prometheus, Grafana, and logging
5. **SSL**: Configure SSL certificates with Let's Encrypt

### Configuration

#### Environment Variables

**API Service:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb://username:password@host:port/database
REDIS_URI=redis://username:password@host:port
ML_SERVICE_URL=http://ml-service:8000
JWT_SECRET=your-super-secure-jwt-secret
EMAIL_API_KEY=your-sendgrid-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
STRIPE_SECRET_KEY=your-stripe-secret-key
```

**ML Service:**
```bash
MONGODB_URL=mongodb://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
API_SERVICE_URL=http://api-service:5000
S3_BUCKET=your-s3-bucket
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
```

**Frontend:**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.vasundhara.app
NEXT_PUBLIC_ML_SERVICE_URL=https://ml.vasundhara.app
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Scaling

#### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-service-hpa
  namespace: vasundhara
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Database Scaling

- **MongoDB**: Use replica sets for read scaling
- **Redis**: Use Redis Cluster for horizontal scaling
- **Connection Pooling**: Configure appropriate connection pool sizes

### Monitoring and Logging

#### Prometheus Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: vasundhara
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'vasundhara-api'
      static_configs:
      - targets: ['api-service:5000']
    - job_name: 'vasundhara-ml'
      static_configs:
      - targets: ['ml-service:8000']
```

#### Grafana Dashboards

Import the provided Grafana dashboards for monitoring:
- Application metrics
- Database performance
- Infrastructure metrics
- Business metrics

### Security

#### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: vasundhara-network-policy
  namespace: vasundhara
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: vasundhara
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: vasundhara
```

#### Pod Security Policies

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: vasundhara-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### Backup and Recovery

#### Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/mongodb

# Redis backup
redis-cli --rdb /backup/redis/dump.rdb
```

#### Automated Backups

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: vasundhara
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mongodb-backup
            image: mongo:7.0
            command:
            - mongodump
            - --uri=mongodb://username:password@mongodb:27017/vasundhara
            - --out=/backup
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### Troubleshooting

#### Common Issues

1. **Service not starting**: Check logs and resource limits
2. **Database connection issues**: Verify connection strings and network policies
3. **Memory issues**: Adjust resource limits and check for memory leaks
4. **SSL certificate issues**: Verify cert-manager configuration

#### Debugging Commands

```bash
# Check pod status
kubectl get pods -n vasundhara

# View pod logs
kubectl logs -f deployment/api-service -n vasundhara

# Describe pod for events
kubectl describe pod <pod-name> -n vasundhara

# Check service endpoints
kubectl get endpoints -n vasundhara

# Port forward for local debugging
kubectl port-forward svc/api-service 5000:5000 -n vasundhara
```

### Performance Optimization

#### Resource Optimization

- Set appropriate CPU and memory limits
- Use node affinity for better resource utilization
- Implement proper caching strategies
- Optimize database queries and indexes

#### CDN Configuration

- Use CloudFlare or AWS CloudFront for static assets
- Configure proper cache headers
- Implement image optimization

### Maintenance

#### Rolling Updates

```bash
# Update API service
kubectl set image deployment/api-service api-service=vasundhara/api-service:v1.1.0 -n vasundhara

# Check rollout status
kubectl rollout status deployment/api-service -n vasundhara

# Rollback if needed
kubectl rollout undo deployment/api-service -n vasundhara
```

#### Database Maintenance

- Regular index optimization
- Monitor slow queries
- Implement connection pooling
- Regular backup verification

## Support

For deployment support:
- Documentation: https://docs.vasundhara.app
- GitHub Issues: https://github.com/vasundhara/issues
- Email: support@vasundhara.app
