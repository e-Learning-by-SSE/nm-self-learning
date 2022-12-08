import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { testApiHandler } from "next-test-api-route-handler";
import { z } from "zod";
import { apiHandler } from "./api-handler";
import { AlreadyExists } from "./error";

describe("apiHandler", () => {
	// TODO: disabled, because error will be logged to the console (which is correct, but confusing when inspecting test logs)
	xit("Throw Error", async () => {
		return testApiHandler({
			handler: (req, res) =>
				apiHandler(req, res, "GET", async () => {
					throw new Error("test");
				}),
			test: async ({ fetch }) => {
				const res = await fetch({ method: "GET" });
				const json = await res.json();

				expect(res.status).toEqual(500);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "Something went wrong.",
    "name": "InternalServerError",
    "statusCode": 500,
  },
}
`);
			}
		});
	});

	it("Catches ValidationFailed", () => {
		return testApiHandler({
			handler: (req, res) =>
				apiHandler(req, res, "GET", async () => {
					z.number().parse("not a number, this will throw an error!");
				}),
			test: async ({ fetch }) => {
				const res = await fetch({ method: "GET" });
				const json = await res.json();

				expect(res.status).toEqual(400);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "errors": Array [
      Object {
        "code": "invalid_type",
        "expected": "number",
        "message": "Expected number, received string",
        "path": Array [],
        "received": "string",
      },
    ],
    "name": "ValidationError",
    "statusCode": 400,
  },
}
`);
			}
		});
	});

	it("Catches MethodNotAllowed", () => {
		return testApiHandler({
			handler: (req, res) =>
				apiHandler(req, res, "GET", async () => {
					// This will throw an error, because the method is not allowed
				}),
			test: async ({ fetch }) => {
				const res = await fetch({ method: "DELETE" });
				const json = await res.json();

				expect(res.status).toEqual(405);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "method": "DELETE",
    "name": "MethodNotAllowed",
    "statusCode": 405,
  },
}
`);
			}
		});
	});

	it("Catches ApiError", () => {
		return testApiHandler({
			handler: (req, res) =>
				apiHandler(req, res, "GET", async () => {
					throw AlreadyExists("Throwing...");
				}),
			test: async ({ fetch }) => {
				const res = await fetch({ method: "GET" });
				const json = await res.json();

				expect(res.status).toEqual(409);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "Throwing...",
    "name": "AlreadyExists",
    "statusCode": 409,
  },
}
`);
			}
		});
	});

	it("Catches Prisma.PrismaClientKnownRequestError - P2002", () => {
		return testApiHandler({
			handler: (req, res) =>
				apiHandler(req, res, "GET", async () => {
					throw new PrismaClientKnownRequestError("Error from Prisma", {
						code: "P2002",
						clientVersion: "4.7.1",
						meta: {
							hello: "world"
						}
					});
				}),
			test: async ({ fetch }) => {
				const res = await fetch({ method: "GET" });
				const json = await res.json();

				expect(res.status).toEqual(409);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "A unique constraint failed.",
    "name": "AlreadyExists",
    "params": Object {
      "hello": "world",
    },
    "statusCode": 409,
  },
}
`);
			}
		});
	});
});
