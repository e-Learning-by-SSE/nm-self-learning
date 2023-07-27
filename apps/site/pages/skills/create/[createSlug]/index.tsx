import { SkillEditor, AlternateSkillEditor } from "@self-learning/teaching";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "@self-learning/api-client";
import 'reactflow/dist/style.css';
import { SkillRepositoryCreationDto } from "@self-learning/competence-rep";


export default function CreateSkillTree({
    onFinished
}: {
    onFinished: (skilltree: {name : string}) => void;
}) {

    const router = useRouter();

    //for creating a new rep
	const { mutateAsync: createRep } = trpc.skill.addRepo.useMutation();

    
    const [isLoading, setIsLoading] = useState(false);
    const [repositoryID, setRepositoryID] = useState<string>("1");

    useEffect(() => {
        const createNewRep = async () => {
            if (router.query.createSlug && typeof router.query.createSlug === "string") {
                if (router.query.createSlug === "new") {
                    setIsLoading(true);
                    //TODO make owner dynamic
                    const newRep = {
                        owner: "5",
                        name: "New Skilltree: " + Date.now(),
                        description: "New Skilltree Description",
                    } as SkillRepositoryCreationDto;

                    const result = await createRep({ rep: newRep });
                    setRepositoryID(result.id);
                    setIsLoading(false);
                } else {
                    setRepositoryID(router.query.createSlug);
                }
            }
        };

        createNewRep();
    }, [router.query.createSlug, createRep]);

   
    if (isLoading) {
        return <div>Loading...</div>;
    }

    
    /*return(
       <div>
         <SkillEditor skilltree={defaultTree} onConfirm={onFinished} />
        </div>
    ); */
    
    return(
        <div>
            <AlternateSkillEditor repositoryID={repositoryID} onConfirm={onFinished} />
        </div>
    ); 

}