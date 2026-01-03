import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/index.js';

export class OfficerTools {
  constructor(private api: UKCompanyAPI) {}

  async list(args: unknown) {
    const params = schemas.OfficersSchema.parse(args);
    const result = await this.api.officers.getOfficers(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getAppointment(args: unknown) {
    const params = schemas.OfficerAppointmentSchema.parse(args);
    const result = await this.api.officers.getOfficerAppointment(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async listAppointments(args: unknown) {
    const params = schemas.OfficerAppointmentsListSchema.parse(args);
    const result = await this.api.officers.getOfficerAppointmentsList(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getCorporateDisqualification(args: unknown) {
    const params = schemas.CorporateOfficerDisqualificationSchema.parse(args);
    const result = await this.api.officers.getCorporateOfficerDisqualification(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getNaturalDisqualification(args: unknown) {
    const params = schemas.NaturalOfficerDisqualificationSchema.parse(args);
    const result = await this.api.officers.getNaturalOfficerDisqualification(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
}
