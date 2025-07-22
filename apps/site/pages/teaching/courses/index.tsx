import { LoadingBox, SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import {
	CourseBasicInformation,
	CourseSkillView,
	CourseModuleView,
	CoursePreview
} from "@self-learning/ui/course";
import { GetServerSideProps } from "next";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useRef, useState } from "react";

export const getServerSideProps: GetServerSideProps = withTranslations(["common"], context => {
	return withAuth(async (ctx, user) => {
		if (user.role !== "ADMIN" && !user.isAuthor) {
			return {
				redirect: {
					destination: "/403",
					permanent: false
				}
			};
		}

		return {
			props: {}
		};
	})(context);
});

export default function CourseCreationEditor() {
	const tabs = ["1. Grunddaten", "2. Skillansicht", "3. Modulansicht", "4. Vorschau"];
	const session = useRequiredSession();
	const username = session.data?.user.name;
	const [selectedIndex, setSelectedIndex] = useState(0);
	const prevIndexRef = useRef<number>(0);
	const [courseId, setCourseId] = useState<string>("");
	const [selectors, setSelectors] = useState<string[]>([]);
	const { data: author, isLoading } = trpc.author.getByUsername.useQuery(
		{
			username: username ?? ""
		},
		{
			enabled: !!username?.trim()
		}
	);

	if (isLoading) {
		<LoadingBox />;
	}

	if (!author) {
		return <div>Author missing</div>;
	}

	async function switchTab(newIndex: number) {
		if (newIndex > 0 && !courseId) {
			alert("Bitte zuerst den Kurs speichern.");
			return;
		}
		prevIndexRef.current = newIndex;
		setSelectedIndex(newIndex);
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return (
					<CourseBasicInformation
						onCourseCreated={(id: string, selectors: string[]) => {
							setCourseId(id);
							setSelectors(selectors);
						}}
					/>
				);
			case 1:
				return <CourseSkillView authorId={author.id} />;
			case 2:
				return <CourseModuleView authorId={author.id} />;
			case 3:
				return <CoursePreview />;
			default:
				return null;
		}
	};

	return (
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((content, idx) => (
					<Tab key={idx}>
						<span
							style={{
								opacity: idx > 0 && !courseId ? 0.3 : 1,
								cursor: idx > 0 && !courseId ? "not-allowed" : "pointer"
							}}
						>
							{content}
						</span>
					</Tab>
				))}
			</Tabs>
			<div>{renderContent(selectedIndex)}</div>
		</div>
	);
}
