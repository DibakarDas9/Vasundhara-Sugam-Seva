# Vasundhara - AI-Powered Food Waste Management System

## 🎯 Project Overview

Vasundhara is a comprehensive, production-ready full-stack web application that reduces household and retail food waste using predictive AI, meal planning, expiry alerts, gamification, and surplus sharing. The system is built with modern technologies and follows best practices for scalability, security, and maintainability.

## 🏗️ Architecture

### Microservices Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Service   │    │   ML Service    │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis Cache   │    │   MongoDB       │    │   RabbitMQ      │
│   Port: 6379    │    │   Port: 27017   │    │   Port: 5672    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend (vasundhara-frontend)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + styled-components
- **Animations**: Framer Motion
- **State Management**: React Query + Context API
- **UI Components**: Custom component library
- **PWA**: Service workers for offline support
- **Charts**: Recharts for data visualization

#### API Service (vasundhara-api)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session management
- **Authentication**: JWT with refresh tokens
- **Validation**: express-validator + Joi
- **Documentation**: Swagger/OpenAPI
- **Background Jobs**: Bull Queue with Redis

#### ML Service (vasundhara-ml)
- **Framework**: FastAPI with Python
- **ML Libraries**: LightGBM, XGBoost, scikit-learn
- **Computer Vision**: OpenCV, PIL, pytesseract
- **NLP**: spaCy, transformers
- **Caching**: Redis for model predictions
- **Documentation**: FastAPI auto-generated docs

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes + Helm Charts
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack
- **Security**: Helmet, rate limiting, CORS

## 🚀 Key Features

### Core Features
- **Smart Inventory Management**: Manual entry, barcode scanning, OCR receipt parsing
- **AI-Powered Expiry Prediction**: ML models predict food spoilage with confidence scores
- **Intelligent Meal Planning**: Prioritizes soon-to-expire items with recipe suggestions
- **Multi-Channel Alerts**: Push notifications, email, SMS for expiry warnings
- **Surplus Marketplace**: Local food sharing with map-based listings
- **Gamification**: Points, badges, streaks, leaderboards for sustainable behavior
- **Analytics Dashboard**: Waste trends, cost savings, CO₂ impact tracking

### Advanced Features
- **Secure Authentication**: JWT with refresh tokens, OAuth2 integration
- **Multi-Tenant Architecture**: Support for households and retail partners
- **Privacy-First Design**: GDPR compliance, data export, opt-in ML
- **PWA Support**: Offline-first with service workers
- **Accessibility**: ARIA compliance, keyboard navigation
- **Internationalization**: Multi-language support

## 📁 Project Structure

```
vasundhara/
├── vasundhara-frontend/          # Next.js React application
│   ├── src/
│   │   ├── app/                  # App router pages
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # Utility functions
│   │   └── types/                # TypeScript type definitions
│   ├── public/                   # Static assets
│   ├── Dockerfile
│   └── package.json
├── vasundhara-api/               # Express.js API service
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   ├── controllers/          # Route controllers
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # MongoDB schemas
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   └── utils/                # Utility functions
│   ├── Dockerfile
│   └── package.json
├── vasundhara-ml/                # FastAPI ML service
│   ├── app/
│   │   ├── core/                 # Core configuration
│   │   ├── models/               # Pydantic models
│   │   ├── services/             # ML services
│   │   └── utils/                # Utility functions
│   ├── models/                   # Trained ML models
│   ├── data/                     # Training data
│   ├── Dockerfile
│   └── requirements.txt
├── k8s/                          # Kubernetes manifests
├── helm/                         # Helm charts
├── docs/                         # Documentation
├── scripts/                      # Utility scripts
├── docker-compose.yml            # Local development
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- MongoDB
- Redis

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd vasundhara
```

2. **Run the setup script**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:5000
- ML Service: http://localhost:8000
- API Docs: http://localhost:5000/api-docs
- ML Docs: http://localhost:8000/docs

### Manual Setup

1. **Start infrastructure services**
```bash
docker-compose up -d mongodb redis rabbitmq
```

