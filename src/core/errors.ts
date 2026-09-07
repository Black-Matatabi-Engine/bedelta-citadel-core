/** Pure core risk / defense errors — zero service-layer imports. */
export class DefenseMatrixError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly reasons: string[];

  constructor(
    code: string,
    message: string,
    reasons: string[] = [],
    httpStatus = 403,
  ) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
}
