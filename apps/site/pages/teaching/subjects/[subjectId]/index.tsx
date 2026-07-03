import { PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { AccessLevel } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { ResourceGroupChips } from "@self-learning/teaching";
import { ImageOrPlaceholder, LoadingBox, SectionHeader } from "@self-learning/ui/common";
import { CenteredContainerXL, TopicHeader, useResourceGuard } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { toResourcePermissionsForm } from "@self-learning/types";

export default function SubjectManagementPage() {
	const router = useRouter();

	const { data: subject, isLoading } = trpc.subject.getForEdit.useQuery(
		{ subjectId: router.query.subjectId as string },
		{ enabled: !!router.query.subjectId }
	);

	const permittedGroups = subject ? toResourcePermissionsForm(subject.permissions) : undefined;
	const canEdit = useResourceGuard(AccessLevel.EDIT, permittedGroups);

	if (isLoading || !subject) {
		return <LoadingBox />;
	}

	return (
		<div className="flex flex-col gap-8 pb-32">
			<TopicHeader
				imgUrlBanner={subject.imgUrlBanner}
				parentLink="/subjects"
				parentTitle="Fachgebiet"
				title={subject.title}
				subtitle={subject.subtitle}
			>
				{canEdit && (
					<Link
						href={`/teaching/subjects/${subject.subjectId}/edit`}
						className="btn-primary absolute top-8 w-fit self-end"
					>
						<PencilIcon className="icon h-5" />
						<span>Bearbeiten</span>
					</Link>
				)}
			</TopicHeader>

			<CenteredContainerXL>
				<ResourceGroupChips permissions={subject.permissions} />

				<SectionHeader
					title="Spezialisierungen"
					subtitle="Spezialisierungen dieses Fachgebiets."
				/>

				{canEdit && (
					<div className="mb-8 flex flex-wrap gap-4">
						<Link
							className="btn-primary w-fit"
							href={`/teaching/subjects/${subject.subjectId}/create`}
						>
							<PlusIcon className="icon h-5" />
							<span>Spezialisierung erstellen</span>
						</Link>
					</div>
				)}

				<ul className="flex flex-col gap-4">
					{subject.specializations.map(spec => (
						<li
							key={spec.specializationId}
							className="flex rounded-lg border border-c-border bg-white"
						>
							<ImageOrPlaceholder
								src={spec.cardImgUrl ?? undefined}
								className="w-32 rounded-l-lg object-cover"
							/>
							<div className="flex w-full flex-col justify-between gap-4 p-4">
								<div className="flex flex-col gap-2">
									<Link
										href={`/teaching/subjects/${subject.subjectId}/${spec.specializationId}`}
										className="text-lg font-semibold hover:text-c-primary"
									>
										{spec.title}
									</Link>
									<p className="text-sm text-c-text-muted">{spec.subtitle}</p>
								</div>

								<ResourceGroupChips permissions={spec.permissions} />
							</div>
						</li>
					))}
				</ul>
			</CenteredContainerXL>
		</div>
	);
}

export const getServerSideProps = withTranslations(["common"]);
