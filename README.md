# Companies House MCP Server

Access UK company data through the [Companies House API](https://developer.company-information.service.gov.uk/api/docs/) directly in Claude and other MCP clients.

## Features

- **Company Search** - Find companies by name
- **Company Profile** - Registration info, status, key dates
- **Officers** - Directors, secretaries, appointments
- **Filing History** - Accounts, annual returns, documents
- **PSC** - Persons with significant control (beneficial owners)
- **Charges** - Mortgages and debentures
- **Insolvency** - Insolvency status and proceedings

## Quick Start

### Via Smithery (Recommended)

1. Visit [smithery.ai](https://smithery.ai)
2. Search for "companies-house-mcp"
3. Click "Add to Claude Desktop"
4. Enter your API key when prompted

### Via Docker

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "companies-house": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "COMPANIES_HOUSE_API_KEY=your-api-key-here",
        "cybernetic1/companies-house-mcp:latest"
      ]
    }
  }
}
```

### Via npx (requires Node.js)

```json
{
  "mcpServers": {
    "companies-house": {
      "command": "npx",
      "args": ["-y", "@cybernetic1/companies-house-mcp"],
      "env": {
        "COMPANIES_HOUSE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Get an API Key

1. Register at [Companies House Developer Hub](https://developer.company-information.service.gov.uk/)
2. Create an application to get your API key

## Available Tools

| Tool | Description |
|------|-------------|
| `search_companies` | Search for companies by name |
| `get_company_profile` | Get detailed company information |
| `get_officers` | List company directors and officers |
| `get_filing_history` | Get filing history (accounts, returns) |
| `get_persons_with_significant_control` | Get PSC/beneficial ownership |
| `get_charges` | Get mortgages and debentures |
| `get_registered_office_address` | Get registered address |
| `advanced_company_search` | Search with filters |
| `search_officers` | Search officers by name |
| `search_disqualified_officers` | Find disqualified directors |

## Example Usage

Ask Claude:
- "Search for company Tesco"
- "Who are the directors of AO Accountants Ltd?"
- "Get filing history for company 00445790"
- "Is company 09970904 still active?"
- "Show persons with significant control for Barclays"

## License

MIT License - see [LICENSE](LICENSE)
