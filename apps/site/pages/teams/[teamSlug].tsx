import { getTeamBySlug } from "@self-learning/cms-api";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { AuthorChip } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";

type Team = ResolvedValue<typeof getTeamBySlug>;

type TeamPageProps = {
	team: Team;
	markdownDescription: CompiledMarkdown | null;
};

export const getStaticProps: GetStaticProps<TeamPageProps> = async ({ params }) => {
	const teamSlug = params?.teamSlug;

	if (typeof teamSlug !== "string") {
		throw new Error("[teamSlug] must be a string.");
	}

	const team = await getTeamBySlug(teamSlug);

	let markdownDescription = null;

	if (team?.description && team.description.length > 0) {
		markdownDescription = await compileMarkdown(team.description);
		team.description = null;
	}

	return {
		props: {
			team: team as Team,
			markdownDescription
		},
		notFound: !team
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		fallback: "blocking",
		paths: []
	};
};

export default function TeamPage({ team, markdownDescription }: TeamPageProps) {
	const imgUrl = team.image?.data?.attributes?.url ?? "";

	return (
		<div className="flex flex-col bg-white">
			<CenteredSection className="gradient">
				<div className="flex flex-col gap-16">
					<div className="relative m-auto h-[256px] w-[256px] shrink-0 rounded-lg bg-white">
						<Image
							className="rounded-lg"
							objectFit="contain"
							layout="fill"
							src={`http://localhost:1337${imgUrl}`}
							alt={team.image?.data?.attributes?.alternativeText ?? ""}
						/>
					</div>

					<div className="flex flex-col place-items-center gap-16">
						<h1 className="text-3xl sm:text-6xl">{team.title}</h1>
						<div className="flex flex-wrap gap-4">
							{team.authors?.data.map(({ attributes }) => (
								<AuthorChip
									key={attributes!.slug}
									slug={attributes!.slug}
									name={attributes!.name}
									imgUrl={attributes?.image?.data?.attributes?.url}
								/>
							))}
						</div>
					</div>
				</div>
			</CenteredSection>

			{markdownDescription && (
				<CenteredSection className="bg-white">
					<div className="prose mx-auto max-w-max">
						<MDXRemote {...markdownDescription} />
					</div>
				</CenteredSection>
			)}
		</div>
	);
}