2. **Start ML service**
```bash
cd vasundhara-ml
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **Start API service**
```bash
cd vasundhara-api
npm install
npm run dev
```

4. **Start frontend**
```bash
cd vasundhara-frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

Each service has its own environment configuration:

- **API Service**: `vasundhara-api/.env`
- **ML Service**: `vasundhara-ml/.env`
- **Frontend**: `vasundhara-frontend/.env.local`

Copy the respective `.env.example` files and configure with your values.

### Database Setup

The MongoDB initialization script (`scripts/mongo-init.js`) creates:
- Database: `vasundhara`
- Collections: users, households, fooditems, recipes, alerts, etc.
- Indexes: Optimized for query performance
- Validation: Schema validation rules

## 🚀 Deployment

### Docker Compose (Recommended for Development)
```bash
docker-compose up -d
```

### Kubernetes (Production)
```bash
# Using Helm
helm install vasundhara ./helm/vasundhara

# Or using kubectl
kubectl apply -f k8s/
```

### Cloud Deployment
- **AWS**: EKS + RDS + ElastiCache
- **Google Cloud**: GKE + Cloud SQL + Memorystore
- **Azure**: AKS + Cosmos DB + Redis Cache

## 📊 ML Model Contract

### Input Schema
```json
{
  "product_name": "Strawberries",
  "category": "berries",
  "purchase_date": "2025-10-15",
  "storage": "fridge",
  "packaging": "clamshell",
  "household_usage_rate_per_week": 0.5,
  "temperature_c": 4
}
```

### Output Schema
```json
{
  "predicted_expiry_date": "2025-10-19",
  "confidence": 0.82,
  "spoilage_curve": [
    {"date": "2025-10-16", "prob_spoiled": 0.02},
    {"date": "2025-10-17", "prob_spoiled": 0.06},
    {"date": "2025-10-18", "prob_spoiled": 0.18},
    {"date": "2025-10-19", "prob_spoiled": 0.48},
    {"date": "2025-10-20", "prob_spoiled": 0.74}
  ],
  "factors": {...},
  "recommendations": [...],
  "model_version": "1.0.0",
  "prediction_timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

### Running Tests
```bash
# API Service
cd vasundhara-api
npm test

# ML Service
cd vasundhara-ml
pytest

# Frontend
cd vasundhara-frontend
npm test
```

### Test Coverage
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Load tests for performance validation

## 📈 Monitoring & Observability

### Metrics
- Application metrics (Prometheus)
- Business metrics (custom dashboards)
- Infrastructure metrics (Node Exporter)

### Logging
- Structured logging (Winston)
- Centralized log aggregation (ELK Stack)
- Error tracking (Sentry)

### Alerting
- Service health monitoring
- Performance threshold alerts
- Business metric alerts

## 🔒 Security

### Authentication & Authorization
- JWT with rotating refresh tokens
- Role-based access control (RBAC)
- OAuth2 integration (Google, Facebook)

### Data Protection
- Password hashing (bcrypt/Argon2)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Infrastructure Security
- HTTPS everywhere
- Security headers (Helmet)
- Rate limiting
- CORS configuration

## 📚 Documentation

- **API Documentation**: `/docs/API.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **Postman Collection**: `/docs/postman-collection.json`
- **Architecture Diagrams**: `/docs/architecture/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: https://docs.vasundhara.app
- **Issues**: https://github.com/vasundhara/issues
- **Email**: support@vasundhara.app

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core MVP features
- ✅ Basic ML predictions
- ✅ User authentication
- ✅ Inventory management

### Phase 2 (Next)
- 🔄 Advanced ML models
- 🔄 Mobile applications
- 🔄 Retail partner integration
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 IoT device integration
- 📋 Blockchain for food traceability
- 📋 Advanced AI features
- 📋 Global expansion

## 🏆 Achievements

- **Production Ready**: Full CI/CD pipeline
- **Scalable**: Microservices architecture
- **Secure**: Industry-standard security practices
- **Maintainable**: Clean code and documentation
- **Extensible**: Modular design for easy feature addition

---

**Vasundhara** - Making the world more sustainable, one meal at a time. 🌱
