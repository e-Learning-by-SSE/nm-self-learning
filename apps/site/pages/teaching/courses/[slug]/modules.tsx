import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseModuleView, useEditorTabs } from "@self-learning/ui/course";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { AuthorGuard } from "libs/ui/layouts/src/lib/guards";
import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common", "kee"], async () => {
	return { props: {} };
});

export default function CourseModulesPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;
	const [selectedIndex, setSelectedIndex] = useState(2);

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

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!author) {
		return <div>Author not found.</div>;
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
				<CourseModuleView authorId={author.id} />
			</div>
		</AuthorGuard>
	);
}
