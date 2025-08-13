import { isAuthor } from "@self-learning/admin";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { CourseSkillView } from "@self-learning/ui/course";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

export const getServerSideProps = withTranslations(
	["common"],
	withAuth(async (context, user) => {
		console.log("# user", user);
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

		return { props: { username: user.name } };
	})
);

type Props = { username: string };

export default function CourseSkillsPage({ username }: Props) {
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;
	const [selectedIndex, setSelectedIndex] = useState(1);
	const { data: author, isLoading } = trpc.author.getByUsername.useQuery({ username: username });

	const tabs = [
		{ label: "1. Grunddaten", path: "edit" },
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

	if (!slug) {
		return null;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!author) {
		return <div>Author not found.</div>;
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
			<CourseSkillView authorId={author.id} />
		</div>
	);
}
