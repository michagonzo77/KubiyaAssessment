const express = require('express')
const promClient = require('prom-client')
const os = require('os')
const app = express()

// Create a Gauge for CPU usage
const cpuUsage = new promClient.Gauge({
    name: 'cpu_usage',
    help: 'Current CPU usage'
})

// Create a Gauge for memory usage
const memoryUsage = new promClient.Gauge({
    name: 'memory_usage',
    help: 'Current memory usage'
})

// Update the Gauges every second
setInterval(() => {
    // Update the CPU usage Gauge
    const cpuUsageValue = getCpuUsage()
    if (!isNaN(cpuUsageValue)) {
        cpuUsage.set(cpuUsageValue)
    }

    // Update the memory usage Gauge
    const memoryUsageValue = getMemoryUsage()
    if (!isNaN(memoryUsageValue)) {
        memoryUsage.set(memoryUsageValue)
    }
}, 1000)

const requestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['route'],
    buckets: [0.1, 0.5, 1, 1.5]
})

app.use((req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const elapsed = Date.now() - start
        requestDuration.labels(req.route.path).observe(elapsed / 1000)
    })

    next()
})

app.get('/', (req, res) => {
    res.send('Hello, World! Hola Amigos! How are ya? This is working now for real.')
})

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType)

    try {
        const metrics = await promClient.register.metrics()
        res.end(metrics)
    } catch (error) {
        console.error(error)
        res.status(500).end('Internal Server Error')
    }
})

app.listen(3001, () => {
    console.log('Application listening on port 3001')
})

function getCpuUsage() {
    // Get the current system load and the number of available CPUs
    const load = os.loadavg()[0]
    const cpus = os.cpus().length

    // Calculate the current CPU usage as a percentage
    const usage = Math.round((load / cpus) * 100)

    return usage
}

function getMemoryUsage() {
    // Get the current process memory usage
    const usage = process.memoryUsage().heapUsed

    // Convert the memory usage to megabytes
    const usageMB = Math.round(usage / 1024 / 1024)

    return usageMB
}