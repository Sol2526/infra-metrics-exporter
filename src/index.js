// This basic exporter will give JSON health status, Version from env var, host/container info, test log, and metrics in prometheus text format (default is Node)
const express = require('express');
const os = require('os');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

//Prometheus setup
const register = new client.Registry();

// Add some default labels for all metrics
register.setDefaultLabels({
  app: 'infra-metrics-exporter',
});

// Collect default Node.js & process metrics
client.collectDefaultMetrics({
  register,
});

// Custom metrics here
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const demoLogCounter = new client.Counter({
  name: 'demo_log_calls_total',
  help: 'Number of times /logs/demo was called',
});

register.registerMetric(httpRequestCounter);
register.registerMetric(demoLogCounter);

// Simple middleware to count requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });

    // wip
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'http_request',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration_ms: responseTime,
        time: new Date().toISOString(),
      })
    );
  });

  next();
});

// Endpoints below
// Healthcheck for ALB & humans
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

// Version endpoint (uses env var)
app.get('/version', (req, res) => {
  res.json({
    version: process.env.APP_VERSION || 'dev',
    env: process.env.NODE_ENV || 'local',
  });
});

// Whoami: container/host info
app.get('/whoami', (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: process.platform,
    uptime_seconds: process.uptime(),
  });
});

// Demo logs endpoint
app.get('/logs/demo', (req, res) => {
  demoLogCounter.inc();

  console.log(
    JSON.stringify({
      level: 'info',
      msg: 'Demo log endpoint hit',
      time: new Date().toISOString(),
    })
  );

  res.json({
    logged: true,
    message: 'Wrote a demo log entry',
  });
});

// Prometheus /metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Starting the server
app.listen(port, () => {
  console.log(`Infra metrics exporter listening on port ${port}`);
});
