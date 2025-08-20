import errorHandler from '../../src/middlewares/errorHandler';
import HttpError from '../../src/errors/HttpError';

test('errorHandler sends proper status and JSON', () => {
    const req: any = { get: jest.fn().mockReturnValue('req-id-1') };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res: any = { status };
    const next = jest.fn();

    const err = new HttpError(418, 'I am a teapot');

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(418);
    expect(json).toHaveBeenCalledWith({
        error: 'I am a teapot',
        request_id: 'req-id-1'
    });
});
