export class JobNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "JobNotFoundError";
	}
}

export class JobValidationError extends Error {
	constructor(
		public reason: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		public issues?: any[]
	) {
		super(reason);
		this.name = "JobValidationError";
	}
}
