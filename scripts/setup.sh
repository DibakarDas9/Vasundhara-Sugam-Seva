#!/bin/bash

# Vasundhara Setup Script
# This script sets up the development environment for the Vasundhara project

set -e

echo "🌱 Setting up Vasundhara - AI-Powered Food Waste Management System"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if Python is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    print_success "Python $PYTHON_VERSION is installed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Copy .env.example files
    if [ -f "vasundhara-api/env.example" ]; then
        cp vasundhara-api/env.example vasundhara-api/.env
        print_success "Created vasundhara-api/.env"
    fi
    
    if [ -f "vasundhara-ml/env.example" ]; then
        cp vasundhara-ml/env.example vasundhara-ml/.env
        print_success "Created vasundhara-ml/.env"
    fi
    
    if [ -f "vasundhara-frontend/env.example" ]; then
        cp vasundhara-frontend/env.example vasundhara-frontend/.env.local
        print_success "Created vasundhara-frontend/.env.local"
    fi
    
    print_warning "Please update the environment files with your actual configuration values"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install API dependencies
    if [ -d "vasundhara-api" ]; then
        print_status "Installing API dependencies..."
        cd vasundhara-api
        npm install
        cd ..
        print_success "API dependencies installed"
    fi
    
    # Install ML service dependencies
    if [ -d "vasundhara-ml" ]; then
        print_status "Installing ML service dependencies..."
        cd vasundhara-ml
        python3 -m pip install -r requirements.txt
        cd ..
        print_success "ML service dependencies installed"
    fi
    
    # Install Frontend dependencies
    if [ -d "vasundhara-frontend" ]; then
        print_status "Installing Frontend dependencies..."
        cd vasundhara-frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data
    mkdir -p vasundhara-ml/models
    mkdir -p vasundhara-ml/data/training
    mkdir -p vasundhara-ml/data/validation
    
    print_success "Directories created"
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    docker-compose build
    
    print_success "Docker images built"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    docker-compose up -d
    
    print_success "Services started"
    print_status "Services are running:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - API: http://localhost:5000"
    echo "  - ML Service: http://localhost:8000"
    echo "  - MongoDB: localhost:27017"
    echo "  - Redis: localhost:6379"
    echo "  - RabbitMQ: http://localhost:15672"
}

# Main setup function
main() {
    print_status "Starting Vasundhara setup..."
    
    # Check prerequisites
    check_docker
    check_node
    check_python
    
    # Setup
    create_directories
    create_env_files
    install_dependencies
    build_docker_images
    start_services
    
    print_success "Vasundhara setup completed successfully!"
    print_status "Next steps:"
    echo "  1. Update the environment files with your configuration"
    echo "  2. Run 'docker-compose logs -f' to view service logs"
    echo "  3. Visit http://localhost:3000 to see the application"
    echo "  4. Check the README.md for detailed documentation"
}

# Run main function
main "$@"
