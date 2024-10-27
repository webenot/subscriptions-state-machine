export class StripeRequestException extends Error {
  code?: string | undefined;
  declineCode?: string | undefined;

  constructor(message?: string, code?: string, declineCode?: string) {
    super(message);
    this.code = code;
    this.declineCode = declineCode;
  }
}
