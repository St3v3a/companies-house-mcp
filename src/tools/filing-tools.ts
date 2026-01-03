import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/index.js';

export class FilingTools {
  constructor(private api: UKCompanyAPI) {}

  async list(args: unknown) {
    const params = schemas.FilingHistorySchema.parse(args);
    const result = await this.api.filing.getFilingHistory(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getItem(args: unknown) {
    const params = schemas.FilingHistoryItemSchema.parse(args);
    const result = await this.api.filing.getFilingHistoryItem(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
}
