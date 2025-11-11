import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseBasicInformation } from "@self-learning/ui/course";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { useEditorTabs } from "@self-learning/ui/course";

export const getServerSideProps = withTranslations(["common", "kee"], async () => {
	return { props: {} };
});

export default function NewCoursePage() {
	const router = useRouter();
	const selectedId = 0;
	const tabs = useEditorTabs();

	return (
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedId} onChange={() => {}}>
				{tabs.map((tab, idx) => (
					<Tab key={idx}>
						<span
							style={{
								opacity: idx > 0 ? 0.3 : 1,
								cursor: idx > 0 ? "not-allowed" : "pointer"
							}}
						>
							{tab.label}
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
