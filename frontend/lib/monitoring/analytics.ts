/**
 * Analytics utilities
 * Provides user behavior tracking and custom event tracking
 */

// Analytics provider type
type AnalyticsProvider = "mixpanel" | "posthog" | "custom";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private provider: AnalyticsProvider;
  private enabled: boolean;

  constructor() {
    this.provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsProvider) || "custom";
    this.enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled || typeof window === "undefined") {
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname,
      },
    };

    // Send to analytics provider
    switch (this.provider) {
      case "mixpanel":
        if (window.mixpanel) {
          window.mixpanel.track(eventName, event.properties);
        }
        break;
      case "posthog":
        if (window.posthog) {
          window.posthog.capture(eventName, event.properties);
        }
        break;
      case "custom":
      default:
        // Custom analytics endpoint
        this.sendToCustomEndpoint(event);
        break;
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.enabled || typeof window === "undefined") {
      return;
    }

    switch (this.provider) {
      case "mixpanel":
        if (window.mixpanel) {
          window.mixpanel.identify(userId);
          if (traits) {
            window.mixpanel.people.set(traits);
          }
        }
        break;
      case "posthog":
        if (window.posthog) {
          window.posthog.identify(userId, traits);
        }
        break;
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (!this.enabled || typeof window === "undefined") {
      return;
    }

    switch (this.provider) {
      case "mixpanel":
        if (window.mixpanel) {
          window.mixpanel.people.set(properties);
        }
        break;
      case "posthog":
        if (window.posthog) {
          window.posthog.setPersonProperties(properties);
        }
        break;
    }
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Failed to send analytics event:", error);
    }
  }
}

// Global analytics instance
export const analytics = new Analytics();

// Helper functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  analytics.track(eventName, properties);
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  analytics.identify(userId, traits);
}

export function setUserProperties(properties: Record<string, any>) {
  analytics.setUserProperties(properties);
}

// Type declarations for window
declare global {
  interface Window {
    mixpanel?: any;
    posthog?: any;
  }
}

