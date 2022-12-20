import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";
import { ReactComponent as PersonalInformationSvg } from "../../svg/teams.svg";

export default function AdminPage() {
	const session = useRequiredSession();

	if (session.data?.user.role !== "ADMIN") {
		return (
			<CenteredSection className="bg-gray-50">
				<h1 className="mb-8 text-5xl">Halt Stop!</h1>
				<p className="text-light">Dieser Bereich ist nur für Admins verfügbar.</p>
			</CenteredSection>
		);
	}

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Verwaltung</h1>

			<div className="grid gap-8 md:grid-cols-3">
				<Card
					href="/admin/authors"
					imageElement={<PersonalInformationSvg />}
					title="Autoren verwalten"
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
			<div className="flex aspect-square h-64 w-64">{imageElement}</div>
			<span className="w-full rounded-b-lg bg-secondary p-4 text-center font-semibold text-white">
				{title}
			</span>
		</Link>
	);
}
