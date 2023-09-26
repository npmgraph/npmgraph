export default class HttpError extends Error {
  code: number;

  constructor(code: number, message = `HTTP Error ${code}`) {
    super(message);
    this.code = code;
  }
}
