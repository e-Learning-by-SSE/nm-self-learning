import { PencilIcon } from "@heroicons/react/24/solid";
import React, { PropsWithChildren } from "react";
import { trpc } from "@self-learning/api-client";
import { Location } from "@self-learning/diary";
import {
	ButtonSmallX,
	Dialog,
	DialogActions,
	LoadingBox,
	StarRating
} from "@self-learning/ui/common";
import Image from "next/image";
import { useRef, useState } from "react";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";

export function Tile({
	onToggleEdit,
	tileName,
	isFilled,
	children
}: PropsWithChildren<{
	onToggleEdit: (open: boolean) => void;
	tileName: string;
	isFilled: boolean;
}>) {
	return (
		<div
			className={`relative flex max-h-[200px] min-h-[200px] items-center justify-center rounded border cursor-pointer ${
				isFilled ? "bg-green-100" : "bg-gray-100"
			}`}
			onClick={() => onToggleEdit(true)}
		>
			<div className="absolute top-2 left-2 text-gray-800">{tileName}</div>
			<div className="absolute top-2 right-2">
				<PencilIcon
					className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
					onClick={() => onToggleEdit(true)}
				/>
			</div>

			{children}
		</div>
	);
}

// import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
// import React, { useState } from "react";

// export function Tile({
// 	children,
// 	tileName,
// 	isFilled,
// 	expandedContent
// }: {
// 	children: React.ReactNode;
// 	tileName: string;
// 	isFilled: boolean;
// 	expandedContent?: React.ReactNode;
// }) {
// 	const [isExpanded, setIsExpanded] = useState(false);

// 	const handleToggleExpand = () => {
// 		if (expandedContent) {
// 			setIsExpanded(!isExpanded);
// 		}
// 	};

// 	return (
// 		<div
// 			className={`relative flex flex-col items-center justify-center rounded border transition-all cursor-pointer hover:bg-gray-100  duration-300 ${
// 				isExpanded ? "max-h-[400px] min-h-[400px]" : "max-h-[200px] min-h-[200px]"
// 			} ${isFilled ? "bg-green-100" : "bg-gray-100"}`}
// 			onClick={handleToggleExpand}
// 		>
// 			<div className="absolute top-2 left-2 text-gray-800 font-bold">{tileName}</div>
// 			<div className="absolute top-2 right-2 flex space-x-2">
// 				{isExpanded ? (
// 					<ChevronUpIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
// 				) : (
// 					<ChevronDownIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
// 				)}
// 			</div>
// 			<div className={`flex flex-col items-center justify-center`}>
// 				{children}
// 				{isExpanded && <div className="overflow-y-auto mt-4">{expandedContent}</div>}
// 			</div>
// 		</div>
// 	);
// }

// ###############################################################################################

// import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
// import React, { useState } from "react";

// export function Tile({
// 	children,
// 	tileName,
// 	isFilled,
// 	expandedContent
// }: {
// 	children: React.ReactNode;
// 	tileName: string;
// 	isFilled: boolean;
// 	expandedContent?: React.ReactNode;
// }) {
// 	const [isExpanded, setIsExpanded] = useState(false);

// 	const handleToggleExpand = () => {
// 		setIsExpanded(!isExpanded);
// 	};

// 	const handleChildClick = (event: React.MouseEvent) => {
// 		event.stopPropagation();
// 	};

// 	return (
// 		<div
// 			className={`relative flex flex-col items-center justify-center rounded border transition-all cursor-pointer hover:bg-gray-100 duration-300 ${
// 				isExpanded ? "max-h-[400px] min-h-[400px]" : "max-h-[200px] min-h-[200px]"
// 			} ${isFilled ? "bg-green-100" : "bg-gray-100"}`}
// 			onClick={handleToggleExpand}
// 		>
// 			<div className="absolute top-2 left-2 text-gray-800 font-bold">{tileName}</div>
// 			<div className="absolute top-2 right-2 flex space-x-2">
// 				{isExpanded ? (
// 					<ChevronUpIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
// 				) : (
// 					<ChevronDownIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
// 				)}
// 			</div>
// 			<div className="flex flex-col items-center justify-center" onClick={handleChildClick}>
// 				{children}
// 				{isExpanded && <div className="overflow-y-auto mt-4">{expandedContent}</div>}
// 			</div>
// 		</div>
// 	);
// }
// TODO diary

