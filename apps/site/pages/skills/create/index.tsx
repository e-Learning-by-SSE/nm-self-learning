import { SkillEditor } from "@self-learning/teaching";
import { Skills, convertNestedSkillsToArray } from '@self-learning/types';
import 'reactflow/dist/style.css';


export default function CreateSkillTree({
    onFinished
}: {
    onFinished: (skilltree: {name : string}) => void;
}) {

   // this ref stores the current dragged node
   const defaultTree: Skills = {
    id: "1",
    nestedSkills: [
        {
            id: "2",
            nestedSkills: [
                {
                    id: "3",
                    nestedSkills: [],
                    name: "test3",
                    level: 3,
                    description: "test3",
                },
            ],
            name: "test2",
            level: 1,
            description: "test2",
        },
    ],
    name: "test",
    level: 0,
    description: "test",
    };

    return(
       <div>
         <SkillEditor skilltree={defaultTree} onConfirm={onFinished} />
        </div>
    );

}