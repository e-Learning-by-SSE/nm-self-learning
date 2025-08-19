import { isAuthor } from "@self-learning/admin";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseBasicInformation, editorTabs } from "@self-learning/ui/course";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

export const getServerSideProps = withTranslations(
	["common"],
	withAuth(async (context, user) => {
		if (!user) {
			return { redirect: { destination: "/", permanent: false } };
		}

		const slugParam = context.params?.slug;
		if (!slugParam) return { props: {} };

		const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam;
		const isUserCourseAuthor = await isAuthor(user.name, slug);

		if (!isUserCourseAuthor) {
			return { redirect: { destination: "/", permanent: false } };
		}

		return { props: {} };
	})
);

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

	const tabs = editorTabs;

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
				onCourseCreated={(slug: string) => {
					router.push(`/teaching/courses/${slug}/edit`);
				}}
				initialCourse={course}
			/>
		</div>
	);
}
