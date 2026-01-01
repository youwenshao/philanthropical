/**
 * Animation utilities
 * Provides helper functions for common animations
 */

/**
 * Stagger children animations
 */
export function getStaggerDelay(index: number, delay: number = 0.1): string {
  return `${index * delay}s`;
}

/**
 * Fade in with delay
 */
export function fadeInDelay(index: number = 0, baseDelay: number = 0.1) {
  return {
    animation: "fadeIn 0.3s ease-in-out",
    animationDelay: `${index * baseDelay}s`,
    animationFillMode: "both",
  };
}

/**
 * Slide in up with delay
 */
export function slideInUpDelay(index: number = 0, baseDelay: number = 0.1) {
  return {
    animation: "slideInUp 0.3s ease-out",
    animationDelay: `${index * baseDelay}s`,
    animationFillMode: "both",
  };
}

