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
	const [isLoading, setIsLoading] = useState(false);
	const [repositoryID, setRepositoryID] = useState<string>("1");

	useEffect(() => {
		if (!router.query.createSlug) return;
		if (typeof router.query.createSlug !== "string") return;
		if (Array.isArray(router.query.createSlug)) return;
		if (session.data?.user.id === undefined) return;
		const userId = session.data.user.id;
		const slug = router.query.createSlug ?? "";

		const createNewRep = async () => {
			setIsLoading(true);
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
			setRepositoryID(result.id);
			setIsLoading(false);
		};

		if (slug === "new") {
			createNewRep();
		} else {
			setRepositoryID(slug);
		}
	}, [router.query.createSlug, createRep, session.data?.user.id]);

	return (
		<div>{isLoading ? <LoadingBox /> : <FolderSkillEditor repositoryID={repositoryID} />}</div>
	);
}
