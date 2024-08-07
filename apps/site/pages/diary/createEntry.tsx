import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import {
	getLearningDiaryInformation,
	LearningDiaryInformation,
	LearningDiaryEntryResult
} from "../../../../libs/data-access/api/src/lib/trpc/routers/learningDiaryEntry.router";
import { PencilIcon, StarIcon } from "@heroicons/react/24/solid";
import { Dialog, LoadingCircle, showToast } from "@self-learning/ui/common";
import Image from "next/image";
import { trpc } from "@self-learning/api-client";
import { formatMillisecondToString } from "@self-learning/util/common";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { useForm, Controller, FormProvider, useFormContext } from "react-hook-form";
import { LearningGoal } from "@self-learning/types";
import { GoalsOverview, LearningGoals } from "@self-learning/learning-goals";

interface EntrySwitcherProps {
	maxLength: number;
	setIndex: (index: number) => void;
	currentIndex: number;
}

interface LearningDiaryEntryFormProps {
	entry: LearningDiaryEntryResult;
	learningDiaryInformation: LearningDiaryInformation;
	onUpdate: (updatedEntry: LearningDiaryEntryResult) => void;
}

interface LearningDiaryEntryOverviewProps {
	learningDiaryInformation: LearningDiaryInformation;
}

export default function LearningDiaryEntryOverview({
	learningDiaryInformation
}: LearningDiaryEntryOverviewProps) {
	const [currentIndex, setCurrentIndex] = useState<number>(
		learningDiaryInformation?.learningDiaryEntries?.length
			? learningDiaryInformation.learningDiaryEntries.length - 1
			: 0
	);
	const [entries, setEntries] = useState<LearningDiaryEntryResult[]>(
		learningDiaryInformation?.learningDiaryEntries ?? []
	);

	const handleUpdateEntry = (updatedEntry: LearningDiaryEntryResult) => {
		setEntries(prevEntries =>
			prevEntries.map(entry => (entry.id === updatedEntry.id ? updatedEntry : entry))
		);
	};

	if (!entries || entries.length === 0) {
		return <div>Kein Lerntagebucheinträge Gefunden.</div>;
	}

	return (
		<div className="flex justify-center">
			<div className="w-2/3 py-4">
				<div className="mb-4 flex justify-center">
					<EntrySwitcher
						maxLength={entries.length}
						setIndex={setCurrentIndex}
						currentIndex={currentIndex}
					/>
				</div>
				<LearningDiaryEntryForm
					entry={entries[currentIndex]}
					learningDiaryInformation={learningDiaryInformation}
					onUpdate={handleUpdateEntry}
				/>
			</div>
		</div>
	);
}

function EntrySwitcher({ maxLength, setIndex, currentIndex }: EntrySwitcherProps) {
	const handlePrev = () => {
		setIndex(prevIndex => Math.max(prevIndex - 1, 0));
	};

	const handleNext = () => {
		setIndex(prevIndex => Math.min(prevIndex + 1, maxLength - 1));
	};

	return (
		<div className="flex space-x-16">
			<button className="btn btn-primary" onClick={handlePrev} disabled={currentIndex === 0}>
				Vorheriger Eintrag
			</button>
			<div className="rounded bg-gray-100 p-2">{currentIndex + 1}</div>
			<button
				className="btn btn-primary"
				onClick={handleNext}
				disabled={currentIndex === maxLength - 1}
			>
				Nächster Eintrag
			</button>
		</div>
	);
}

