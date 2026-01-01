/**
 * API request/response validation utilities
 */

import { z } from "zod";

/**
 * Validate request body
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, string | undefined>): T {
  return schema.parse(params);
}

/**
 * Common validation schemas
 */
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format");

export const DateRangeSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

/**
 * Create error response
 */
export function createErrorResponse(message: string, status: number = 400, details?: any) {
  return {
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T, metadata?: Record<string, any>) {
  return {
    success: true,
    data,
    ...(metadata && { metadata }),
    timestamp: new Date().toISOString(),
  };
}

