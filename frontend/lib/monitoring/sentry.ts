/**
 * Sentry configuration and utilities
 * Provides error tracking and performance monitoring
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

/**
 * Initialize Sentry
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured. Error tracking disabled.");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance monitoring
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore wallet connection errors (user cancelled)
          if (error.message.includes("User rejected") || error.message.includes("User denied")) {
            return null;
          }
        }
      }
      return event;
    },
  });
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id?: string; walletAddress?: string; email?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    () => {}
  );
}

