# Smithery MCP Server Deployment Skill

Use this skill when deploying MCP servers to Smithery.ai for remote hosting.

## When to Use

Invoke this skill when:
- Setting up a new MCP server for Smithery deployment
- Troubleshooting Smithery deployment issues
- Creating or updating smithery.yaml, Dockerfile, or http-server.ts
- Converting a stdio-based MCP server to HTTP transport

## Required Files

### 1. smithery.yaml

```yaml
runtime: "container"
build:
  dockerfile: "Dockerfile"
  dockerBuildPath: "."
startCommand:
  type: "http"
  path: "/mcp"
  configSchema:
    type: object
    properties:
      apiKey:
        type: string
        description: Your API key
    required: []  # Empty allows Smithery to scan without auth
  exampleConfig:
    apiKey: your_api_key_here
```

### 2. Dockerfile

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/http-server.js"]
```

### 3. HTTP Server (src/http-server.ts)

Must use Express with StreamableHTTPServerTransport:

```typescript
import { randomUUID } from 'node:crypto';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import * as z from 'zod/v4';  // CRITICAL: Must use zod/v4 for MCP SDK v1.25+

const PORT = parseInt(process.env.PORT || '3000', 10);
const transports = new Map<string, StreamableHTTPServerTransport>();
const sessionApiKeys = new Map<string, string>();

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, x-mcp-config, x-api-key, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Extract API key from multiple sources
function extractApiKey(req: express.Request): string | undefined {
  // x-mcp-config header (Smithery pattern)
  const configHeader = req.headers['x-mcp-config'];
  if (configHeader) {
    try {
      const config = JSON.parse(Array.isArray(configHeader) ? configHeader[0] : configHeader);
      if (config.apiKey) return config.apiKey;
    } catch {}
  }
  // x-api-key header
  const xApiKey = req.headers['x-api-key'];
  if (xApiKey) return Array.isArray(xApiKey) ? xApiKey[0] : xApiKey;
  // Environment variable fallback
  return process.env.API_KEY;
}

// MCP POST handler
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  const apiKey = extractApiKey(req);

  if (sessionId && transports.has(sessionId)) {
    if (apiKey) sessionApiKeys.set(sessionId, apiKey);
    await transports.get(sessionId)!.handleRequest(req, res, req.body);
  } else if (req.body?.method === 'initialize') {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports.set(sid, transport);
        if (apiKey) sessionApiKeys.set(sid, apiKey);
      }
    });
    const mcpServer = createMcpServer(() => {
      const sid = transport.sessionId;
      return sid ? sessionApiKeys.get(sid) : apiKey;
    });
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } else {
    res.status(400).json({ error: 'Bad request' });
  }
});

// MCP GET (SSE) and DELETE handlers
app.get('/mcp', async (req, res) => {
  const sid = req.headers['mcp-session-id'] as string;
  if (!sid || !transports.has(sid)) return res.status(400).send('Invalid session');
  await transports.get(sid)!.handleRequest(req, res);
});

app.delete('/mcp', async (req, res) => {
  const sid = req.headers['mcp-session-id'] as string;
  if (!sid || !transports.has(sid)) return res.status(400).send('Invalid session');
  await transports.get(sid)!.handleRequest(req, res);
  transports.delete(sid);
  sessionApiKeys.delete(sid);
});

app.listen(PORT, '0.0.0.0', () => console.log(`MCP server on port ${PORT}`));
```

## Critical Requirements

### 1. Use zod/v4, NOT zod
```typescript
// WRONG - causes "Type instantiation is excessively deep" errors
import { z } from 'zod';

// CORRECT
import * as z from 'zod/v4';
```

### 2. Use Express, NOT Raw Node.js HTTP
```typescript
// WRONG - causes "Failed to initialize connection"
import { createServer } from 'node:http';

// CORRECT
import express from 'express';
```

### 3. Use registerTool, NOT tool
```typescript
// WRONG - old API
server.tool('name', 'desc', schema, handler);

// CORRECT - new API for MCP SDK v1.25+
server.registerTool('name', {
  description: 'desc',
  inputSchema: { ... }
}, handler);
```

### 4. Allow Discovery Without API Key
Smithery scans your server to list tools. Only require API key when tools are called:

```typescript
server.registerTool('my_tool', { ... }, async (args) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { content: [{ type: 'text', text: 'API key required' }], isError: true };
  }
  // ... use apiKey
});
```

### 5. Install Required Dependencies
```bash
npm install express @modelcontextprotocol/sdk
npm install --save-dev @types/express typescript
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Container runtime cannot use stdio transport" | Use `type: "http"` in smithery.yaml |
| "Failed to initialize connection" | Switch from raw Node.js HTTP to Express |
| "Type instantiation is excessively deep" | Use `import * as z from 'zod/v4'` |
| "Scan failed: Authentication failed" | Make API key optional in configSchema.required |
| TypeScript build OOM | Add `NODE_OPTIONS="--max-old-space-size=8192"` to build |
| "API key required" on tool calls | Set env var on Smithery or check x-mcp-config extraction |

## Deployment Steps

1. Ensure all required files exist (smithery.yaml, Dockerfile, src/http-server.ts)
2. Build locally: `npm run build`
3. Test with Docker: `docker build -t test . && docker run -p 3000:3000 test`
4. Push to GitHub
5. Connect repo to Smithery
6. Smithery auto-builds and scans for tools
7. Configure API key via Smithery Environment Variables (for shared key) or let users provide via x-mcp-config

## End User Connection

**Claude Pro/Max/Team/Enterprise**: Settings > Connectors > Add server URL

**With shared API key**: Set `API_KEY` env var in Smithery dashboard - no client config needed

**Hidden server**: Hide on Smithery to prevent public listing; share URL only with authorized users
