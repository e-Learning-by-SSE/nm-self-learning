import React, { PropsWithChildren, useCallback } from "react";
import { trpc } from "@self-learning/api-client";
import { ButtonSmallX, Dialog, LoadingBox, StarRating } from "@self-learning/ui/common";
import Image from "next/image";
import { useRef, useState } from "react";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { Location } from "../access-learning-diary";
import { LearningGoal } from "@self-learning/types";
import { IdSet } from "@self-learning/util/common";
import { StatusUpdateCallback } from "../util/types";
import { GoalStatus } from "../goals/status";
import { LearningGoalEditorDialog } from "../goals/goal-editor";

export function Tile({
	onToggleEdit,
	tileName,
	isFilled,
	children,
	tooltip
}: PropsWithChildren<{
	onToggleEdit: (open: boolean) => void;
	tileName: string;
	isFilled: boolean;
	tooltip: string;
}>) {
	return (
		<div
			className="flex flex-col xl:flex-row max-h-[400px] min-h-[200px] cursor-pointer xl:space-x-4"
			onClick={() => onToggleEdit(true)}
		>
			<div className="flex flex-col xl:w-1/3 bg-gray-200 rounded-lg text-center">
				<span className="text-gray-800 pt-2">{tileName}:</span>
				<span className="text-gray-600 mt-1 justify-center items-center py-6 px-2">
					{tooltip}
				</span>
			</div>

			<div
				className={`flex justify-center items-center w-full xl:w-2/3 px-4 xl:py-2 mt-2 xl:mt-0 rounded-lg ${
					isFilled ? "bg-green-100" : "bg-gray-100"
				}`}
			>
				{children}
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
	onChange
}: {
	initialSelection?: Partial<Location>; // show what is available.
	onChange?: (location: Location) => void;
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

	const tooltipText =
		"Notiere deinen Lernort! Wenn du deinen Lernort einträgst, kannst du später leicht herausfinden, wo du am besten lernst.";

	return (
		<Tile
			onToggleEdit={setDialogOpen}
			tileName={"Lernort"}
			isFilled={!!initialSelection}
			tooltip={tooltipText}
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
						description={tooltipText}
					/>
				)}
			</div>
		</Tile>
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
	description
}: {
	name: string;
	initialRating?: number;
	onChange: (rating: number) => void;
	description: string;
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
			tooltip={description}
		>
			<div className="flex items-center justify-center overflow-y-auto min-h-40 xl:min-h-0">
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
			<Tile
				onToggleEdit={setDialogOpen}
				tileName={"Notizen"}
				isFilled={initialNote !== ""}
				tooltip={"Platz für persönliche Anmerkungen."}
			><div className="flex items-center min-h-40">
				{initialNote === "" ? (
					<span>Bisher wurden noch keine Notizen erstellt.</span>
				) : (
					<div className={"max-w-5xl truncate"}>
						<MarkdownViewer content={displayedNotes ? displayedNotes : ""} />
					</div>
				)}
				</div>
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

export function LearningGoalInputTile({
	goals: displayGoals,
	onChange
}: {
	goals: LearningGoal[];
	onChange: (goal: LearningGoal[]) => void;
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

	const tooltip =
		"Ziele helfen dir eine Richtung zu finden, die du einschlagen möchtest, und bietet dir eine Checkliste, um deine Fortschritte zu überprüfen.";

	return (
		<div>
			<Tile
				onToggleEdit={setDialogOpen}
				tileName={"Lernziele"}
				isFilled={displayGoals.length > 0}
				tooltip={tooltip}
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
			</Tile>
			{dialogOpen && (
				<LearningGoalEditorDialog
					onClose={onClose}
					onStatusUpdate={handleGoalStatusUpdate}
					description={tooltip}
				/>
			)}
		</div>
	);
}
