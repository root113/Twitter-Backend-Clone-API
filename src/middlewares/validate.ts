import type { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

type Schemas = {
    body?: ZodType<any>;
    params?: ZodType<any>;
    query?: ZodType<any>;
};

export default function validate(schemas: Schemas) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.params) req.params = schemas.params.parse(req.params);
            if (schemas.query) req.query = schemas.query.parse(req.query);
            return next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    error: 'ValidationError',
                    details: err.issues.map(e => ({
                        path: e.path.join('.'),
                        message: e.message,
                        code: e.code,
                    })),
                });
            }
            return next(err);
        }
    };
}
