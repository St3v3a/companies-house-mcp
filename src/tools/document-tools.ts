import { UKCompanyAPI } from '../api/uk-company-api.js';
import * as schemas from '../types/document.js';

export class DocumentTools {
  constructor(private api: UKCompanyAPI) {}

  async getMetadata(args: unknown) {
    const params = schemas.DocumentMetadataSchema.parse(args);
    const result = await this.api.document.getDocumentMetadata(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  async getContent(args: unknown) {
    const params = schemas.DocumentContentSchema.parse(args);
    const result = await this.api.document.getDocumentContent(params);
    return {
      content: [
        {
          type: 'text',
          text: `Document retrieved (${result.length} bytes). Content is binary PDF data.`
        }
      ]
    };
  }
}
