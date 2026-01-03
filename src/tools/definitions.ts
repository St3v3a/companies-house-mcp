import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  getCompanyTools,
  getSearchTools,
  getOfficersTools,
  getFilingTools,
  getChargesTools,
  getPSCTools,
  getDocumentTools
} from './tools-definition.js';

export function getToolDefinitions(): Tool[] {
  return [
    ...getCompanyTools(),
    ...getSearchTools(),
    ...getOfficersTools(),
    ...getFilingTools(),
    ...getChargesTools(),
    ...getPSCTools(),
    ...getDocumentTools()
  ];
}
