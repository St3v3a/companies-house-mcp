#!/usr/bin/env node
/**
 * HTTP Server entry point for Smithery deployment
 * Handles MCP over HTTP using Streamable HTTP transport
 */

import { randomUUID } from 'node:crypto';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';
import { UKCompanyAPI } from './api/uk-company-api.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Store transports by session ID
const transports = new Map<string, StreamableHTTPServerTransport>();

// Store API keys by session ID (set when tools are called)
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

// Parse request body
async function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Extract API key from various sources
function extractApiKey(req: IncomingMessage, body?: unknown): string | undefined {
  // Try x-mcp-config header (Smithery pattern)
  const configHeader = req.headers['x-mcp-config'];
  if (configHeader) {
    try {
      const config = JSON.parse(Array.isArray(configHeader) ? configHeader[0] : configHeader);
      if (config.apiKey) return config.apiKey;
    } catch { /* ignore */ }
  }

  // Try x-api-key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    return Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
  }

  // Try authorization header (Basic auth with apiKey as username)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username] = decoded.split(':');
      if (username) return username;
    } catch { /* ignore */ }
  }

  // Try MCP initialize params
  const bodyObj = body as Record<string, unknown> | undefined;
  if (bodyObj?.method === 'initialize') {
    const params = bodyObj?.params as Record<string, unknown> | undefined;
    const clientInfo = params?.clientInfo as Record<string, unknown> | undefined;
    const config = clientInfo?.config as Record<string, unknown> | undefined;
    if (config?.apiKey) return config.apiKey as string;
  }

  // Try environment variable as fallback
  if (process.env.COMPANIES_HOUSE_API_KEY) {
    return process.env.COMPANIES_HOUSE_API_KEY;
  }

  return undefined;
}

// Check if this is an MCP initialize request
function isInitializeRequest(body: unknown): boolean {
  const bodyObj = body as Record<string, unknown> | undefined;
  return bodyObj?.method === 'initialize';
}

// Create HTTP server
const server = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, x-mcp-config, x-api-key, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // MCP endpoint
  if (req.url === '/mcp' || req.url === '/') {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      let body: unknown = {};
      if (req.method === 'POST') {
        body = await parseBody(req);
      }

      const bodyObj = body as Record<string, unknown>;
      console.log(`[MCP] ${req.method} request, session: ${sessionId || 'none'}, method: ${bodyObj?.method || 'N/A'}`);

      // Extract API key and store it for the session
      const apiKey = extractApiKey(req, body);
      if (apiKey && sessionId) {
        sessionApiKeys.set(sessionId, apiKey);
      }

      if (req.method === 'POST') {
        if (sessionId && transports.has(sessionId)) {
          // Existing session - update API key if provided
          if (apiKey) {
            sessionApiKeys.set(sessionId, apiKey);
          }
          const transport = transports.get(sessionId)!;
          await transport.handleRequest(req, res, body);
        } else if (!sessionId && isInitializeRequest(body)) {
          // New session - allow without API key for discovery
          console.log('[MCP] Creating new session' + (apiKey ? ' with API key' : ' without API key (discovery mode)'));

          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId: string) => {
              console.log(`[MCP] Session initialized: ${newSessionId}`);
              transports.set(newSessionId, transport);
              if (apiKey) {
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

          // Create MCP server - API key will be checked when tools are called
          const mcpServer = createMcpServer(() => {
            const sid = transport.sessionId;
            return sid ? sessionApiKeys.get(sid) : apiKey;
          });
          await mcpServer.connect(transport);
          await transport.handleRequest(req, res, body);
        } else {
          // Invalid request
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Bad Request: Missing session ID or not an initialization request' },
            id: bodyObj?.id || null
          }));
        }
      } else if (req.method === 'GET') {
        // SSE stream for existing session
        if (!sessionId || !transports.has(sessionId)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid or missing session ID');
          return;
        }
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
      } else if (req.method === 'DELETE') {
        // Session termination
        if (!sessionId || !transports.has(sessionId)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid or missing session ID');
          return;
        }
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
      } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
      }
    } catch (error) {
      console.error('[MCP] Error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null
        }));
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[MCP] UK Company Data server listening on http://0.0.0.0:${PORT}`);
  console.log('[MCP] Endpoints: /mcp (MCP protocol), /health (health check)');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[MCP] Shutting down...');
  for (const [sessionId, transport] of transports) {
    try {
      await transport.close();
      transports.delete(sessionId);
      sessionApiKeys.delete(sessionId);
    } catch (e) {
      console.error(`[MCP] Error closing session ${sessionId}:`, e);
    }
  }
  server.close(() => {
    console.log('[MCP] Server closed');
    process.exit(0);
  });
});
