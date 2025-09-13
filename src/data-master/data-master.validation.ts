import { z, ZodType } from 'zod';

export class DataMasterValidation {
  static readonly SEARCH_NOTARIS_PENGGANTI: ZodType = z.object({
    nama: z.optional(z.string().trim().default('')),
  });

  static readonly GET_DATA_MASTER: ZodType = z.object({
    search: z.string().optional(),
    page: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number(),
    ),
    limit: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number(),
    ),
    orderBy: z.string().optional(),
    orderDirection: z.enum(['asc', 'desc']).optional(),
    filters: z.record(z.any()).optional(),
  });
}
