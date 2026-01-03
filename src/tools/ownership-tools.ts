import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/index.js';

export class OwnershipTools {
  constructor(private api: UKCompanyAPI) {}

  async listPSC(args: unknown) {
    const params = schemas.PersonsWithSignificantControlSchema.parse(args);
    const result = await this.api.psc.getPersonsWithSignificantControl(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getIndividual(args: unknown) {
    const params = schemas.PSCIndividualSchema.parse(args);
    const result = await this.api.psc.getPSCIndividual(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getIndividualBeneficialOwner(args: unknown) {
    const params = schemas.PSCIndividualBeneficialOwnerSchema.parse(args);
    const result = await this.api.psc.getPSCIndividualBeneficialOwner(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getIndividualVerification(args: unknown) {
    const params = schemas.PSCIndividualVerificationSchema.parse(args);
    const result = await this.api.psc.getPSCIndividualVerification(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getIndividualFullRecord(args: unknown) {
    const params = schemas.PSCIndividualFullRecordSchema.parse(args);
    const result = await this.api.psc.getPSCIndividualFullRecord(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getCorporateEntity(args: unknown) {
    const params = schemas.PSCCorporateEntitySchema.parse(args);
    const result = await this.api.psc.getPSCCorporateEntity(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getCorporateBeneficialOwner(args: unknown) {
    const params = schemas.PSCCorporateEntityBeneficialOwnerSchema.parse(args);
    const result = await this.api.psc.getPSCCorporateEntityBeneficialOwner(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getLegalPerson(args: unknown) {
    const params = schemas.PSCLegalPersonSchema.parse(args);
    const result = await this.api.psc.getPSCLegalPerson(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getLegalPersonBeneficialOwner(args: unknown) {
    const params = schemas.PSCLegalPersonBeneficialOwnerSchema.parse(args);
    const result = await this.api.psc.getPSCLegalPersonBeneficialOwner(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getStatement(args: unknown) {
    const params = schemas.PSCStatementSchema.parse(args);
    const result = await this.api.psc.getPSCStatement(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async listStatements(args: unknown) {
    const params = schemas.PSCStatementsListSchema.parse(args);
    const result = await this.api.psc.getPSCStatementsList(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getSuperSecure(args: unknown) {
    const params = schemas.PSCSuperSecureSchema.parse(args);
    const result = await this.api.psc.getPSCSuperSecure(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getSuperSecureBeneficialOwner(args: unknown) {
    const params = schemas.PSCSuperSecureBeneficialOwnerSchema.parse(args);
    const result = await this.api.psc.getPSCSuperSecureBeneficialOwner(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
}
