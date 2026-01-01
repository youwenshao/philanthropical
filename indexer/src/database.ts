import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration");
}

// Configure connection pooling for better performance
// Supabase client handles connection pooling automatically,
// but we can configure options for optimal performance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: false, // Indexer doesn't need session persistence
    autoRefreshToken: false,
  },
  global: {
    headers: {
      "x-client-info": "philanthropical-indexer",
    },
  },
  // Connection pooling is handled by Supabase, but we can set timeouts
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to execute queries with retry logic
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}



