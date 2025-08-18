import { RequestHandler } from "express";

// Uncaught promise rejection crashes server
export default function asyncHandler(fn: RequestHandler): RequestHandler {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next); // Converts the handler's return value to a promise
    };
}
