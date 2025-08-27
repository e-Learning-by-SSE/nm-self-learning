import { trpc } from "@self-learning/api-client";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseSkillView, useEditorTabs } from "@self-learning/ui/course";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { AuthorGuard } from "libs/ui/layouts/src/lib/guards";
import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"], async () => {
	return { props: {} };
});

export default function CourseSkillsPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;
	const [selectedIndex, setSelectedIndex] = useState(1);

	const username = session?.user?.name;

	const { data: author, isLoading } = trpc.author.getByUsername.useQuery(
		{ username: username as string },
		{ enabled: !!username }
	);

	const tabs = useEditorTabs();

	async function switchTab(newIndex: number) {
		setSelectedIndex(newIndex);
		const tab = tabs[newIndex];
		if (tab.path) {
			router.push(`/teaching/courses/${slug}/${tab.path}`);
		}
	}

	if (!slug) return null;
	if (isLoading) return <div>Loading...</div>;
	if (!author) return <div>Author not found.</div>;

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
				<CourseSkillView authorId={author.id} />
			</div>
		</AuthorGuard>
	);
}
