#!/usr/bin/env node

import { z } from 'zod';
import { config as loadEnv } from 'dotenv';
import { UKCompanyServer } from './server.js';

loadEnv();

// Smithery config schema - defines what users need to provide
export const configSchema = z.object({
  apiKey: z.string().describe('Your Companies House API key (get one free at https://developer.company-information.service.gov.uk/)'),
  baseUrl: z.string().optional().describe('Optional custom API base URL')
});

type ServerConfig = z.infer<typeof configSchema>;

// Smithery expects a default createServer export
export default function createServer(config: ServerConfig) {
  const server = new UKCompanyServer({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl
  });
  return server.getInstance();
}

// For standalone CLI execution
async function main() {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

  if (!apiKey) {
    console.error('Error: COMPANIES_HOUSE_API_KEY environment variable is required');
    console.error('Set it in .env file or as an environment variable');
    process.exit(1);
  }

  try {
    const server = new UKCompanyServer({
      apiKey,
      baseUrl: process.env.COMPANIES_HOUSE_API_URL
    });

    await server.run();
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Only run main if executed directly (not imported)
const isDirectRun = process.argv[1]?.includes('index');
if (isDirectRun) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
