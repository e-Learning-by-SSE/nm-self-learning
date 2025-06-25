"use client";
import { ImageOrPlaceholder } from "../image/image-placeholder";
import Link from "next/link";
import { useState } from "react";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { DialogWithReactNodeTitle } from "../dialog/dialog";
import { MarkdownViewer } from "@self-learning/ui/forms";
import { ScaleIcon } from "@heroicons/react/24/outline";

export function LicenseChip({
	name,
	description,
	imgUrl,
	url
}: {
	name: string;
	imgUrl?: string;
	description?: string;
	url?: string;
}) {
	const [openModal, setOpenModal] = useState(false);
	const defaultLogoUrl = "";

	const handleClick = (e: React.MouseEvent) => {
		if (!url) {
			e.preventDefault();
			setOpenModal(true);
		}
	};

	const iconBox = imgUrl ? (
		<ImageOrPlaceholder
			src={imgUrl ?? defaultLogoUrl}
			className="h-8 w-8 rounded object-cover"
		/>
	) : (
		<div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
			<ScaleIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
		</div>
	);

	return (
		<div className="inline-flex flex-col items-center gap-1 text-xs text-gray-500">
			<Link
				href={url || "#"}
				onClick={handleClick}
				className="flex flex-col items-center hover:text-secondary"
				style={url ? {} : { cursor: "pointer" }}
			>
				{iconBox}
				<span className="mt-1 text-[11px] text-center">{name}</span>
			</Link>

			{openModal && (
				<LicenseViewModal
					onClose={() => setOpenModal(false)}
					description={description ?? "*Keine Beschreibung für diese Lizenz vorhanden*"}
					name={name}
					logoUrl={imgUrl ?? defaultLogoUrl}
				/>
			)}
		</div>
	);
}

export function LicenseViewModal({
	description,
	name,
	logoUrl,
	onClose
}: {
	description: string;
	name: string;
	logoUrl: string;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);

	if (!open) return null;
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={<LicenseViewHeader name={name} logoUrl={logoUrl} />}
				onClose={() => {
					setOpen(false);
					onClose();
				}}
			>
				<CenteredContainer>
					<MarkdownViewer content={description} />
				</CenteredContainer>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}

function LicenseViewHeader({ name, logoUrl }: { name: string; logoUrl: string }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<ImageOrPlaceholder
					src={logoUrl}
					className={`w-30 m-0 h-10 rounded-lg object-cover`}
				/>
				<span className="text-3xl font-semibold">{name}</span>
			</div>
		</div>
	);
}
