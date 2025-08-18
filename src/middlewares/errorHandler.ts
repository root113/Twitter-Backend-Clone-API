//! Register this as the last middleware

import { Request, Response, NextFunction } from 'express';
import HttpError from '../errors/HttpError';

export default function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const status = err instanceof HttpError ? err.status : err?.status || 500;
    const message = err?.message || 'Internal Server Error';

    // TODO: Log full error server-side (do not send stack traces to clients)

    res.status(status).json({
        error: message,
        request_id: req.get('X-Request-ID') || null
    });
}
