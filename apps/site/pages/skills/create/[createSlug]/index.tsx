import {  AlternateSkillEditor } from "@self-learning/teaching";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";


export default function CreateSkillTree() {

    const router = useRouter();
    const session = useSession();

    //for creating a new rep
	const { mutateAsync: createRep } = trpc.skill.addRepo.useMutation();

    
    const [isLoading, setIsLoading] = useState(false);
    const [repositoryID, setRepositoryID] = useState<string>("1");

    useEffect(() => {
        const createNewRep = async () => {
            if (router.query.createSlug && typeof router.query.createSlug === "string") {
                if (router.query.createSlug === "new") {
                    setIsLoading(true);                 
                    const newRep: SkillRepositoryCreationDto = {
                        ownerId: "5",
                        name: "New Skilltree: " + Date.now(),
                        description: "New Skilltree Description",
                    };

                    const result = await createRep({ rep: newRep });
                    setRepositoryID(result.id);
                    setIsLoading(false);
                } else {
                    setRepositoryID(router.query.createSlug);
                }
            }
        };

        createNewRep();
    }, [router.query.createSlug, createRep, session.data?.user.id]);

   
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return(
        <div>
            <AlternateSkillEditor repositoryID={repositoryID} />
        </div>
    ); 

}