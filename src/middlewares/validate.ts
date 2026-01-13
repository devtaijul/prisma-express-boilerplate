import { ZodObject, ZodRawShape } from "zod";

export const validate =
  (schema: ZodObject<ZodRawShape>) => (req: any, res: any, next: any) => {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  };
