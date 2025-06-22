import { LoadingBox, SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import {
	CourseBasicInformation,
	CourseSkillView,
	CourseModulView,
	CoursePreview
} from "@self-learning/ui/course";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";

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
	const [selectedIndex, setSelectedIndex] = useState(2);
	const { data: author, isLoading } = trpc.author.getByUsername.useQuery({
		username: username ?? ""
	});

	if (isLoading) {
		<LoadingBox />;
	}

	if (!author) {
		return <div>Author Missing</div>;
	}


	function switchTab(index: number) {
		setSelectedIndex(index);
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <CourseBasicInformation />;
			case 1:
				return <CourseSkillView authorId={author.id} />;
			case 2:
				return <CourseModulView onSubmit={() => {}} />;
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
					<Tab key={idx}>{content}</Tab>
				))}
			</Tabs>
			<div>{renderContent(selectedIndex)}</div>
		</div>
	);
}
