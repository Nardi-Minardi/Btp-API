import { z, ZodError } from 'zod';
import dayjs from 'dayjs';

export class CmsMenuValidation {
  static createSchema = z.object({
    title: z.string().min(1, 'title is required'),
    module_id: z.number(),
  });

  static updateSchema = z.object({
    title: z.string().min(1, 'title is required'),
    module_id: z.number(),
  });

  static assingMenuSchema = z.object({
    user_id: z.number(),
    permissions: z.array(z.enum(['view', 'create', 'edit', 'delete'])),
  });
}

