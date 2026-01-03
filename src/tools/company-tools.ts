import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/index.js';

export class CompanyTools {
  constructor(private api: UKCompanyAPI) {}

  async search(args: unknown) {
    const params = schemas.CompanySearchSchema.parse(args);
    const result = await this.api.company.searchCompanies(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getProfile(args: unknown) {
    const params = schemas.CompanyProfileSchema.parse(args);
    const result = await this.api.company.getCompanyProfile(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getAddress(args: unknown) {
    const params = schemas.RegisteredOfficeAddressSchema.parse(args);
    const result = await this.api.company.getRegisteredOfficeAddress(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getRegisters(args: unknown) {
    const params = schemas.RegistersSchema.parse(args);
    const result = await this.api.company.getRegisters(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getInsolvency(args: unknown) {
    const params = schemas.InsolvencySchema.parse(args);
    const result = await this.api.company.getInsolvency(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getExemptions(args: unknown) {
    const params = schemas.ExemptionsSchema.parse(args);
    const result = await this.api.company.getExemptions(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getEstablishments(args: unknown) {
    const params = schemas.UKEstablishmentsSchema.parse(args);
    const result = await this.api.company.getUKEstablishments(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
}
