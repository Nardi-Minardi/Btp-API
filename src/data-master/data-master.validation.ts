import { z, ZodType } from 'zod';

export class DataMasterValidation {

  static readonly SEARCH_NOTARIS_PENGGANTI: ZodType = z.object({
    nama: z.optional(z.string().trim().default('')),
  });
}
