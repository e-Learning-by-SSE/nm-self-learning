import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { FolderSkillEditor } from "@self-learning/teaching";
import { LoadingBox } from "@self-learning/ui/common";

export default function CreateAndViewRepository() {
	const router = useRouter();
	const session = useSession();
	const { mutateAsync: createRep } = trpc.skill.addRepo.useMutation();
	const [repositoryID, setRepositoryID] = useState<string>("1");

	useEffect(() => {
		if (!router.query.repoSlug) return;
		if (typeof router.query.repoSlug !== "string") return;
		if (Array.isArray(router.query.repoSlug)) return;
		if (session.data?.user.id === undefined || session.data === null) return;
		const userId = session.data.user.id;
		const slug = router.query.repoSlug ?? "";
		
		// Saves two repository due to double rendering on development (react feature to detect problems in strict mode)  -> prod has no issue 
		const createNewRep = async () => {
			const newRep = {
				ownerId: userId,
				name: "New Skilltree: " + Date.now(),
				description: "New Skilltree Description"
			};
			const result = await createRep({ rep: newRep });
			console.log("New repository created", {
				repoId: result.id,
				ownerId: result.ownerId
			});
			const newRepoSlug = result.id; // route to created repo
			router.push({
				pathname: router.pathname,
				query: { ...router.query, repoSlug: newRepoSlug }
			});
		};

		if (slug === "create") {
			createNewRep();
		} else {
			setRepositoryID(slug);
		}
	}, [router.query.repoSlug, createRep, router, session.data]);

	return (
		<div>
			<FolderSkillEditor repositoryID={repositoryID} />
		</div>
	);
}