export function LocationInputTile({
	initialSelection,
	onChange
}: {
	initialSelection?: Partial<Location>; // show what is available.
	onChange?: (location: Location) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { data: learningLocations } = trpc.learningLocation.findMany.useQuery();
	const [selectedLocation, setSelectedLocation] = useState(initialSelection);

	const closeDialog = () => setDialogOpen(false);

	if (!learningLocations) {
		return <LoadingBox />;
	}
	const handleChange = (location: Location) => {
		setSelectedLocation(location);
		onChange && onChange(location);
	};

	return (
		<Tile onToggleEdit={setDialogOpen} tileName={"Lernort"} isFilled={!!initialSelection}>
			<div className="p-4">
				{selectedLocation ? (
					<div>
						<p>{selectedLocation.name ?? ""}</p>

						{selectedLocation.iconURL && selectedLocation.iconURL !== "" && (
							<Image src={selectedLocation.iconURL} alt={""} width={48} height={48} />
						)}
					</div>
				) : (
					<p>Keine Lernort ausgewählt</p>
				)}
				{dialogOpen && (
					<LocationChooseDialog
						learningLocations={learningLocations}
						onClose={closeDialog}
						onSubmit={handleChange}
					/>
				)}
			</div>
		</Tile>
	);
}

export function LocationChooseDialog({
	learningLocations,
	onClose,
	onSubmit
}: {
	learningLocations: Location[];
	onClose: () => void;
	onSubmit: (location: Location) => void;
}) {
	const { mutateAsync: createLearningLocationAsync } = trpc.learningLocation.create.useMutation();
	const { mutateAsync: deleteLearningLocationAsync } = trpc.learningLocation.delete.useMutation();

	const createNewLocation = async (name: string) => {
		if (name.trim()) {
			await createLearningLocationAsync({ name: name.trim() });
			if (newLocationInputRef.current) {
				newLocationInputRef.current.value = "";
			}
		}
	};

	const newLocationInputRef = useRef<HTMLInputElement>(null);

	const handleLocationClick = (locationId: string) => {
		const location = learningLocations.find(location => location.id === locationId);
		if (location) {
			onSubmit(location);
			onClose();
		}
	};

	return (
		<Dialog title={"Lernort:"} onClose={onClose} className={"max-w-md"}>
			<div className="space-y-4 max-h-96 overflow-y-auto">
				<span>Bitte wähle deinen Lernort aus oder trage deinen eigenen Lernort ein.</span>

				{learningLocations.map(location => {
					return (
						<div key={location.id} className="py-1 relative">
							<div
								className="flex w-full items-center space-x-4 rounded border border-gray-300 p-4 shadow-sm bg-white hover:bg-gray-100 cursor-pointer"
								onClick={() => handleLocationClick(location.id)}
							>
								{location.iconURL && location.iconURL !== "" && (
									<Image src={location.iconURL} alt={""} width={48} height={48} />
								)}
								<span className="text-gray-800 flex-grow">{location.name}</span>
								{!location.defaultLocation && (
									<ButtonSmallX
										onClick={() => deleteLearningLocationAsync(location.id)}
										className="ml-auto text-red-500 hover:text-red-700"
									/>
								)}
							</div>
						</div>
					);
				})}
				<div className={"max-h-80 overflow-y-auto"}>
					<div className="py-1">
						<input
							ref={newLocationInputRef}
							type="text"
							className="w-full rounded border border-gray-300 p-4 shadow-sm"
							placeholder="Neuen Lernort hinzufügen... Drücke Enter zum Speichern"
							// Erstellung ohne Buttons ermöglichen: Enter, oder verlassen des Feldes (onBlur)
							onBlur={e => createNewLocation(e.target.value)}
							onKeyDown={async e => {
								if (e.key === "Enter") {
									createNewLocation((e.target as HTMLInputElement).value);
								}
							}}
						/>
					</div>
				</div>
			</div>
			<DialogActions onClose={onClose} />
		</Dialog>
	);
}

export function StarInputTile({
	name,
	initialRating = 0,
	onChange,
	description
}: {
	name: string;
	initialRating?: number;
	onChange: (rating: number) => void;
	description?: string;
}) {
	return (
		<Tile
			tileName={name}
			isFilled={initialRating > 0}
			// expandedContent={
			// 	<div className="max-w-md py-4 px-6 bg-white shadow-md rounded-lg">
			// 		<span className="block text-lg font-semibold text-gray-800 mb-2">
			// 			Gebe durch klicken deine Bewertung ab aus.
			// 		</span>
			// 		<span className="block text-sm text-gray-500">
			// 			{description}.
			// 		</span>
			// 	</div>
			// }
			onToggleEdit={() => {}}
		>
			<div className="overflow-y-auto">
				<div className="space-y-4">
					<StarRating rating={initialRating ?? 0} onChange={onChange} />
				</div>
			</div>
		</Tile>
	);
}

export function MarkDownInputTile({
	initialNote,
	onSubmit
}: {
	initialNote?: string;
	onSubmit: (note: string) => void;
}) {
	const [displayedNotes, setDisplayedNotes] = useState<string | null>(initialNote ?? null);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const onClose = async (newNote?: string) => {
		if (newNote !== undefined) {
			onSubmit(newNote);
			setDisplayedNotes(newNote);
		}
		setDialogOpen(false);
	};

	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={"Notizen"} isFilled={initialNote !== ""}>
				{initialNote === "" ? (
					<span>Bisher wurden noch keine Notizen erstellt.</span>
				) : (
					<div className={"max-w-5xl truncate"}>
						<MarkdownViewer content={displayedNotes ? displayedNotes : ""} />
					</div>
				)}
			</Tile>
			{dialogOpen && (
				<MarkdownEditorDialog
					title={"Notizen"}
					initialValue={displayedNotes ? displayedNotes : ""}
					onClose={onClose}
				/>
			)}
		</div>
	);
}
