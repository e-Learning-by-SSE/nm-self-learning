import { database } from "@self-learning/database";
import { CenteredSection } from "@self-learning/ui/layouts";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { ReactComponent as TutorialSvg } from "../../svg/tutorial.svg";
import { ReactComponent as SoftwareEngineerSvg } from "../../svg/software-engineer.svg";
import { ReactComponent as TeamsSvg } from "../../svg/teams.svg";
import { ReactComponent as PersonalInformationSvg } from "../../svg/personal-information.svg";

export const getServerSideProps = async () => {
	const lessons = await database.lesson.findMany({
		select: {
			title: true,
			slug: true,
			lessonId: true
		}
	});

	return {
		props: { lessons }
	};
};

export default function TeachingPage({
	lessons
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Verwaltung</h1>

			<div className="grid gap-16 md:grid-cols-2">
				<Card
					href="/teaching/lessons"
					imageElement={<TutorialSvg />}
					title="Lerneinheiten verwalten"
				/>

				<Card
					href="/teaching/courses"
					imageElement={<SoftwareEngineerSvg />}
					title="Kurse verwalten"
				/>

				<Card
					href="/"
					imageElement={<PersonalInformationSvg />}
					title="Autoren verwalten (nicht implementiert)"
				/>

				<Card
					href="/"
					imageElement={<TeamsSvg />}
					title="Arbeitsgruppen verwalten (nicht implementiert)"
				/>
			</div>
		</CenteredSection>
	);
}

function Card({
	imageElement,
	title,
	href
}: {
	imageElement: React.ReactNode;
	title: string;
	href: string;
}) {
	return (
		<Link href={href}>
			<a className="flex flex-col place-items-center gap-4 rounded-lg border border-light-border bg-white pt-4">
				<div className="flex aspect-square w-64">{imageElement}</div>
				<span className="w-full rounded-b-lg bg-secondary p-4 text-center font-semibold text-white">
					{title}
				</span>
			</a>
		</Link>
	);
}
