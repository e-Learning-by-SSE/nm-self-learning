import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { AuthorChip, ImageOrPlaceholder, LoadingBox } from "@self-learning/ui/common";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

export default function SubjectsPage() {
	const { data: subjects } = trpc.subject.getAllForAdminPage.useQuery();
	const { t: t_common } = useTranslation("common");
	const { t } = useTranslation("pages-admin-subjects");

	return (
		<AdminGuard>
			<CenteredSection className="bg-gray-50">
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">{t_common("Topic_other")}</h1>

					<Link href="/teaching/subjects/create" className="btn-primary w-fit">
						<PlusIcon className="icon" />
						<span>{t("Create Topic")}</span>
					</Link>
				</div>

				{!subjects ? (
					<LoadingBox />
				) : (
					<ul className="flex flex-col gap-4">
						{subjects.map(subject => (
							<li
								key={subject.subjectId}
								className="flex rounded-lg border border-light-border bg-white"
							>
								<ImageOrPlaceholder
									src={subject.cardImgUrl ?? undefined}
									className="w-32 rounded-l-lg object-cover"
								/>
								<div className="flex w-full flex-col justify-between gap-4 p-4">
									<div className="flex flex-col gap-2">
										<Link
											href={`/teaching/subjects/${subject.subjectId}`}
											className="text-lg font-semibold hover:text-secondary"
										>
											{subject.title}
										</Link>
										<p className="text-sm text-light">{subject.subtitle}</p>
									</div>

									<ul className="flex flex-wrap gap-4">
										{subject.subjectAdmin.map(admin => (
											<AuthorChip
												key={admin.author.slug}
												imgUrl={admin.author.imgUrl}
												displayName={admin.author.displayName}
												slug={admin.author.slug}
											/>
										))}
									</ul>
								</div>
							</li>
						))}
					</ul>
				)}
			</CenteredSection>
		</AdminGuard>
	);
}

export const getServerSideProps = withTranslations(["common", "pages-admin-subjects"]);
