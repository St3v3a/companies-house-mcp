#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import { config as loadEnv } from 'dotenv';
import { UKCompanyAPI } from './api/uk-company-api.js';

loadEnv();

// Config schema - exported for Smithery auto-detection
export const configSchema = z.object({
  apiKey: z.string().optional()
    .describe('Companies House API key (or use COMPANIES_HOUSE_API_KEY env var)')
});

export type Config = z.infer<typeof configSchema>;

// Smithery expects default createServer export
export default function createServer(config?: Config) {
  const apiKey = config?.apiKey || process.env.COMPANIES_HOUSE_API_KEY;

  if (!apiKey) {
    throw new Error('API key required: provide apiKey in config or set COMPANIES_HOUSE_API_KEY env var');
  }

  const api = new UKCompanyAPI({ apiKey });
  const server = new McpServer({
    name: 'uk-company-data',
    version: '1.0.0'
  });

  // Search companies
  server.tool(
    'search_companies',
    'Search for UK companies by name or number. Returns matching companies with basic info.',
    {
      query: z.string().describe('Company name or number to search'),
      items_per_page: z.number().describe('Results per page (1-100)').optional(),
      start_index: z.number().describe('Pagination start index').optional()
    },
    async (args) => {
      const result = await api.company.searchCompanies(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get company profile
  server.tool(
    'get_company_profile',
    'Get detailed company profile including status, SIC codes, accounts dates.',
    {
      company_number: z.string().describe('8-character company number')
    },
    async (args) => {
      const result = await api.company.getCompanyProfile(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get officers
  server.tool(
    'get_officers',
    'Get list of company officers (directors, secretaries, LLP members).',
    {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    },
    async (args) => {
      const result = await api.officers.getOfficers(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get filing history
  server.tool(
    'get_filing_history',
    'Get company filing history (accounts, returns, resolutions).',
    {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional(),
      category: z.string().optional()
    },
    async (args) => {
      const result = await api.filing.getFilingHistory(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get PSC (Persons with Significant Control)
  server.tool(
    'get_persons_with_significant_control',
    'Get persons with significant control (PSC) - beneficial owners.',
    {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    },
    async (args) => {
      const result = await api.psc.getPersonsWithSignificantControl(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get charges
  server.tool(
    'get_charges',
    'Get company charges (mortgages, debentures, security interests).',
    {
      company_number: z.string().describe('Company number'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    },
    async (args) => {
      const result = await api.charges.getCharges(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Search officers
  server.tool(
    'search_officers',
    'Search for company officers by name across all UK companies.',
    {
      query: z.string().describe('Officer name to search'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    },
    async (args) => {
      const result = await api.search.searchOfficers(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get registered office address
  server.tool(
    'get_registered_office_address',
    'Get the registered office address of a company.',
    {
      company_number: z.string().describe('Company number')
    },
    async (args) => {
      const result = await api.company.getRegisteredOfficeAddress(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Advanced company search
  server.tool(
    'advanced_company_search',
    'Advanced search with filters: status, type, location, dates, SIC codes.',
    {
      company_name: z.string().optional(),
      company_status: z.string().optional(),
      company_type: z.string().optional(),
      location: z.string().optional(),
      incorporated_from: z.string().optional(),
      incorporated_to: z.string().optional(),
      sic_codes: z.string().optional(),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    },
    async (args) => {
      const result = await api.search.advancedCompanySearch(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // Get officer appointments
  server.tool(
    'get_officer_appointments_list',
    'Get all company appointments for a specific officer.',
    {
      officer_id: z.string().describe('Officer ID from search results'),
      items_per_page: z.number().optional(),
      start_index: z.number().optional()
    },
    async (args) => {
      const result = await api.officers.getOfficerAppointmentsList(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  return server;
}

// CLI execution
if (process.argv[1]?.includes('index')) {
  import('@modelcontextprotocol/sdk/server/stdio.js').then(({ StdioServerTransport }) => {
    const server = createServer();
    const transport = new StdioServerTransport();
    server.server.connect(transport);
    console.error('UK Company Data MCP Server started');
  });
}
