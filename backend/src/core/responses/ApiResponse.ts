export class ApiResponse {
  statusCode: number;
  data: object | Array<object> | null;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: object | Array<object> | null, message: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export class CreatedResponse extends ApiResponse {
  // `data` defaults to null so every existing `new CreatedResponse()` call site (not yet migrated
  // to a contract) keeps working unchanged — ALIGNMENT_PLAN.md 2B/N2 only asks that a migrated
  // route CAN return the created resource, not that every mutation must.
  constructor(data: object | Array<object> | null = null, message = 'created') {
    super(201, data, message);
  }
}

export class AcceptedResponse extends ApiResponse {
  constructor(data: object | Array<object> | null = null, message = 'accepted') {
    super(202, data, message);
  }
}

export class OkResponse extends ApiResponse {
  constructor(data: object | Array<object> | null = null) {
    super(200, data, 'ok');
  }
}
