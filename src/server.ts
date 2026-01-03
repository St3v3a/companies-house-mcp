/**
 * UK Company Data MCP Server
 * Provides access to Companies House API for UK company information
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { UKCompanyAPI } from './api/uk-company-api.js';
import { getToolDefinitions } from './tools/definitions.js';
import { CompanyTools } from './tools/company-tools.js';
import { SearchTools } from './tools/search-tools.js';
import { OfficerTools } from './tools/officer-tools.js';
import { FilingTools } from './tools/filing-tools.js';
import { ChargeTools } from './tools/charge-tools.js';
import { OwnershipTools } from './tools/ownership-tools.js';
import { DocumentTools } from './tools/document-tools.js';

export interface ServerOptions {
  apiKey: string;
  baseUrl?: string;
}

export class UKCompanyServer {
  private server: Server;
  private api: UKCompanyAPI;
  private companyTools: CompanyTools;
  private searchTools: SearchTools;
  private officerTools: OfficerTools;
  private filingTools: FilingTools;
  private chargeTools: ChargeTools;
  private ownershipTools: OwnershipTools;
  private documentTools: DocumentTools;

  constructor(options: ServerOptions) {
    this.server = new Server(
      {
        name: 'uk-company-data',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.api = new UKCompanyAPI({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl
    });

    // Set up tool handlers
    this.companyTools = new CompanyTools(this.api);
    this.searchTools = new SearchTools(this.api);
    this.officerTools = new OfficerTools(this.api);
    this.filingTools = new FilingTools(this.api);
    this.chargeTools = new ChargeTools(this.api);
    this.ownershipTools = new OwnershipTools(this.api);
    this.documentTools = new DocumentTools(this.api);

    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: getToolDefinitions()
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        return await this.routeToolCall(name, args);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }]
        };
      }
    });
  }

  private async routeToolCall(toolName: string, args: unknown) {
    // Company information
    if (toolName === 'search_companies') return this.companyTools.search(args);
    if (toolName === 'get_company_profile') return this.companyTools.getProfile(args);
    if (toolName === 'get_registered_office_address') return this.companyTools.getAddress(args);
    if (toolName === 'get_registers') return this.companyTools.getRegisters(args);
    if (toolName === 'get_insolvency') return this.companyTools.getInsolvency(args);
    if (toolName === 'get_exemptions') return this.companyTools.getExemptions(args);
    if (toolName === 'get_uk_establishments') return this.companyTools.getEstablishments(args);

    // Search operations
    if (toolName === 'advanced_company_search') return this.searchTools.advancedSearch(args);
    if (toolName === 'search_all') return this.searchTools.searchAll(args);
    if (toolName === 'search_officers') return this.searchTools.searchOfficers(args);
    if (toolName === 'search_disqualified_officers') return this.searchTools.searchDisqualified(args);
    if (toolName === 'alphabetical_search') return this.searchTools.alphabeticalSearch(args);
    if (toolName === 'dissolved_search') return this.searchTools.dissolvedSearch(args);

    // Officer operations
    if (toolName === 'get_officers') return this.officerTools.list(args);
    if (toolName === 'get_officer_appointment') return this.officerTools.getAppointment(args);
    if (toolName === 'get_officer_appointments_list') return this.officerTools.listAppointments(args);
    if (toolName === 'get_corporate_officer_disqualification') return this.officerTools.getCorporateDisqualification(args);
    if (toolName === 'get_natural_officer_disqualification') return this.officerTools.getNaturalDisqualification(args);

    // Filing history
    if (toolName === 'get_filing_history') return this.filingTools.list(args);
    if (toolName === 'get_filing_history_item') return this.filingTools.getItem(args);

    // Charges (mortgages/debentures)
    if (toolName === 'get_charges') return this.chargeTools.list(args);
    if (toolName === 'get_charge_details') return this.chargeTools.getDetails(args);

    // PSC / Ownership
    if (toolName === 'get_persons_with_significant_control') return this.ownershipTools.listPSC(args);
    if (toolName === 'get_psc_individual') return this.ownershipTools.getIndividual(args);
    if (toolName === 'get_psc_individual_beneficial_owner') return this.ownershipTools.getIndividualBeneficialOwner(args);
    if (toolName === 'get_psc_individual_verification') return this.ownershipTools.getIndividualVerification(args);
    if (toolName === 'get_psc_individual_full_record') return this.ownershipTools.getIndividualFullRecord(args);
    if (toolName === 'get_psc_corporate_entity') return this.ownershipTools.getCorporateEntity(args);
    if (toolName === 'get_psc_corporate_entity_beneficial_owner') return this.ownershipTools.getCorporateBeneficialOwner(args);
    if (toolName === 'get_psc_legal_person') return this.ownershipTools.getLegalPerson(args);
    if (toolName === 'get_psc_legal_person_beneficial_owner') return this.ownershipTools.getLegalPersonBeneficialOwner(args);
    if (toolName === 'get_psc_statement') return this.ownershipTools.getStatement(args);
    if (toolName === 'get_psc_statements_list') return this.ownershipTools.listStatements(args);
    if (toolName === 'get_psc_super_secure') return this.ownershipTools.getSuperSecure(args);
    if (toolName === 'get_psc_super_secure_beneficial_owner') return this.ownershipTools.getSuperSecureBeneficialOwner(args);

    // Documents
    if (toolName === 'get_document_metadata') return this.documentTools.getMetadata(args);
    if (toolName === 'get_document_content') return this.documentTools.getContent(args);

    throw new Error(`Unknown tool: ${toolName}`);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('UK Company Data MCP Server v1.0.0 started');
    console.error(`Available tools: ${getToolDefinitions().length}`);
  }

  getInstance(): Server {
    return this.server;
  }

  getAPI(): UKCompanyAPI {
    return this.api;
  }
}
