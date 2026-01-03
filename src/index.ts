#!/usr/bin/env node

import { config as loadEnv } from 'dotenv';
import { UKCompanyServer } from './server.js';

loadEnv();

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

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
