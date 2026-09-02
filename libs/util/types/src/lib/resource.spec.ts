import { AccessLevel } from "@prisma/client";
import {
	getResourceAccessFormKey,
	getResourceSearchEntryKey,
	normalizeFormResourceAccess,
	ResourceAccessFormType,
	ResourceAccessSchema,
	ResourceInputSchema,
	ResourcePermissionsFormSchema,
	stripFormResourceAccess,
	toResourceAccessForm,
	toResourcePermissionsForm
} from "./resource";

describe("ResourceInputSchema", () => {
	it.each([
		[{ courseId: "c1" }, { courseId: "c1" }],
		[{ lessonId: "l1" }, { lessonId: "l1" }],
		[{ specializationId: "sp1" }, { specializationId: "sp1" }],
		[{ subjectId: "sb1" }, { subjectId: "sb1" }]
	])("accepts exactly one resource id %#", (input, expected) => {
		expect(ResourceInputSchema.parse(input)).toEqual(expected);
	});

	it("rejects zero or multiple resource ids", () => {
		expect(() => ResourceInputSchema.parse({})).toThrow();
		expect(() => ResourceInputSchema.parse({ courseId: "c1", lessonId: "l1" })).toThrow();
	});
});

describe("ResourceAccessSchema", () => {
	it("parses access with a single resource id", () => {
		expect(
			ResourceAccessSchema.parse({
				subjectId: "sb1",
				accessLevel: AccessLevel.EDIT
			})
		).toEqual({ subjectId: "sb1", accessLevel: AccessLevel.EDIT });
	});
});

describe("ResourcePermissionsFormSchema", () => {
	it("requires at least one FULL permission", () => {
		expect(() =>
			ResourcePermissionsFormSchema.parse([
				{ groupId: 1, groupName: "G1", accessLevel: AccessLevel.VIEW }
			])
		).toThrow();

		expect(
			ResourcePermissionsFormSchema.parse([
				{ groupId: 1, groupName: "G1", accessLevel: AccessLevel.FULL }
			])
		).toHaveLength(1);
	});
});

describe("resource form helpers", () => {
	const permissions = [
		{
			accessLevel: AccessLevel.FULL,
			group: { id: 10, name: "Editors" }
		}
	] as Parameters<typeof toResourcePermissionsForm>[0];

	it("toResourcePermissionsForm maps prisma permissions", () => {
		expect(toResourcePermissionsForm(permissions)).toEqual([
			{ accessLevel: AccessLevel.FULL, groupId: 10, groupName: "Editors" }
		]);
	});

	it.each([
		["course", "c1", "course-slug", "Course"],
		["lesson", "l1", "lesson-slug", "Lesson"],
		["specialization", "sp1", "sp-slug", "Spec"],
		["subject", "sb1", "sb-slug", "Subject"]
	] as const)(
		"toResourceAccessForm and stripFormResourceAccess round-trip for %s",
		(kind, id, slug, title) => {
			const entry = {
				kind,
				id,
				key: getResourceSearchEntryKey({ kind, id }),
				title,
				slug
			};
			const form = toResourceAccessForm(entry, AccessLevel.EDIT);
			expect(stripFormResourceAccess(form)).toMatchObject({
				accessLevel: AccessLevel.EDIT,
				...(kind === "course" && { courseId: id }),
				...(kind === "lesson" && { lessonId: id }),
				...(kind === "specialization" && { specializationId: id }),
				...(kind === "subject" && { subjectId: id })
			});
			const normalized = normalizeFormResourceAccess(form);
			expect(normalized.kind).toBe(kind);
			expect(normalized.id).toBe(id);
			expect(getResourceAccessFormKey(form)).toBe(getResourceSearchEntryKey({ kind, id }));
		}
	);

	it("normalizeFormResourceAccess throws for invalid form", () => {
		const invalid = { accessLevel: AccessLevel.VIEW } as ResourceAccessFormType;
		expect(() => normalizeFormResourceAccess(invalid)).toThrow("Invalid resource input");
	});
});
