export class HttpError extends Error {
    public status: number;
    public details?: any;

    constructor(status: number, message: string, details?: any) {
        super(message);
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export default HttpError;
