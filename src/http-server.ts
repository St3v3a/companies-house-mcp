#!/usr/bin/env node
/**
 * HTTP Server entry point for Smithery deployment
 * Uses Express with MCP SDK's createMcpExpressApp for proper HTTP handling
 */

import { randomUUID } from 'node:crypto';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { UKCompanyAPI } from './api/uk-company-api.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Store transports by session ID
const transports = new Map<string, StreamableHTTPServerTransport>();

// Store API keys by session ID
const sessionApiKeys = new Map<string, string>();

// Create MCP server for a session
function createMcpServer(getApiKey: () => string | undefined): McpServer {
  const server = new McpServer({
    name: 'uk-company-data',
    version: '1.0.0'
  });

  // Helper to get API and throw if not configured
  const getApi = (): UKCompanyAPI => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API key required. Configure apiKey in your MCP client settings.');
    }
    return new UKCompanyAPI({ apiKey });
  };

  // Search companies
  server.registerTool('search_companies', {
    description: 'Search for UK companies by name or number. Returns matching companies with basic info.',
    inputSchema: {
      query: z.string().describe('Company name or number to search'),
      items_per_page: z.number().describe('Results per page (1-100)').optional(),
      start_index: z.number().describe('Pagination start index').optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.company.searchCompanies(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get company profile
  server.registerTool('get_company_profile', {
    description: 'Get detailed company profile including status, SIC codes, accounts dates.',
    inputSchema: {
      company_number: z.string().describe('8-character company number')
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.company.getCompanyProfile(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get officers
  server.registerTool('get_officers', {
    description: 'Get list of company officers (directors, secretaries, LLP members).',
    inputSchema: {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.officers.getOfficers(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get filing history
  server.registerTool('get_filing_history', {
    description: 'Get company filing history (accounts, returns, resolutions).',
    inputSchema: {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional(),
      category: z.string().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.filing.getFilingHistory(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get PSC (Persons with Significant Control)
  server.registerTool('get_persons_with_significant_control', {
    description: 'Get persons with significant control (PSC) - beneficial owners.',
    inputSchema: {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.psc.getPersonsWithSignificantControl(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get charges
  server.registerTool('get_charges', {
    description: 'Get company charges (mortgages, debentures, security interests).',
    inputSchema: {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.charges.getCharges(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Search officers
  server.registerTool('search_officers', {
    description: 'Search for company officers by name across all UK companies.',
    inputSchema: {
      query: z.string().describe('Officer name to search'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.search.searchOfficers(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get registered office address
  server.registerTool('get_registered_office_address', {
    description: 'Get the registered office address of a company.',
    inputSchema: {
      company_number: z.string().describe('Company number')
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.company.getRegisteredOfficeAddress(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Advanced company search
  server.registerTool('advanced_company_search', {
    description: 'Advanced search with filters: status, type, location, dates, SIC codes.',
    inputSchema: {
      company_name: z.string().optional(),
      company_status: z.string().optional(),
      company_type: z.string().optional(),
      location: z.string().optional(),
      incorporated_from: z.string().optional(),
      incorporated_to: z.string().optional(),
      sic_codes: z.string().optional(),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.search.advancedCompanySearch(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Get officer appointments
  server.registerTool('get_officer_appointments_list', {
    description: 'Get all company appointments for a specific officer.',
    inputSchema: {
      officer_id: z.string().describe('Officer ID from search results'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    }
  }, async (args) => {
    const api = getApi();
    const result = await api.officers.getOfficerAppointmentsList(args);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  return server;
}

// Extract API key from request - try multiple sources
function extractApiKey(req: express.Request): string | undefined {
  // Log all headers for debugging
  console.log('[MCP] Headers:', JSON.stringify(req.headers, null, 2));

  // Try x-mcp-config header (Smithery pattern)
  const configHeader = req.headers['x-mcp-config'];
  if (configHeader) {
    try {
      const configStr = Array.isArray(configHeader) ? configHeader[0] : configHeader;
      console.log('[MCP] Found x-mcp-config:', configStr);
      const config = JSON.parse(configStr);
      if (config.apiKey) {
        console.log('[MCP] Extracted apiKey from x-mcp-config');
        return config.apiKey;
      }
    } catch (e) {
      console.error('[MCP] Failed to parse x-mcp-config:', e);
    }
  }

  // Try mcp-config header (alternative)
  const mcpConfigHeader = req.headers['mcp-config'];
  if (mcpConfigHeader) {
    try {
      const configStr = Array.isArray(mcpConfigHeader) ? mcpConfigHeader[0] : mcpConfigHeader;
      console.log('[MCP] Found mcp-config:', configStr);
      const config = JSON.parse(configStr);
      if (config.apiKey) {
        console.log('[MCP] Extracted apiKey from mcp-config');
        return config.apiKey;
      }
    } catch (e) {
      console.error('[MCP] Failed to parse mcp-config:', e);
    }
  }

  // Try x-api-key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    console.log('[MCP] Found x-api-key header');
    return Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
  }

  // Try authorization header (Basic auth)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username] = decoded.split(':');
      if (username) {
        console.log('[MCP] Extracted apiKey from Basic auth');
        return username;
      }
    } catch { /* ignore */ }
  }

  // Try Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token) {
      console.log('[MCP] Extracted apiKey from Bearer token');
      return token;
    }
  }

  // Try environment variable
  if (process.env.COMPANIES_HOUSE_API_KEY) {
    console.log('[MCP] Using COMPANIES_HOUSE_API_KEY env var');
    return process.env.COMPANIES_HOUSE_API_KEY;
  }

  console.log('[MCP] No API key found in request');
  return undefined;
}

// Check if body is an initialize request
function isInitializeRequest(body: unknown): boolean {
  const bodyObj = body as Record<string, unknown> | undefined;
  return bodyObj?.method === 'initialize';
}

// Create Express app
const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, x-mcp-config, x-api-key, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Track current request's API key for tool handlers
let currentRequestApiKey: string | undefined;

// MCP POST handler
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  const body = req.body;

  console.log(`[MCP] POST request, session: ${sessionId || 'none'}, method: ${body?.method || 'N/A'}`);

  // Extract API key from this request
  const apiKey = extractApiKey(req);
  currentRequestApiKey = apiKey; // Make available to tool handlers

  // Store API key for session if we have both
  if (apiKey && sessionId) {
    console.log(`[MCP] Storing API key for session: ${sessionId}`);
    sessionApiKeys.set(sessionId, apiKey);
  }

  try {
    if (sessionId && transports.has(sessionId)) {
      // Existing session - always update API key if provided
      if (apiKey) {
        console.log(`[MCP] Updating API key for existing session: ${sessionId}`);
        sessionApiKeys.set(sessionId, apiKey);
      }
      console.log(`[MCP] Session ${sessionId} has stored API key: ${sessionApiKeys.has(sessionId)}`);
      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res, body);
    } else if (!sessionId && isInitializeRequest(body)) {
      // New session
      console.log('[MCP] Creating new session' + (apiKey ? ' with API key' : ' (discovery mode)'));

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId: string) => {
          console.log(`[MCP] Session initialized: ${newSessionId}`);
          transports.set(newSessionId, transport);
          if (apiKey) {
            console.log(`[MCP] Storing API key for new session: ${newSessionId}`);
            sessionApiKeys.set(newSessionId, apiKey);
          }
        }
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          console.log(`[MCP] Session closed: ${sid}`);
          transports.delete(sid);
          sessionApiKeys.delete(sid);
        }
      };

      // Create MCP server - check multiple sources for API key
      const mcpServer = createMcpServer(() => {
        const sid = transport.sessionId;
        // Try in order: current request, session storage, initial capture
        const key = currentRequestApiKey || (sid ? sessionApiKeys.get(sid) : undefined) || apiKey;
        console.log(`[MCP] getApiKey called - sessionId: ${sid}, found: ${!!key}`);
        return key;
      });

      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, body);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: Missing session ID or not an initialization request' },
        id: body?.id || null
      });
    }
  } catch (error) {
    console.error('[MCP] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    }
  }
});

// MCP GET handler (SSE)
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  console.log(`[MCP] GET request (SSE), session: ${sessionId || 'none'}`);

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// MCP DELETE handler
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  console.log(`[MCP] DELETE request, session: ${sessionId || 'none'}`);

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MCP] UK Company Data server listening on http://0.0.0.0:${PORT}`);
  console.log('[MCP] Endpoints: /mcp (MCP protocol), /health (health check)');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[MCP] Shutting down...');
  for (const [sessionId, transport] of transports) {
    try {
      await transport.close();
    } catch (e) {
      console.error(`[MCP] Error closing session ${sessionId}:`, e);
    }
  }
  process.exit(0);
});
