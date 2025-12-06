import app from './app';
import { config } from './config/config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Vasundhara API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});