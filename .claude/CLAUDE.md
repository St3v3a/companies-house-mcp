# Companies House MCP Server

This is an MCP server for UK Companies House API, deployed to Smithery.ai.

## Project Structure

- `src/index.ts` - Main MCP server with tool definitions (stdio transport)
- `src/http-server.ts` - HTTP server entry point for Smithery deployment
- `src/api.ts` - Companies House API client
- `smithery.yaml` - Smithery deployment configuration
- `Dockerfile` - Container build for Smithery

## Smithery Deployment

This project is configured for Smithery deployment. See `.claude/skills/smithery-deploy.md` for deployment guidance.

**Key points:**
- Uses `zod/v4` (required for MCP SDK v1.25+)
- Uses Express with StreamableHTTPServerTransport
- API key provided via Smithery Environment Variables

## Available Skills

- `/smithery-deploy` - Guidance for Smithery MCP server deployment

## Commands

```bash
# Build
npm run build

# Run locally (stdio)
npm start

# Run HTTP server locally
node dist/http-server.js

# Test Docker build
docker build -t companies-house-mcp .
docker run -p 3000:3000 -e COMPANIES_HOUSE_API_KEY=xxx companies-house-mcp
```

## Environment Variables

- `COMPANIES_HOUSE_API_KEY` - Required for API calls (set on Smithery dashboard)
- `PORT` - HTTP server port (default: 3000)
