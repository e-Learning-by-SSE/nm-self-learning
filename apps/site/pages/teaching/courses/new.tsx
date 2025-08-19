import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseBasicInformation } from "@self-learning/ui/course";
import { useRouter } from "next/router";

export default function NewCoursePage() {
	const router = useRouter();
	const selectedId = 0;
	const tabs = ["1. Grunddaten", "2. Skillansicht", "3. Modulansicht", "4. Vorschau"];

	return (
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedId} onChange={() => {}}>
				{tabs.map((content, idx) => (
					<Tab key={idx}>
						<span
							style={{
								opacity: idx > 0 ? 0.3 : 1,
								cursor: idx > 0 ? "not-allowed" : "pointer"
							}}
						>
							{content}
						</span>
					</Tab>
				))}
			</Tabs>
			<CourseBasicInformation
				onCourseCreated={(slug: string) => {
					router.push(`/teaching/courses/${slug}/edit`);
				}}
			/>
		</div>
	);
}
