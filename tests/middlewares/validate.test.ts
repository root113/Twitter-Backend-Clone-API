import validate from '../../src/middlewares/validate';
import { z } from 'zod';

describe('validate middleware', () => {
    test('invalid body returns 400 with details', () => {
        const schema = { body: z.object({ name: z.string().min(3) }) };
        const req: any = { body: { name: 'x' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        const handler = validate(schema);
        handler(req, res, next);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('valid body calls next', () => {
        const schema = { body: z.object({ name: z.string().min(1) }) };
        const req: any = { body: { name: 'ok' } };
        const res: any = {};
        const next = jest.fn();

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
