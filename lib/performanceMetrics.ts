// Enhanced performance monitoring
export class PerformanceMetrics {
  private static metrics: Map<string, number[]> = new Map()

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  static getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return 0
    
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  static getMetricSummary(): Record<string, { avg: number; count: number }> {
    const summary: Record<string, { avg: number; count: number }> = {}
    
    for (const [name, values] of this.metrics.entries()) {
      summary[name] = {
        avg: this.getAverageMetric(name),
        count: values.length
      }
    }
    
    return summary
  }

  // Database query performance tracking
  static async trackDatabaseQuery<T>(
    queryName: string, 
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await queryFn()
      const duration = performance.now() - startTime
      
      this.recordMetric(`db_${queryName}`, duration)
      
      if (duration > 1000) {
        console.warn(`Slow database query: ${queryName} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordMetric(`db_${queryName}_error`, duration)
      throw error
    }
  }

  // Component render performance tracking
  static trackComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now()
    renderFn()
    const duration = performance.now() - startTime
    
    this.recordMetric(`render_${componentName}`, duration)
    
    if (duration > 16) { // 60fps = 16.67ms per frame
      console.warn(`Slow component render: ${componentName} took ${duration.toFixed(2)}ms`)
    }
  }
}
