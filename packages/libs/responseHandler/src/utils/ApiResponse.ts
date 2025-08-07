export class ApiResponse {
  statusCode: number;
  data: Object | Array<Object> | null;
  message: string;
  success: boolean;

  constructor(
    statusCode: number,
    data: Object | Array<Object> | null,
    message: string
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export class CreatedResponse extends ApiResponse {
  constructor(message = "created") {
    super(201, null, message);
  }
}

export class AcceptedResponse extends ApiResponse {
  constructor(message = "accepted") {
    super(202, null, message);
  }
}

export class OkResponse extends ApiResponse {
  constructor(data: Object | Array<Object> | null = null) {
    super(200, data, "ok");
  }
}
