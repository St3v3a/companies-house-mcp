import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/index.js';

export class SearchTools {
  constructor(private api: UKCompanyAPI) {}

  async advancedSearch(args: unknown) {
    const params = schemas.AdvancedCompanySearchSchema.parse(args);
    const result = await this.api.search.advancedCompanySearch(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async searchAll(args: unknown) {
    const params = schemas.SearchAllSchema.parse(args);
    const result = await this.api.search.searchAll(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async searchOfficers(args: unknown) {
    const params = schemas.SearchOfficersSchema.parse(args);
    const result = await this.api.search.searchOfficers(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async searchDisqualified(args: unknown) {
    const params = schemas.SearchDisqualifiedOfficersSchema.parse(args);
    const result = await this.api.search.searchDisqualifiedOfficers(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async alphabeticalSearch(args: unknown) {
    const params = schemas.AlphabeticalSearchSchema.parse(args);
    const result = await this.api.search.alphabeticalSearch(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async dissolvedSearch(args: unknown) {
    const params = schemas.DissolvedSearchSchema.parse(args);
    const result = await this.api.search.dissolvedSearch(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
}
