import { Injectable, OnModuleInit } from '@nestjs/common'
import { Counter, Histogram, Gauge, register } from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
  private requestCounter: Counter
  private requestDuration: Histogram
  private activeConnections: Gauge

  onModuleInit() {
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
    })

    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    })

    this.activeConnections = new Gauge({
      name: 'http_active_connections',
      help: 'Active HTTP connections',
    })
  }

  incrementRequest(method: string, path: string, status: number) {
    this.requestCounter?.inc({ method, path, status: String(status) })
  }

  observeRequestDuration(method: string, path: string, durationSeconds: number) {
    this.requestDuration?.observe({ method, path }, durationSeconds)
  }

  incrementActiveConnections() {
    this.activeConnections?.inc()
  }

  decrementActiveConnections() {
    this.activeConnections?.dec()
  }

  async getMetrics(): Promise<string> {
    return register.metrics()
  }
}
