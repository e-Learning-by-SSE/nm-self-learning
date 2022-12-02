import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";
import { ReactComponent as SoftwareEngineerSvg } from "../../svg/software-engineer.svg";
import { ReactComponent as TutorialSvg } from "../../svg/tutorial.svg";
import { ReactComponent as EnvStudySvg } from "../../svg/environmental-study.svg";

export default function TeachingPage() {
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Content-Management</h1>

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
					href="/teaching/subjects"
					imageElement={<EnvStudySvg />}
					title="Fachgebiete verwalten"
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
		<Link
			href={href}
			className="flex flex-col place-items-center gap-4 rounded-lg border border-light-border bg-white pt-4"
		>
			<div className="flex aspect-square w-64">{imageElement}</div>
			<span className="w-full rounded-b-lg bg-secondary p-4 text-center font-semibold text-white">
				{title}
			</span>
		</Link>
	);
}
