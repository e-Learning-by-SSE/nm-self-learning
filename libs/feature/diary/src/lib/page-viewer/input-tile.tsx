import { trpc } from "@self-learning/api-client";
import { LearningGoal } from "@self-learning/types";
import { Dialog, LoadingBox, StarRating, XButton } from "@self-learning/ui/common";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { IdSet } from "@self-learning/util/common";
import Image from "next/image";
import { PropsWithChildren, useCallback, useRef, useState } from "react";
import { Location } from "../access-learning-diary";
import { LearningGoalsDialog } from "../goals/learning-goals";
import { GoalStatusCheckbox } from "../goals/status-checkbox";
import { StatusUpdateCallback } from "../util/types";

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
			className={`flex flex-grow justify-center items-center w-full min-h-48 px-4 py-2 rounded-lg cursor-pointer ${
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
		<>
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
		</>
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
		<div className="flex flex-col">
			<div className="relative -bottom-2 flex bg-gray-200 rounded-t-lg text-center">
				<span className="text-gray-800 font-semibold p-2">{tileName}:</span>
			</div>

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
		<div className="flex flex-col xl:grid xl:grid-cols-4 items-stretch w-full h-full space-y-1 xl:space-y-0 xl:space-x-4">
			<div className="flex flex-col xl:col-span-1 bg-gray-200 rounded-lg text-center p-4 min-h-48">
				<span className="text-gray-800 font-semibold">{tileName}:</span>
				<span className="text-gray-600 mt-1 py-4 info-tile-scroll flex-grow overflow-y-auto">
					{tileDescription}
				</span>
			</div>

			<div className="flex-grow flex xl:col-span-3 items-stretch">
				<Tile onClick={onClick} isFilled={isFilled}>
					{children}
				</Tile>
			</div>
		</div>
	);
}

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
			<div className="flex items-center p-4 min-h-40 xl:min-h-0">
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
			<div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
									<XButton
										onClick={e => {
											e.stopPropagation();
											deleteLearningLocationAsync(location.id);
										}}
										className="ml-auto text-red-500 hover:text-red-700"
										size="small"
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
			isFilled={false}
			tileDescription={"Platz für persönliche Anmerkungen."}
			tileName={"Notizen"}
		>
			<div className="flex flex-grow min-h-40 overflow-auto">
				{initialNote === "" ? (
					<span className="m-auto">Bisher wurden noch keine Notizen erstellt.</span>
				) : (
					<div className="whitespace-nowrap m-auto">
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
	goals,
	onChange,
	isCompact
}: {
	goals: IdSet<LearningGoal>;
	onChange: (goal: LearningGoal[]) => void; // don'use IdSet here, because it is not serializable and will cause zod validation error
	isCompact: boolean;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const onClose = () => {
		setDialogOpen(false);
	};

	const handleGoalStatusUpdate: StatusUpdateCallback = useCallback(
		goal => {
			// avoid duplicates via sets
			const copy = new IdSet([...goals.entries(), goal]);
			onChange(copy.entries());
		},
		[goals, onChange]
	);

	const completedParents = new IdSet<LearningGoal>();

	goals.forEach(goal => {
		if (!goal.parentId) {
			completedParents.add(goal);
		}
	});

	const description =
		"Ziele helfen dir eine Richtung zu finden, die du einschlagen möchtest, und bietet dir eine Checkliste, um deine Fortschritte zu überprüfen.";

	return (
		<TileLayout
			isCompact={isCompact}
			onClick={setDialogOpen}
			isFilled={goals.size > 0}
			tileDescription={description}
			tileName={"Lernziele"}
		>
			<div>
				<div className="flex flex-wrap justify-center items-center p-4 min-h-40 xl:min-h-0">
					{goals.size === 0 && <span>Keine Lernziele vorhanden</span>}
					{goals.entries().map(goal => (
						<div
							key={goal.id}
							className="flex items-center p-2 border border-gray-300 rounded bg-gray-50 m-2"
						>
							<GoalStatusCheckbox goal={goal} editable={false} />
							<span className="ml-2">{goal.description}</span>
						</div>
					))}
				</div>
				{/* <LearningGoalProvider userGoals={goals}>
					<GoalsOverview notFoundMessage={""} editable={false} onRowClick={() => {}} />
				</LearningGoalProvider> */}
			</div>
			{dialogOpen && (
				<LearningGoalsDialog
					onClose={onClose}
					description={"Lernziele bearbeiten"}
					onStatusUpdate={handleGoalStatusUpdate}
				/>
			)}
		</TileLayout>
	);
}
