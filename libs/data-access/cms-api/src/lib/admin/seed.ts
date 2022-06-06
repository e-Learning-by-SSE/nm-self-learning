import { gql, GraphQLClient } from "graphql-request";
import { CourseInput, getSdk, LessonInput } from "../generated-graphql";
import { loginAsAdmin } from "./login";
import axios from "axios";

export class CmsSeedManager {
	private gqlClient!: ReturnType<typeof getSdk>;

	async init(url: string) {
		const {
			data: { jwt }
		} = await loginAsAdmin();

		this.gqlClient = getSdk(
			new GraphQLClient(url, {
				headers: {
					authorization: `Bearer ${jwt}`
				}
			})
		);
	}

	/** Deletes all (configured) entities from the CMS. */
	async deleteAll() {
		await axios.delete(`${process.env.CMS_REST_API_URL as string}/demo/delete-all`);
	}

	async createLesson(data: LessonInput) {
		const result = await this.gqlClient.createLesson({ data });
		const attributes = result.createLesson?.data?.attributes;
		return attributes as Exclude<typeof attributes, null | undefined>;
	}

	async updateLesson(data: LessonInput, id: string) {
		const result = await this.gqlClient.updateLesson({ data, id });
		const attributes = result.updateLesson?.data?.attributes;
		return attributes as Exclude<typeof attributes, null | undefined>;
	}

	async createCourse(data: CourseInput) {
		const result = await this.gqlClient.createCourse({ data });
		const attributes = result.createCourse?.data?.attributes;
		return attributes as Exclude<typeof attributes, null | undefined>;
	}
}

gql`
	mutation createLesson($data: LessonInput!) {
		createLesson(data: $data) {
			data {
				attributes {
					lessonId
					slug
					title
				}
			}
		}
	}

	mutation updateLesson($id: ID!, $data: LessonInput!) {
		updateLesson(id: $id, data: $data) {
			data {
				attributes {
					lessonId
					slug
					title
				}
			}
		}
	}

	mutation createCourse($data: CourseInput!) {
		createCourse(data: $data) {
			data {
				attributes {
					courseId
					slug
					title
				}
			}
		}
	}
`;
