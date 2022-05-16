import { database } from "@self-learning/database";
import { CmsNotification, CourseEntry } from "@self-learning/webhooks";
import { testApiHandler } from "next-test-api-route-handler";
import webhookApiHandler from "../../pages/api/webhooks/cms";

describe("webhookApiHandler", () => {
	it("Request method !== POST -> 405 Method Not Allowed", async () => {
		return testApiHandler({
			handler: webhookApiHandler,
			test: async ({ fetch }) => {
				const res = await fetch({ method: "PUT" });
				expect(res.status).toEqual(405);
			}
		});
	});

	it("Incorrect authorization header -> 403 Forbidden", async () => {
		return testApiHandler({
			handler: webhookApiHandler,
			test: async ({ fetch }) => {
				const res = await fetch({ method: "POST" });
				expect(res.status).toEqual(403);
			}
		});
	});

	it("No request body -> 400 ValidationError", async () => {
		return testApiHandler({
			handler: webhookApiHandler,
			requestPatcher: req =>
				(req.headers = {
					authorization: process.env.STRAPI_WEBHOOK_TOKEN,
					"content-type": "application/json"
				}),
			test: async ({ fetch }) => {
				const res = await fetch({ method: "POST" });
				const json = await res.json();
				expect(res.status).toEqual(400);
				expect(json).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "errors": Array [
      "event is a required field",
      "model is a required field",
      "entry is a required field",
    ],
    "name": "ValidationError",
    "statusCode": 400,
  },
}
`);
			}
		});
	});

	it("trigger-test -> 200 OK + NOOP", async () => {
		return testApiHandler({
			handler: webhookApiHandler,
			requestPatcher: req =>
				(req.headers = {
					authorization: process.env.STRAPI_WEBHOOK_TOKEN,
					"content-type": "application/json"
				}),
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					body: JSON.stringify({
						event: "trigger-test"
					})
				});
				const json = await res.json();
				expect(json).toMatchInlineSnapshot(`
Object {
  "operation": "NOOP",
}
`);
				expect(res.status).toEqual(200);
			}
		});
	});

	it("event.create + model course -> 201 OK + CREATED", async () => {
		const notification: CmsNotification = {
			event: "entry.create",
			model: "course",
			entry: {
				courseId: "anewcourse",
				title: "A New Course",
				subtitle: "Lorem ipsum dolor sit amet.",
				slug: "a-new-course",
				image: {
					url: "/uploads/image.png"
				}
			} as CourseEntry
		};

		await database.course.deleteMany({
			where: {
				courseId: notification.entry.courseId
			}
		});

		return testApiHandler({
			handler: webhookApiHandler,
			requestPatcher: req =>
				(req.headers = {
					authorization: process.env.STRAPI_WEBHOOK_TOKEN,
					"content-type": "application/json"
				}),
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					body: JSON.stringify(notification)
				});
				const json = await res.json();
				expect(json).toMatchInlineSnapshot(`
Object {
  "data": Object {
    "courseId": "anewcourse",
    "imgUrl": "/uploads/image.png",
    "slug": "a-new-course",
    "subtitle": "Lorem ipsum dolor sit amet.",
    "title": "A New Course",
  },
  "operation": "CREATED",
}
`);
				expect(res.status).toEqual(201);
			}
		});
	});
});
