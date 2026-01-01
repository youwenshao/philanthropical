/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  id?: string;
}

/**
 * Report Core Web Vitals to analytics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // Send to analytics
  if (typeof window !== "undefined") {
    // Custom analytics
    fetch("/api/metrics/web-vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metric),
      keepalive: true, // Send even if page is unloading
    }).catch((error) => {
      console.error("Failed to report web vitals:", error);
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Web Vital:", metric);
    }
  }
}

/**
 * Measure custom performance metric
 */
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      reportCustomMetric(name, duration);
    });
  } else {
    const duration = performance.now() - start;
    reportCustomMetric(name, duration);
  }
}

/**
 * Report custom performance metric
 */
function reportCustomMetric(name: string, value: number) {
  if (typeof window !== "undefined") {
    fetch("/api/metrics/custom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        value,
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch((error) => {
      console.error("Failed to report custom metric:", error);
    });
  }
}

/**
 * Get performance timing
 */
export function getPerformanceTiming() {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  return {
    // Page load metrics
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    domProcessing: timing.domComplete - timing.domLoading,
    loadEvent: timing.loadEventEnd - timing.loadEventStart,
    total: timing.loadEventEnd - timing.navigationStart,
    // Navigation type
    type: navigation.type === 0 ? "navigate" : navigation.type === 1 ? "reload" : "back_forward",
  };
}

/**
 * Monitor long tasks (tasks > 50ms)
 */
export function monitorLongTasks() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          reportCustomMetric("long_task", entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ["longtask"] });
  } catch (error) {
    // Long task monitoring not supported
    console.debug("Long task monitoring not supported");
  }
}

