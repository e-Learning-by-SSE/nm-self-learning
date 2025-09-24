import { trpc } from "@self-learning/api-client";
import { SubjectEditor, I18N_NAMESPACE as NS_TEACHING } from "@self-learning/teaching";
import { Subject } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { AdminGuard } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

export default function SubjectCreatePage() {
	const { mutateAsync: createSubject } = trpc.subject.create.useMutation();
	const router = useRouter();
	const { t: t_common } = useTranslation("common");
	const { t } = useTranslation("pages-admin-subjects");

	async function onSubmit(subjectFromForm: Subject) {
		try {
			console.log("Creating subject", subjectFromForm);
			const res = await createSubject(subjectFromForm);
			showToast({
				type: "success",
				title: t("Topic created"),
				subtitle: t("Topic 'title' created", { title: res.title })
			});
			// Return to previous page (subjects administration page)
			router.back();
		} catch (error) {
			console.error("Error creating subject", error);

			if (error instanceof TRPCClientError) {
				showToast({
					type: "error",
					title: t_common("Error"),
					subtitle: error.message
				});
			}
		}
	}

	return (
		<AdminGuard error={t("Topics can only be created by administrators") + "."}>
			<div className="flex flex-col bg-gray-50">
				<SubjectEditor
					initialSubject={{
						subjectId: "",
						title: "",
						slug: "",
						subtitle: "",
						cardImgUrl: null,
						imgUrlBanner: null
					}}
					onSubmit={onSubmit}
				/>
			</div>
		</AdminGuard>
	);
}

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", "pages-admin-subjects", ...NS_TEACHING]))
);
