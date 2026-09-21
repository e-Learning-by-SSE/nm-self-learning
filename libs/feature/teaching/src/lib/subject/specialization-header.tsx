import { PencilIcon } from "@heroicons/react/24/solid";
import { TopicHeader } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useTranslation } from "next-i18next";

type SpecializationHeaderProps = {
	specialization: {
		specializationId: string;
		subjectId: string;
		title: string;
		subtitle: string;
		imgUrlBanner: string | null;
		subject: { title: string };
	};
	parentLink: string;
	canEdit: boolean;
};

export function SpecializationHeader({
	specialization,
	parentLink,
	canEdit
}: SpecializationHeaderProps) {
	const { t } = useTranslation("common");

	return (
		<TopicHeader
			imgUrlBanner={specialization.imgUrlBanner}
			parentLink={parentLink}
			parentTitle={specialization.subject.title}
			title={specialization.title}
			subtitle={specialization.subtitle}
		>
			{canEdit && (
				<Link
					href={`/teaching/subjects/${specialization.subjectId}/${specialization.specializationId}/edit`}
					className="btn-primary absolute top-8 w-fit self-end"
				>
					<PencilIcon className="icon h-5" />
					<span>{t("edit")}</span>
				</Link>
			)}
		</TopicHeader>
	);
}
