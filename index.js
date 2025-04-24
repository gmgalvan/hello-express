const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Get the current environment
const environment = process.env.NODE_ENV || 'development';

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'ok',
    timestamp: Date.now()
  };
  try {
    res.status(200).send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

// New endpoint to check environment
app.get('/environment', (req, res) => {
  const envInfo = {
    environment: environment,
    nodeVersion: process.version,
    hostname: process.env.HOSTNAME || 'unknown',
    timestamp: new Date().toISOString(),
    service: process.env.GAE_SERVICE || 'local'
  };
  
  res.status(200).json(envInfo);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT} in ${environment} environment`);
});