import React, { PropsWithChildren, useCallback } from "react";
import { trpc } from "@self-learning/api-client";
import { ButtonSmallX, Dialog, LoadingBox, StarRating } from "@self-learning/ui/common";
import Image from "next/image";
import { useRef, useState } from "react";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { Location } from "@self-learning/diary";
import { LearningGoal } from "@self-learning/types";
import { IdSet } from "@self-learning/util/common";
import { StatusUpdateCallback } from "../util/types";
import { GoalStatus } from "../goals/status";
import { LearningGoalEditorDialog } from "../goals/goal-editor";

export function Tile({
	onClick,
	isFilled,
	children
}: PropsWithChildren<{
	onClick: (open: boolean) => void;
	isFilled: boolean;
}>) {
	return (
		<div
			className={`flex justify-center items-center w-full min-h-48 max-h-48 px-4 py-2 rounded-lg cursor-pointer ${
				isFilled ? "bg-green-100" : "bg-gray-100"
			}`}
			onClick={() => onClick(true)}
		>
			{children}
		</div>
	);
}

export function TileLayout({
	children,
	isCompact,
	onClick,
	isFilled,
	tileDescription,
	tileName
}: PropsWithChildren<{
	isCompact: boolean;
	onClick: (open: boolean) => void;
	isFilled: boolean;
	tileDescription: string;
	tileName: string;
}>) {
	return (
		<div>
			{isCompact && (
				<CompactTile onClick={onClick} isFilled={isFilled} tileName={tileName}>
					{children}
				</CompactTile>
			)}
			{!isCompact && (
				<InfoTile
					onClick={onClick}
					isFilled={isFilled}
					tileDescription={tileDescription}
					tileName={tileName}
				>
					{children}
				</InfoTile>
			)}
		</div>
	);
}

export function CompactTile({
	children,
	onClick,
	isFilled,
	tileName
}: PropsWithChildren<{
	onClick: (open: boolean) => void;
	isFilled: boolean;
	tileName: string;
}>) {
	return (
		<div className="relative">
			<span className="absolute top-2 left-2 px-2 py-1 rounded text-gray-800 z-10">
				{tileName}:
			</span>

			<Tile onClick={onClick} isFilled={isFilled}>
				{children}
			</Tile>
		</div>
	);
}

