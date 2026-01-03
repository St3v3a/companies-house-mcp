import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/index.js';

export class ChargeTools {
  constructor(private api: UKCompanyAPI) {}

  async list(args: unknown) {
    const params = schemas.ChargesSchema.parse(args);
    const result = await this.api.charges.getCharges(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getDetails(args: unknown) {
    const params = schemas.ChargeDetailsSchema.parse(args);
    const result = await this.api.charges.getChargeDetails(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
}
