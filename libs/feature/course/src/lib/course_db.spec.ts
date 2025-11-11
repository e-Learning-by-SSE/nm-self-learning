import { getCombinedCourses } from "./course_db";

describe("course_db Test", () => {

    it("should retrieve combined courses", async () => {
        const courses = await getCombinedCourses();
        expect(courses).toBeDefined();
        expect(courses.length).toBeGreaterThan(0);
    });

});