function LearningDiaryEntryForm({
	entry,
	learningDiaryInformation,
	onUpdate
}: LearningDiaryEntryFormProps) {
	const methods = useForm({
		defaultValues: {
			learningLocation: learningDiaryInformation.learningLocations[0],
			effortLevel: entry.effortLevel,
			distractionLevel: entry.distractionLevel,
			notes: entry.notes,
			learningGoal: entry.learningGoal
		}
	});

	const { handleSubmit, reset } = methods;

	const { mutateAsync: updateLearningDiaryEntry } = trpc.learningDiaryEntry.update.useMutation();

	const onSubmit = async (data: any) => {
		const updatedEntry: LearningDiaryEntryResult = {
			...entry,
			...data
		};

		console.log(updatedEntry);

		await updateLearningDiaryEntry({
			id: updatedEntry.id,
			learningLocationId: updatedEntry.learningLocation.id,
			effortLevel: updatedEntry.effortLevel ?? 1,
			distractionLevel: updatedEntry.distractionLevel ?? 1,
			notes: updatedEntry.notes,
			learningGoal: updatedEntry.learningGoal.map(goal => {
				return goal.id;
			})
		});

		onUpdate(updatedEntry);
		reset(data);
	};

	useEffect(() => {
		reset({
			learningLocation: entry.learningLocation,
			effortLevel: entry.effortLevel,
			distractionLevel: entry.distractionLevel,
			notes: entry.notes,
			learningGoal: entry.learningGoal
		});
	}, [entry, reset]);

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mb-4 flex justify-center">
					<DefaultInformation learningDiaryEntry={entry} />
				</div>
				<div className="mb-4">
					<Controller
						name="learningLocation"
						control={methods.control}
						render={({ field }) => (
							<LocationInputTile
								learningLocations={learningDiaryInformation.learningLocations}
								initialLearningLocation={field.value}
								setLearningLocation={field.onChange}
								onSubmit={onSubmit}
							/>
						)}
					/>
				</div>
				<div className={"mb-4"}>
					<Controller
						name="effortLevel"
						control={methods.control}
						render={({ field }) => (
							<StarInputTile
								name={"Bemühungen:"}
								note={
									"Bitte bewerte deine Bemühungen während der\n" +
									"Lernsession. Bemühungen können ... sein. Mehr\n" +
									"Sterne bedeutet du hast dich mehr bemüht."
								}
								initialRating={field.value}
								setRating={field.onChange}
								onSubmit={onSubmit}
							/>
						)}
					/>
				</div>
				<div className={"mb-4"}>
					<Controller
						name="distractionLevel"
						control={methods.control}
						render={({ field }) => (
							<StarInputTile
								name={"Ablenkungen:"}
								note={
									"Bitte bewerte deine Ablenkungen während der\n" +
									"Lernsession. Ablenkungen können z.B. eine hohe\n" +
									"Geräuschkulisse, Unterbrechungen, Anrufe,\n" +
									"Mitbewohner, etc. sein. Mehr Sterne zeigen eine\n" +
									"größere Ablenkung an.\n"
								}
								initialRating={field.value}
								setRating={field.onChange}
								onSubmit={onSubmit}
							/>
						)}
					/>
				</div>
				<div className={"mb-4"}>
					<Controller
						name="notes"
						control={methods.control}
						render={({ field }) => (
							<MarkDownInputTile
								initialNote={field.value}
								setNote={field.onChange}
								onSubmit={onSubmit}
							/>
						)}
					/>
				</div>
				<div className={"mb-4"}>
					<Controller
						name={"learningGoal"}
						control={methods.control}
						render={({ field }) => (
							<LearningGoalInputTile
								entryGoals={field.value}
								setEntryGoals={field.onChange}
								onSubmit={onSubmit}
							/>
						)}
					/>
				</div>
			</form>
		</FormProvider>
	);
}

function LearningGoalInputTile({
	entryGoals,
	setEntryGoals,
	onSubmit
}: {
	entryGoals: LearningGoal[];
	setEntryGoals: (goals: LearningGoal[]) => void;
	onSubmit: (data: any) => Promise<void>;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { trigger, handleSubmit } = useFormContext();

	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	const onClose = () => {
		setDialogOpen(false);
	};

	function onSave() {
		onClose();
	}

	function onEdit(editedGoal: LearningGoal) {
		const getNewGoals = (prevGoals: LearningGoal[]) => {
			// Check if the goal already exists in the previous goals array
			const goalExists = prevGoals.some(goal => goal.id === editedGoal.id);

			// If the goal does not exist, add it to the array
			if (!goalExists) {
				return [...prevGoals, editedGoal];
			}

			// If the goal exists, replace it in the array
			return prevGoals.map(goal => (goal.id === editedGoal.id ? editedGoal : goal));
		};

		setEntryGoals(getNewGoals(entryGoals));

		console.log();

		handleSubmit(onSubmit)();

		setEntryGoals(getNewGoals(entryGoals));
	}

	useEffect(() => {}, [entryGoals]);

	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={"Lernziele"}>
				<div>
					<GoalsOverview
						goals={entryGoals}
						notFoundMessage={"Es wurden noch keine Lernziele Festgelegt"}
						editable={false}
						onEdit={(goal: LearningGoal) => {}}
					/>
				</div>
			</Tile>
			{dialogOpen && isLoading ? (
				<Dialog title="Lernziel Editor" onClose={onClose}>
					<div className="flex h-screen bg-gray-50">
						<div className="m-auto">
							<LoadingCircle />
						</div>
					</div>
				</Dialog>
			) : (
				dialogOpen && (
					<Dialog title="Lernziel Editor" onClose={onClose}>
						<div className={"overflow-y-auto"}>
							<div className={"space-y-4"}>
								<div className={"max-w-md py-2"}>
									<span>{"Hier muss noch ein Text rein!!!!!!!!!!!!!!!"}</span>
								</div>
							</div>
							<div className={"flex justify-center py-4"}>
								<LearningGoals
									goals={learningGoals}
									onEdit={onEdit}
								></LearningGoals>
							</div>
							<div className="mt-4 flex justify-end space-x-4">
								<button onClick={onClose} className="btn-stroked hover:bg-gray-100">
									Abbrechen
								</button>
								<button onClick={onSave} className="btn-primary" disabled={false}>
									Speichern
								</button>
							</div>
						</div>
					</Dialog>
				)
			)}
		</div>
	);
}

