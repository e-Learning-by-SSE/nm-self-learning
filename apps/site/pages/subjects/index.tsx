import { SparklesIcon } from "@heroicons/react/24/solid";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { ImageCard } from "@self-learning/ui/common";
import { ItemCardGrid } from "@self-learning/ui/layouts";
import Link from "next/link";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

async function getSubjects() {
	return await database.subject.findMany({
		select: {
			slug: true,
			title: true,
			subtitle: true,
			cardImgUrl: true,
			_count: {
				select: {
					specializations: true
				}
			}
		}
	});
}

type SubjectsProps = {
	subjects: ResolvedValue<typeof getSubjects>;
};

export const getServerSideProps = withTranslations(["common"], async () => {
	const subjects = await getSubjects();

	return {
		props: {
			subjects
		}
	};
});

export default function Subjects({ subjects }: SubjectsProps) {
	const { t } = useTranslation("common");
	return (
		<div className="py-16">
			<div className="mx-auto max-w-screen-xl px-4 xl:px-0">
				<h1 className="mb-16 text-4xl sm:text-6xl">{t("Topic_other")}</h1>
				<ItemCardGrid>
					{subjects.map(subject => (
						<SubjectCard key={subject.slug} subject={subject} />
					))}
				</ItemCardGrid>
			</div>
		</div>
	);
}

function SubjectCard({ subject }: { subject: SubjectsProps["subjects"][0] }) {
	const { t } = useTranslation("common");
	return (
		<Link href={`/subjects/${subject.slug}`}>
			<ImageCard
				slug={subject.slug}
				title={subject.title}
				subtitle={subject.subtitle}
				imgUrl={subject.cardImgUrl}
				footer={
					<span className="flex items-center gap-3 text-sm font-semibold text-c-accent">
						<SparklesIcon className="h-5" />
						<span>
							{subject._count.specializations}{" "}
							{t("Focus", { count: subject._count.specializations })}
						</span>
					</span>
				}
			/>
		</Link>
	);
}
