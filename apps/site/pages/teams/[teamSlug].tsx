import { database } from "@self-learning/database";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { ResolvedValue } from "@self-learning/types";
import { AuthorChip } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type Team = ResolvedValue<typeof getTeam>;

type TeamPageProps = {
	team: Team;
	markdownDescription: CompiledMarkdown | null;
};

export const getStaticProps: GetStaticProps<TeamPageProps> = async ({ params }) => {
	const slug = params?.teamSlug;

	if (typeof slug !== "string") {
		throw new Error("[slug] must be a string.");
	}

	const team = await getTeam(slug);

	if (!team) {
		return { notFound: true };
	}

	let markdownDescription = null;

	if (team.description && team.description.length > 0) {
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

export async function getStaticPaths({ locale }: { locale: string }) {
	return {
		...(await serverSideTranslations(locale, ["common"])),
		fallback: "blocking",
		paths: []
	};
}

async function getTeam(slug: string) {
	return await database.team.findUnique({
		where: { slug },
		select: {
			slug: true,
			name: true,
			imgUrl: true,
			description: true,
			authors: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true
				}
			}
		}
	});
}

export default function TeamPage({ team, markdownDescription }: TeamPageProps) {
	return (
		<div className="flex flex-col bg-white">
			<CenteredSection className="gradient">
				<div className="flex flex-col gap-16">
					<div className="relative m-auto h-[256px] w-[256px] shrink-0 rounded-lg bg-white">
						{team.imgUrl && <Image className="rounded-lg" src={team.imgUrl} alt="" />}
					</div>

					<div className="flex flex-col place-items-center gap-16">
						<h1 className="text-3xl sm:text-6xl">{team.name}</h1>
						<div className="flex flex-wrap gap-4">
							{team.authors.map(author => (
								<AuthorChip
									key={author.slug}
									slug={author.slug}
									displayName={author.displayName}
									imgUrl={author.imgUrl}
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
