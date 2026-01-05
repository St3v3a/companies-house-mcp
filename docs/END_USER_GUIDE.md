# Companies House MCP - End User Setup Guide

This guide will help you connect the Companies House MCP server to Claude Desktop, giving you access to UK company search and data tools directly within Claude.

## Prerequisites

- **Claude Pro, Max, Team, or Enterprise** subscription
- **Claude Desktop** application installed
- **Google or GitHub account** for Smithery authentication

## Setup Instructions

### Step 1: Open Claude Desktop Settings

1. Open **Claude Desktop**
2. Click the **menu icon** (three lines or gear icon)
3. Select **Settings**
4. Navigate to **Connectors** section

### Step 2: Add the Companies House Server

1. In the Connectors section, click **Add Connector** or **+**
2. Enter the server URL provided to you:
   ```
   https://server.smithery.ai/st3v3a/companies-house-mcp/mcp
   ```
3. Click **Connect**

### Step 3: Authenticate with Smithery

When prompted, you'll need to sign in to Smithery:

1. A browser window will open asking you to authenticate
2. Choose either:
   - **Sign in with Google** - Use your Google account
   - **Sign in with GitHub** - Use your GitHub account
3. Authorise the connection when prompted
4. The browser will confirm success - you can close it and return to Claude Desktop

### Step 4: Verify Connection

1. Back in Claude Desktop, the connector should now show as **Connected**
2. Start a new conversation
3. You should see the Companies House tools available

## Available Tools

Once connected, you can ask Claude to:

- **Search companies** - Find UK companies by name
- **Get company details** - Full company profile including address, status, SIC codes
- **Get company officers** - Directors and secretaries
- **Get filing history** - Recent Companies House filings
- **Get company charges** - Mortgages and charges
- **Search officers** - Find people who are company officers
- **Search disqualified officers** - Check for disqualified directors

## Example Prompts

Try asking Claude:

- "Search for companies named Aigurus"
- "Get the details for company number 12345678"
- "Who are the officers of Tesco PLC?"
- "Show me the recent filings for company 00445790"
- "Search for directors named John Smith"

## Troubleshooting

### "Connection failed" error
- Check your internet connection
- Try disconnecting and reconnecting the server
- Restart Claude Desktop

### Tools not appearing
- Ensure the connector shows as "Connected" in Settings
- Start a new conversation (tools may not appear in existing chats)
- Try refreshing Claude Desktop

### Authentication issues
- Clear your browser cookies for smithery.ai
- Try using a different browser for authentication
- Try the alternative auth method (GitHub instead of Google, or vice versa)

### "Server unavailable" error
- The server may be restarting - wait a few minutes and try again
- Contact support if the issue persists

## Support

If you experience any issues not covered above, please contact your administrator.

---

*This MCP server provides read-only access to public Companies House data via the official Companies House API.*
