import { ImageOrPlaceholder } from "../image/image-placeholder";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LicenseViewModal } from "@self-learning/lesson";

export function LicenseChip({
	name,
	description,
	imgUrl,
	url
}: {
	name: string;
	imgUrl?: string | null;
	description?: string;
	url?: string;
}) {
	const [openModal, setOpenModal] = useState(false);
	const [isSquare, setSquare] = useState<boolean>(true);

	useEffect(() => {
		if (imgUrl === undefined || imgUrl === null) {
			setSquare(true);
		}
		const img = new Image();
		img.onload = () => {
			if (img.width !== img.height) {
				setSquare(false);
			} else {
				setSquare(true);
			}
		};
		img.src = imgUrl ?? "";
	}, [imgUrl]);

	return (
		<div>
			{!url && (
				<div
					className={`flex items-center gap-4 rounded-lg border border-light-border bg-white
                    ${isSquare ? "pr-4" : ""} text-sm`}
					onClick={() => setOpenModal(true)}
					style={{ cursor: "pointer" }}
				>
					<ImageOrPlaceholder
						src={imgUrl ?? undefined}
						className={`h-10 ${isSquare ? "w-10" : "w-30"} rounded-l-lg object-cover`}
					/>
					{isSquare && <span className="font-medium hover:text-secondary">{name}</span>}
				</div>
			)}
			{url && (
				<div>
					<Link
						href={url}
						className={`flex items-center gap-4 rounded-lg border border-light-border bg-white
                        ${isSquare ? "pr-4" : ""} text-sm`}
						data-testid="author"
					>
						<ImageOrPlaceholder
							src={imgUrl ?? undefined}
							className={`h-10 ${
								isSquare ? "w-10" : "w-30"
							} rounded-l-lg object-cover`}
						/>
						{isSquare && (
							<span className="font-medium hover:text-secondary">{name}</span>
						)}
					</Link>
				</div>
			)}
			{openModal && (
				<LicenseViewModal
					onClose={() => {
						setOpenModal(false);
					}}
					description={description ?? "No description provided"}
					name={name}
					logoUrl={imgUrl ?? ""}
				/>
			)}
		</div>
	);
}