function MarkDownInputTile({
	initialNote,
	setNote,
	onSubmit
}: {
	initialNote: string;
	setNote: (note: string) => void;
	onSubmit: (data: any) => Promise<void>;
}) {
	const [displayedNotes, setDisplayedNotes] = useState<string>(initialNote);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { trigger, handleSubmit } = useFormContext();

	const onClose = async (newNote?: string) => {
		if (newNote !== undefined) {
			setDisplayedNotes(newNote);
			setNote(newNote);
			await handleSubmit(onSubmit)();
		}
		setDialogOpen(false);
	};

	useEffect(() => {
		setDisplayedNotes(initialNote);
	}, [initialNote]);

	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={"Notizen"}>
				{initialNote === "" ? (
					<span>Bisher wurden noch keine Notizen erstellt.</span>
				) : (
					<div className={"max-w-5xl truncate"}>
						<MarkdownViewer content={displayedNotes} />
					</div>
				)}
			</Tile>
			{dialogOpen && (
				<MarkdownEditorDialog
					title={"Notizen"}
					initialValue={displayedNotes}
					onClose={onClose}
				/>
			)}
		</div>
	);
}

function DefaultInformation({
	learningDiaryEntry
}: {
	learningDiaryEntry: {
		date: string;
		course: { title: string; slug: string };
		duration: number;
		scope: number;
	};
}) {
	return (
		<div className="flex w-full space-x-4 p-4">
			<div className="flex flex-shrink-0 flex-grow basis-1/6 flex-col">
				<span className="font-semibold">Datum:</span>
				<span>{learningDiaryEntry.date}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-2/6 flex-col">
				<span className="font-semibold">Kurs:</span>
				<span>{learningDiaryEntry.course.title}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-2/6 flex-col">
				<span className="font-semibold">Dauer:</span>
				<span>{formatMillisecondToString(learningDiaryEntry.duration)}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-1/6 flex-col">
				<span className="font-semibold">Umfang:</span>
				<span>{learningDiaryEntry.scope}</span>
			</div>
		</div>
	);
}

function StarInputTile({
	name,
	note,
	initialRating,
	setRating,
	onSubmit
}: {
	name: string;
	note: string;
	initialRating: number | null;
	setRating: (rating: number | null) => void;
	onSubmit: (data: any) => Promise<void>;
}) {
	if (initialRating === null) {
		initialRating = 1;
	}

	const [stars, setStars] = useState<number>(initialRating);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { handleSubmit } = useFormContext();

	useEffect(() => {
		setStars(initialRating ?? 1);
	}, [initialRating]);

	const onSave = async () => {
		setRating(stars);
		await handleSubmit(onSubmit)();
		onClose();
	};

	const onClose = () => {
		setDialogOpen(false);
		setStars(initialRating ?? 1);
	};

	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={name}>
				<div>
					<StarRatingDisplay rating={initialRating} />
					{dialogOpen && (
						<Dialog onClose={onClose} title={name}>
							<div className={"overflow-y-auto"}>
								<div className={"space-y-4"}>
									<div className={"max-w-md py-2"}>
										<span>{note}</span>
									</div>
								</div>
								<div className={"flex justify-center py-4"}>
									<StarRatingInput
										name={name}
										setSelectedStars={setStars}
										initialRating={stars}
									/>
								</div>
								<div className="mt-4 flex justify-end space-x-4">
									<button
										onClick={onClose}
										className="btn-stroked hover:bg-gray-100"
									>
										Abbrechen
									</button>
									<button
										onClick={onSave}
										className="btn-primary"
										disabled={stars === initialRating}
									>
										Speichern
									</button>
								</div>
							</div>
						</Dialog>
					)}
				</div>
			</Tile>
		</div>
	);
}

