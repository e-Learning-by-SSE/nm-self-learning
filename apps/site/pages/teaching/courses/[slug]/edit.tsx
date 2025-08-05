import { trpc } from "@self-learning/api-client";
import { CourseFormModel, RelaxedCourseFormModel } from "@self-learning/teaching";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseBasicInformation } from "@self-learning/ui/course";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

export default function EditCoursePage() {
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;

	const { data: course, isLoading } = trpc.course.getCourse.useQuery(
		{ slug },
		{ enabled: !!slug }
	);

	const [selectedIndex, setSelectedIndex] = useState(0);
	if (!slug || typeof slug !== "string") {
		return <div>Loading...</div>;
	}

	if (isLoading) {
		return <div>Loading course...</div>;
	}

	const tabs = [
		{ label: "1. Grunddaten", path: "" },
		{ label: "2. Skillansicht", path: "skills" },
		{ label: "3. Modulansicht", path: "modules" },
		{ label: "4. Vorschau", path: "preview" }
	];

	async function switchTab(newIndex: number) {
		setSelectedIndex(newIndex);
		const tab = tabs[newIndex];
		if (tab.path) {
			router.push(`/teaching/courses/${slug}/${tab.path}`);
		}
	}
	return (
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((tab, idx) => (
					<Tab key={idx}>
						<span>{tab.label}</span>
					</Tab>
				))}
			</Tabs>
			<CourseBasicInformation
				onCourseCreated={(slug: string, selectors: string[]) => {
					router.push(`/teaching/courses/${slug}/edit`);
				}}
				initialCourse={course}
			/>
		</div>
	);
}
