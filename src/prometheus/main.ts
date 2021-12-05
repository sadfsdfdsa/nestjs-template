import { NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const client = require('prom-client');
const register = new client.Registry();

register.setDefaultLabels({
  app: 'example-nodejs-app',
});

client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // 0.1 to 10 seconds
});

register.registerMetric(httpRequestDurationMicroseconds);

/**
 * It's USE function
 */
export const prometheus = async (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction,
) => {
  const route = req.url;
  const end = httpRequestDurationMicroseconds.startTimer();

  if (route === '/metrics') {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
    return;
  }

  next();

  const metricHandler = () => {
    end({ route, code: res.statusCode, method: req.method });
  };

  res.on('close', metricHandler);
};