function Tile({
	children,
	onToggleEdit,
	tileName
}: {
	children: React.ReactElement;
	onToggleEdit: (open: boolean) => void;
	tileName: string;
}) {
	return (
		<div className="relative flex max-h-[200px] min-h-[200px] flex-col items-center justify-center rounded border bg-gray-100 p-4">
			<div className="absolute top-2 left-2 text-gray-800">{tileName}</div>
			<div className="absolute top-2 right-2">
				<PencilIcon
					className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
					onClick={() => onToggleEdit(true)}
				/>
			</div>
			<div className="flex w-full flex-1 items-center justify-center overflow-y-auto">
				{React.cloneElement(children, {
					onClick: () => onToggleEdit(true),
					className: `${
						children.props.className || ""
					} w-full flex flex-col justify-center items-center cursor-pointer`
				})}
			</div>
		</div>
	);
}

function LocationInputTile({
	learningLocations,
	initialLearningLocation,
	setLearningLocation,
	onSubmit
}: {
	learningLocations: { id: string; name: string; iconURL: string }[];
	initialLearningLocation?: { id: string | null; name: string; iconURL: string } | null;
	setLearningLocation: (location: { id: string | null; name: string; iconURL: string }) => void;
	onSubmit: (data: any) => Promise<void>;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [locationList, setLocationList] = useState<
		{
			id: string | null;
			name: string;
			iconURL: string;
		}[]
	>(learningLocations);
	const [selectedLocation, setSelectedLocation] = useState(initialLearningLocation);
	const [tempLocation, setTempLocation] = useState<{
		id: string | null;
		name: string;
		iconURL: string;
	} | null>({ name: "", iconURL: "", id: null });

	const { mutateAsync: createLearningLocationAsync } = trpc.learningLocation.create.useMutation();
	const { handleSubmit } = useFormContext();

	const [newLocation, setNewLocation] = useState<{
		id: string | null;
		name: string;
		iconURL: string;
	}>({
		name: "",
		iconURL: "",
		id: null
	});

	useEffect(() => {
		setSelectedLocation(initialLearningLocation);
	}, [initialLearningLocation]);

	const onClose = () => {
		setDialogOpen(false);
		setTempLocation({ name: "", iconURL: "", id: null });
		setNewLocation({ name: "", iconURL: "", id: null });
	};

	const onSave = async () => {
		if (tempLocation?.name !== "" && tempLocation) {
			const possibleExistingLocation = learningLocations.find(
				location => location.name.toLowerCase() === newLocation.name.toLowerCase()
			);

			if (possibleExistingLocation != undefined) {
				setSelectedLocation(possibleExistingLocation);
				setLearningLocation(possibleExistingLocation);
				await handleSubmit(onSubmit)();
				onClose();
				showToast({
					type: "info",
					title: "Dieser Lernort existiert bereits.",
					subtitle:
						"Der Lernort mit dem Namen " +
						newLocation.name +
						" existiert bereits, daher wurde der Existierende Lernort gewählt."
				});
			} else {
				if (await handleCreateLocation()) {
					await handleSubmit(onSubmit)();
					onClose();
				} else {
					setSelectedLocation(tempLocation);
					setLearningLocation(tempLocation);
					await handleSubmit(onSubmit)();
					onClose();
				}
			}
		} else {
			onClose();
		}
	};

	const handleCreateLocation = async () => {
		if (tempLocation?.name.toLowerCase() === newLocation.name.toLowerCase()) {
			if (newLocation && newLocation.name !== "") {
				try {
					const result = await createLearningLocationAsync({
						...newLocation
					});
					setSelectedLocation(result);
					setLearningLocation(result);
					setLocationList(prevLocations => [...prevLocations, result]);
					showToast({
						type: "success",
						title: "Lernort hinzugefügt",
						subtitle:
							"Der Lernort mit dem Namen: " +
							newLocation.name +
							" wurde erfolgreich hinzugefügt."
					});
					return true;
				} catch (error) {
					showToast({
						type: "error",
						title: "Fehler",
						subtitle:
							"Lernort mit dem Namen " +
							newLocation.name +
							" konnte nicht hinzugefügt werden: "
					});
					console.error("Error creating new location:", error);
					return false;
				}
			}
		}
		return false;
	};

	return (
		<Tile onToggleEdit={setDialogOpen} tileName={"Lernort"}>
			<div className="p-4">
				{selectedLocation ? (
					<div className="rounded-md border p-4 shadow-md hover:bg-gray-100">
						<p>{selectedLocation.name}</p>

						{selectedLocation.iconURL && selectedLocation.iconURL !== "" && (
							<Image src={selectedLocation.iconURL} alt={""} width={48} height={48} />
						)}
					</div>
				) : (
					<p>Keine Lernort ausgewählt</p>
				)}
				{dialogOpen && (
					<Dialog title={"Lernort:"} onClose={onClose} className={"max-w-md"}>
						<div className="space-y-4">
							<span>
								Bitte wähle deinen Lernort aus oder trage deinen eigenen Lernort
								ein.
							</span>

							<div className={"max-h-80 overflow-y-auto"}>
								<div className={"py-1"}>
									<button
										key={"newLocation"}
										className={`flex w-full items-center space-x-4 rounded border border-gray-300 p-4 shadow-sm ${
											tempLocation?.id === newLocation.id
												? "bg-gray-100"
												: "bg-white"
										} hover:bg-gray-100`}
										onClick={() => setTempLocation(newLocation)}
									>
										<input
											type="text"
											className="flex-grow rounded border p-2"
											placeholder="Neuen Lernort eingeben"
											value={newLocation.name}
											onChange={e => {
												setNewLocation({
													name: e.target.value,
													iconURL: "",
													id: null
												});
												setTempLocation({
													name: e.target.value,
													iconURL: "",
													id: null
												});
											}}
										/>
									</button>
								</div>

								{locationList.map(location => {
									return (
										<div key={location.id} className={"py-1"}>
											<button
												className={`flex w-full items-center space-x-4 rounded border border-gray-300 p-4 shadow-sm ${
													tempLocation?.id === location.id
														? "bg-gray-200"
														: "bg-white"
												} hover:bg-gray-100`}
												onClick={() => setTempLocation(location)}
											>
												{location.iconURL && location.iconURL !== "" && (
													<Image
														src={location.iconURL}
														alt={""}
														width={48}
														height={48}
													/>
												)}
												<span className="text-gray-800">
													{location.name}
												</span>
											</button>
										</div>
									);
								})}
							</div>

							<div className="mt-4 flex justify-end space-x-4">
								<button onClick={onClose} className="btn-stroked hover:bg-gray-100">
									Abbrechen
								</button>
								<button
									onClick={onSave}
									className="btn-primary"
									disabled={tempLocation?.name === ""}
								>
									Speichern
								</button>
							</div>
						</div>
					</Dialog>
				)}
			</div>
		</Tile>
	);
}

function StarRatingInput({
	name,
	setSelectedStars,
	initialRating = 1
}: {
	name: string;
	setSelectedStars: (value: number) => void;
	initialRating?: number;
}) {
	const [rating, setRating] = useState(initialRating);

	const handleChange = (val: number) => {
		setRating(val);
		setSelectedStars(val);
	};

	return (
		<div className="flex justify-start">
			{[...Array(5)].map((_, index) => {
				const val = index + 1;
				return (
					<React.Fragment key={val}>
						<input
							type="radio"
							id={`star-${val}-${name}`}
							value={val}
							className="peer hidden"
							onChange={() => handleChange(val)}
							checked={val === rating}
						/>
						<label htmlFor={`star-${val}-${name}`} className="cursor-pointer">
							<StarIcon
								className={`h-8 w-8 ${
									val <= rating ? "text-yellow-500" : "text-gray-400"
								}`}
							/>
						</label>
					</React.Fragment>
				);
			})}
		</div>
	);
}

function StarRatingDisplay({ rating }: { rating: number }) {
	return (
		<div className="flex justify-start">
			{[...Array(5)].map((_, index) => {
				const val = index + 1;
				return (
					<StarIcon
						key={val}
						className={`h-8 w-8 ${val <= rating ? "text-yellow-500" : "text-gray-400"}`}
					/>
				);
			})}
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async context => {
	const session = await getSession(context);

	if (!session || !session.user) {
		return {
			redirect: {
				destination: "/api/auth/signin",
				permanent: false
			}
		};
	}

	try {
		const learningDiaryInformation = await getLearningDiaryInformation({
			username: session.user.name
		});
		return {
			props: {
				learningDiaryInformation
			}
		};
	} catch (error) {
		console.error("Error fetching Learning Diary Information:", error);
		return {
			props: {
				learningDiaryInformation: null
			}
		};
	}
};
