import { trpc } from "@self-learning/api-client";
import { SubjectEditor } from "@self-learning/teaching";
import { Subject } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { AdminGuard } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";

export default function SubjectCreatePage() {
	const { mutateAsync: createSubject } = trpc.subject.create.useMutation();
	const router = useRouter();
	const trpcContext = trpc.useContext();

	async function onSubmit(subjectFromForm: Subject) {
		try {
			console.log("Creating subject", subjectFromForm);
			const res = await createSubject(subjectFromForm);
			showToast({
				type: "success",
				title: "Fachgebiet erstellt",
				subtitle: `Das Fachgebiet "${res.title}" wurde erstellt.`
			});
			router.push(`/teaching/subjects/edit/${res.subjectId}`);
		} catch (error) {
			console.error("Error creating subject", error);

			if (error instanceof TRPCClientError) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: error.message
				});
			}
		} finally {
			trpcContext.invalidate();
		}
	}

	return (
		<AdminGuard error={<>Fachgebiete können nur von Administratoren erstellt werden.</>}>
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
					specializations={[]}
					onSubmit={onSubmit}
				/>
			</div>
		</AdminGuard>
	);
}