export function InfoTile({
	children,
	onClick,
	isFilled,
	tileDescription,
	tileName
}: PropsWithChildren<{
	onClick: (open: boolean) => void;
	isFilled: boolean;
	tileDescription: string;
	tileName: string;
}>) {
	return (
		<div className="flex flex-col xl:flex-row items-stretch w-full h-full space-y-1 xl:space-y-0 xl:space-x-4">
			<div className="flex flex-col xl:w-1/4 bg-gray-200 rounded-lg text-center p-4 min-h-48 max-h-48">
				<span className="text-gray-800 font-semibold">{tileName}:</span>
				<span className="text-gray-600 mt-1 py-4">{tileDescription}</span>
			</div>

			<div className="flex-grow flex items-stretch">
				<Tile onClick={onClick} isFilled={isFilled}>
					{children}
				</Tile>
			</div>
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
	onChange,
	isCompact
}: {
	initialSelection?: Partial<Location>; // show what is available.
	onChange?: (location: Location) => void;
	isCompact: boolean;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { data: learningLocations } = trpc.learningLocation.findMany.useQuery();

	const closeDialog = () => setDialogOpen(false);

	if (!learningLocations) {
		return <LoadingBox />;
	}
	const handleChange = (location: Location) => {
		onChange && onChange(location);
	};

	const description =
		"Notiere deinen Lernort! Wenn du deinen Lernort einträgst, kannst du später leicht herausfinden, wo du am besten lernst.";

	return (
		<TileLayout
			isCompact={isCompact}
			onClick={setDialogOpen}
			isFilled={!!initialSelection}
			tileDescription={description}
			tileName={"Lernort"}
		>
			<div className="p-4 min-h-40 xl:min-h-0">
				{initialSelection ? (
					<div>
						<p>{initialSelection?.name ?? ""}</p>

						{initialSelection.iconURL && initialSelection.iconURL !== "" && (
							<Image src={initialSelection.iconURL} alt={""} width={48} height={48} />
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
						description={description}
					/>
				)}
			</div>
		</TileLayout>
	);
}

export function LocationChooseDialog({
	learningLocations,
	onClose,
	onSubmit,
	description
}: {
	learningLocations: Location[];
	onClose: () => void;
	onSubmit: (location: Location) => void;
	description: string;
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
				<span>{description}</span>

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
										onClick={e => {
											e.stopPropagation();
											deleteLearningLocationAsync(location.id);
										}}
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
			<div className="flex justify-end pt-5">
				<button className="btn-primary" onClick={onClose}>
					OK
				</button>
			</div>
		</Dialog>
	);
}

export function StarInputTile({
	name,
	initialRating = 0,
	onChange,
	description,
	isCompact
}: {
	name: string;
	initialRating?: number;
	onChange: (rating: number) => void;
	description: string;
	isCompact: boolean;
}) {
	return (
		<TileLayout
			isCompact={isCompact}
			onClick={() => {}}
			isFilled={initialRating > 0}
			tileDescription={description}
			tileName={name}
		>
			<div className="flex items-center justify-center overflow-y-auto min-h-40 xl:min-h-0">
				<div className="space-y-4">
					<StarRating rating={initialRating ?? 0} onChange={onChange} />
				</div>
			</div>
		</TileLayout>
	);
}

export function MarkDownInputTile({
	initialNote,
	onSubmit,
	isCompact
}: {
	initialNote?: string;
	onSubmit: (note: string) => void;
	isCompact: boolean;
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
		<TileLayout
			isCompact={isCompact}
			onClick={setDialogOpen}
			isFilled={initialNote !== ""}
			tileDescription={"Platz für persönliche Anmerkungen."}
			tileName={"Notizen"}
		>
			<div className="flex items-center min-h-40">
				{initialNote === "" ? (
					<span>Bisher wurden noch keine Notizen erstellt.</span>
				) : (
					<div className={"max-w-5xl truncate"}>
						<MarkdownViewer content={displayedNotes ? displayedNotes : ""} />
					</div>
				)}
			</div>

			{dialogOpen && (
				<MarkdownEditorDialog
					title={"Notizen"}
					initialValue={displayedNotes ? displayedNotes : ""}
					onClose={onClose}
				/>
			)}
		</TileLayout>
	);
}

export function LearningGoalInputTile({
	goals: displayGoals,
	onChange,
	isCompact
}: {
	goals: LearningGoal[];
	onChange: (goal: LearningGoal[]) => void;
	isCompact: boolean;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const onClose = () => {
		setDialogOpen(false);
	};

	const handleGoalStatusUpdate: StatusUpdateCallback = useCallback(
		(goal, _) => {
			// this is handled by form.field.onChange. so push all learning goals with the appended changed one.
			const a = new IdSet(displayGoals);
			a.add(goal as LearningGoal); // TODO goals: make this type safe
			onChange(Array.from(a));
		},
		[displayGoals, onChange]
	);

	const description =
		"Ziele helfen dir eine Richtung zu finden, die du einschlagen möchtest, und bietet dir eine Checkliste, um deine Fortschritte zu überprüfen.";

	return (
		<TileLayout
			isCompact={isCompact}
			onClick={setDialogOpen}
			isFilled={displayGoals.length > 0}
			tileDescription={description}
			tileName={"Lernziele"}
		>
			<div>
				<div className="flex flex-wrap p-4 min-h-40 xl:min-h-0">
					{displayGoals.length === 0 && <span>Keine Lernziele vorhanden</span>}
					{displayGoals.map(goal => (
						<div
							key={goal.id}
							className="flex items-center p-2 border border-gray-300 rounded bg-gray-50 m-2"
						>
							<GoalStatus goal={goal} editable={false} />
							<span className="ml-2">{goal.description}</span>
						</div>
					))}
				</div>
			</div>
			{dialogOpen && (
				<LearningGoalEditorDialog
					onClose={onClose}
					onStatusUpdate={handleGoalStatusUpdate}
					description={description}
				/>
			)}
		</TileLayout>
	);
}
