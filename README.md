# Vasundhara - AI-Powered Smart Food Waste Management System

A comprehensive full-stack web application that reduces household and retail food waste using predictive AI, meal planning, expiry alerts, gamification, and surplus sharing.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Service   │    │   ML Service    │
│   (React/TS)    │◄──►│   (Express.js)  │◄──►│   (FastAPI)     │
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

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** for SSR/SEO optimization
- **Tailwind CSS** + **styled-components** for styling
- **Framer Motion** for animations
- **Lottie** for illustrations
- **Recharts** for data visualization
- **PWA** support with service workers

### Backend Services
- **Express.js** with TypeScript (API Service)
- **FastAPI** with Python (ML Service)
- **MongoDB** for primary data storage
- **Redis** for caching and sessions
- **RabbitMQ** + **Celery** for background jobs

### ML & AI
- **LightGBM/XGBoost** for expiry prediction
- **MobileNet/ResNet** for image classification
- **OCR** for receipt scanning
- **NLP** for product parsing

### DevOps & Infrastructure
- **Docker** + **Docker Compose**
- **Kubernetes** + **Helm Charts**
- **GitHub Actions** for CI/CD
- **Prometheus** + **Grafana** for monitoring
- **Sentry** for error tracking

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- MongoDB
- Redis

### Automated Setup (Windows)
```cmd
# Run the automated setup script
start-project.bat
```

### Automated Setup (PowerShell)
```powershell
# Run the PowerShell setup script
.\start-project.ps1
```

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd vasundhara
```

2. **Start all services with Docker Compose**
```bash
docker-compose up -d
```

3. **Manual Setup (if needed)**
```bash
# Start infrastructure services
docker-compose up -d mongodb redis rabbitmq

# Start API service
cd vasundhara-api
npm install
npm run dev

# Start ML service (in new terminal)
cd vasundhara-ml
pip install -r simple_requirements.txt
python simple_main.py

# Start Frontend (in new terminal)
cd vasundhara-frontend
npm install
npm run dev
```

3. **Or run services individually**

**Frontend:**
```bash
cd vasundhara-frontend
npm install
npm run dev
```

**API Service:**
```bash
cd vasundhara-api
npm install
npm run dev
```

**ML Service:**
```bash
cd vasundhara-ml
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Setup

Copy the environment files and configure:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Features

### Core Features
- 🍎 **Smart Inventory Management** - Manual entry, barcode scanning, OCR receipt parsing
- 🤖 **AI-Powered Expiry Prediction** - ML models predict food spoilage with confidence scores
- 📅 **Intelligent Meal Planning** - Prioritizes soon-to-expire items with recipe suggestions
- 🔔 **Multi-Channel Alerts** - Push notifications, email, SMS for expiry warnings
- 🛒 **Surplus Marketplace** - Local food sharing with map-based listings
- 🎮 **Gamification** - Points, badges, streaks, leaderboards for sustainable behavior
- 📊 **Analytics Dashboard** - Waste trends, cost savings, CO₂ impact tracking

### Advanced Features
- 🔐 **Secure Authentication** - JWT with refresh tokens, OAuth2 integration
- 👥 **Multi-Tenant Architecture** - Support for households and retail partners
- 🔒 **Privacy-First Design** - GDPR compliance, data export, opt-in ML
- 📱 **PWA Support** - Offline-first with service workers
- ♿ **Accessibility** - ARIA compliance, keyboard navigation
- 🌐 **Internationalization** - Multi-language support

## API Documentation

- **API Docs**: http://localhost:5000/api-docs
- **ML Service Docs**: http://localhost:8000/docs
- **Postman Collection**: [Download here](./docs/postman-collection.json)

## ML Model Contract

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
  ]
}
```

## Development

### Project Structure
```
vasundhara/
├── vasundhara-frontend/     # React/Next.js frontend
├── vasundhara-api/          # Express.js API service
├── vasundhara-ml/           # FastAPI ML service
├── docker-compose.yml       # Local development setup
├── k8s/                     # Kubernetes manifests
├── helm/                    # Helm charts
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

### Testing
```bash
# Run all tests
npm run test:all

# Frontend tests
cd vasundhara-frontend && npm test

# API tests
cd vasundhara-api && npm test

# ML service tests
cd vasundhara-ml && pytest
```

### Deployment

#### Local with Docker
```bash
docker-compose up -d
```

#### Kubernetes
```bash
# Install Helm charts
helm install vasundhara ./helm/vasundhara

# Or apply manifests directly
kubectl apply -f k8s/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For support and questions:
- 📧 Email: support@vasundhara.app
- 📖 Documentation: [docs.vasundhara.app](https://docs.vasundhara.app)
- 🐛 Issues: [GitHub Issues](https://github.com/vasundhara/issues)
