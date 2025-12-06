# Vasundhara Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Build Failures

#### Issue: `npm ci` fails with "package-lock.json not found"
**Solution:**
```bash
# Navigate to frontend directory
cd vasundhara-frontend

# Install dependencies to generate package-lock.json
npm install

# Try Docker build again
docker-compose up -d
```

#### Issue: ML service fails with "libgl1-mesa-glx not available"
**Solution:**
```bash
# Use the automated fix script
fix-and-restart.bat

# Or manually:
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

#### Issue: Python dependencies fail to install
**Solution:**
```bash
# Use the simplified requirements
cd vasundhara-ml
pip install -r simple_requirements.txt

# Or run the ML service directly
python simple_main.py
```

### 2. Port Conflicts

#### Issue: Port already in use
**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

### 3. Service Connection Issues

#### Issue: Services can't connect to each other
**Solution:**
```bash
# Check if all services are running
docker-compose ps

# Check service logs
docker-compose logs frontend
docker-compose logs api-service
docker-compose logs ml-service

# Restart specific service
docker-compose restart api-service
```

### 4. Database Connection Issues

#### Issue: MongoDB connection failed
**Solution:**
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### 5. Frontend Build Issues

#### Issue: Next.js build fails
**Solution:**
```bash
# Clear Next.js cache
cd vasundhara-frontend
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### 6. API Service Issues

#### Issue: API service won't start
**Solution:**
```bash
# Check TypeScript compilation
cd vasundhara-api
npm run build

# Check for missing dependencies
npm install

# Run in development mode
npm run dev
```

### 7. ML Service Issues

#### Issue: ML service won't start
**Solution:**
```bash
# Use the simplified version
cd vasundhara-ml
python simple_main.py

# Or install dependencies manually
pip install fastapi uvicorn pydantic
```

## Quick Fixes

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v
docker system prune -f

# Start fresh
docker-compose up -d
```

### Manual Service Start
```bash
# Start infrastructure only
docker-compose up -d mongodb redis rabbitmq

# Start services manually
cd vasundhara-api && npm run dev &
cd vasundhara-ml && python simple_main.py &
cd vasundhara-frontend && npm run dev &
```

### Check Service Health
```bash
# Test all services
python test-services.py

# Or test individually
curl http://localhost:3000
curl http://localhost:5000/health
curl http://localhost:8000/health
```

## Log Locations

- **Frontend logs**: Check terminal where `npm run dev` is running
- **API logs**: Check terminal where `npm run dev` is running
- **ML logs**: Check terminal where `python simple_main.py` is running
- **Docker logs**: `docker-compose logs <service-name>`

## Still Having Issues?

1. Check the service logs for specific error messages
2. Ensure all prerequisites are installed
3. Try running services individually instead of with Docker
4. Check if ports are available
5. Verify network connectivity between services

## Support

If you continue to have issues, please:
1. Check the logs for specific error messages
2. Note your operating system and versions
3. Describe the exact steps that led to the issue
4. Include any error messages you see
