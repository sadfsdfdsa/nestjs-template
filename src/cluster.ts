/* eslint-disable @typescript-eslint/no-var-requires */
import * as os from 'os';

const cluster = require('cluster');

// Choose .env number of cluster, or CPU's max limit
const numCPUs = Math.min(os.cpus().length, Number(process.env.CLUSTER));

const express = require('express');
const metricsServer = express();
const AggregatorRegistry = require('prom-client').AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();

export function runInCluster(bootstrap: () => Promise<void>) {
  if (cluster.isMaster) {
    console.log(`Master server started on ${process.pid}`);

    //ensure workers exit cleanly
    process.on('SIGINT', function () {
      console.log('Cluster shutting down...');
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      // exit the master process
      process.exit(0);
    });

    // Starting fork
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    // Crashing restart clusters
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died. Restarting`);
      cluster.fork();
    });

    // Start cluster metrics
    metricsServer.get('/metrics', async (_, res) => {
      try {
        const metrics = await aggregatorRegistry.clusterMetrics();
        res.set('Content-Type', aggregatorRegistry.contentType);
        res.send(metrics);
      } catch (ex) {
        res.statusCode = 500;
        res.send(ex.message);
      }
    });

    metricsServer.listen(8081);
    console.log(
      'Cluster metrics server listening to 8081, metrics exposed on /metrics',
    );
    return;
  }
  // Cluster case
  console.log(`Cluster server started on ${process.pid}`);
  bootstrap();
}
