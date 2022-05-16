import { database } from "@self-learning/database";
import { testApiHandler } from "next-test-api-route-handler";
import { addCompetenceApiHandler } from "../../pages/api/users/[username]/competences/[competenceId]/add-competence";

describe("addCompetenceApiHandler", () => {
	it("Query: Missing [username] -> ValidationError (400)", async () => {
		return testApiHandler({
			handler: addCompetenceApiHandler,
			params: {
				competenceId: "competence-1"
			},
			test: async ({ fetch }) => {
				const res = await fetch({ method: "POST" });
				const json = await res.json();

				expect(res.status).toEqual(400);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "errors": Array [
      "username is a required field",
    ],
    "name": "ValidationError",
    "statusCode": 400,
  },
}
`);
				expect(json.error.statusCode).toEqual(400);
				expect(res.status).toEqual(400);
			}
		});
	});

	it("Query: Missing [competenceId] -> ValidationError (400)", async () => {
		return testApiHandler({
			handler: addCompetenceApiHandler,
			params: {
				username: "mustermann"
			},
			test: async ({ fetch }) => {
				const res = await fetch({ method: "POST" });
				const json = await res.json();

				expect(res.status).toEqual(400);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "errors": Array [
      "competenceId is a required field",
    ],
    "name": "ValidationError",
    "statusCode": 400,
  },
}
`);
				expect(json.error.statusCode).toEqual(400);
			}
		});
	});

	it("Body: Missing [lessonSlug] -> ValidationError (400)", async () => {
		return testApiHandler({
			handler: addCompetenceApiHandler,
			params: {
				username: "mustermann",
				competenceId: "competence-1"
			},
			test: async ({ fetch }) => {
				const res = await fetch({ method: "POST" });
				const json = await res.json();

				expect(res.status).toEqual(400);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "errors": Array [
      "Request body must be an object with the following keys: lessonSlug",
    ],
    "name": "ValidationError",
    "statusCode": 400,
  },
}
`);
				expect(json.error.statusCode).toEqual(400);
			}
		});
	});

	it("Body: Empty [lessonSlug] -> ValidationError (400)", async () => {
		return testApiHandler({
			handler: addCompetenceApiHandler,
			requestPatcher: req => (req.headers = { "content-type": "application/json" }),
			params: {
				username: "mustermann",
				competenceId: "competence-1"
			},
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					body: JSON.stringify({ lessonSlug: "" })
				});
				const json = await res.json();

				expect(res.status).toEqual(400);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "errors": Array [
      "lessonSlug is a required field",
    ],
    "name": "ValidationError",
    "statusCode": 400,
  },
}
`);
				expect(json.error.statusCode).toEqual(400);
			}
		});
	});

	it("AchievedCompetence from this lesson already exists -> AlreadyExists (409)", async () => {
		database.achievedCompetence.findUnique = jest.fn().mockResolvedValue({});

		return testApiHandler({
			handler: addCompetenceApiHandler,
			requestPatcher: req => (req.headers = { "content-type": "application/json" }),
			params: {
				username: "mustermann",
				competenceId: "competence-1"
			},
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					body: JSON.stringify({ lessonSlug: "test-lesson" })
				});
				const json = await res.json();

				expect(res.status).toEqual(409);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "User already has achieved this competence from this lesson.",
    "name": "AlreadyExists",
    "params": Object {
      "competenceId": "competence-1",
      "lessonSlug": "test-lesson",
      "username": "mustermann",
    },
    "statusCode": 409,
  },
}
`);
				expect(json.error.statusCode).toEqual(409);
			}
		});
	});
});
