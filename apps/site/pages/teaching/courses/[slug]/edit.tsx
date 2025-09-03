import { trpc } from "@self-learning/api-client";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseBasicInformation, useEditorTabs } from "@self-learning/ui/course";
import { AuthorGuard } from "libs/ui/layouts/src/lib/guards";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"], async () => {
	return { props: {} };
});

export default function EditCoursePage() {
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;

	const { data: course, isLoading } = trpc.course.getCourse.useQuery(
		{ slug },
		{ enabled: !!slug }
	);

	const [selectedIndex, setSelectedIndex] = useState(0);
	const tabs = useEditorTabs();

	if (!slug || typeof slug !== "string") {
		return <div>Loading...</div>;
	}

	if (isLoading) {
		return <div>Loading course...</div>;
	}

	async function switchTab(newIndex: number) {
		setSelectedIndex(newIndex);
		const tab = tabs[newIndex];
		if (tab.path) {
			router.push(`/teaching/courses/${slug}/${tab.path}`);
		}
	}
	return (
		<AuthorGuard>
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
					onCourseCreated={(slug: string) => {
						router.push(`/teaching/courses/${slug}/edit`);
					}}
					initialCourse={course}
				/>
			</div>
		</AuthorGuard>
	);
}
