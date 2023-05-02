import { ImageOrPlaceholder } from "../image/image-placeholder";
import Link from "next/link";
import { useState } from "react";
import {LicenseViewModal} from "@self-learning/lesson";

export function LicenseChip({ name, description, imgUrl, url }: {name: string, imgUrl?: string | null, 
    description?: string, url?: string}) {

    const [openModal, setOpenModal] = useState(false);

	return (
        <div>
        {!url &&(
            <div className="flex items-center gap-4 rounded-lg border border-light-border bg-white pr-4 text-sm" 
            onClick={() => setOpenModal(true)} 
            style={{cursor: "pointer"}}>
                <ImageOrPlaceholder
                    src={imgUrl ?? undefined}
                    className="h-10 w-10 rounded-l-lg object-cover"
                />
                <span className="font-medium hover:text-secondary">{name}</span>
            </div>    
        )}
        {url && (
            <div>
                <Link
                    href={url}
                    className="flex items-center gap-4 rounded-lg border border-light-border bg-white pr-4 text-sm"
                    data-testid="author"
		        >
                    <ImageOrPlaceholder
                        src={imgUrl ?? undefined}
                        className="h-10 w-10 rounded-l-lg object-cover"
                    />
                    <span className="font-medium hover:text-secondary">{name}</span>
                </Link>
            </div>

        )}
        { openModal &&
				<LicenseViewModal 
					onClose={() => {setOpenModal(false)}} 
					description={description ?? "No description provided"}
					name={name}
					logoUrl={imgUrl ?? ""}
				/> }
        </div>     
	);
}

/*
<ImageOrPlaceholder
            src={logoUrl ?? undefined}
            className="m-0 h-10 w-10 rounded-lg object-cover"





            neues

             <ImageOrPlaceholder
                        src={imgUrl ?? undefined}
                        className="h-10 w-10 rounded-l-lg object-cover"
                    />

                    
                */

