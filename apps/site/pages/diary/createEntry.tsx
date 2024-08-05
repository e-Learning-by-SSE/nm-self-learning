import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import {
	getLearningDiaryInformation,
	LearningDiaryInformation,
	LearningDiaryEntryResult
} from "../../../../libs/data-access/api/src/lib/trpc/routers/learningDiaryEntry.router";
import { PencilIcon, StarIcon } from "@heroicons/react/24/solid";
import { Dialog, showToast } from "@self-learning/ui/common";
import Image from "next/image";
import { trpc } from "@self-learning/api-client";
import { formatMillisecondToString } from "@self-learning/util/common";

export default function LearningDiaryEntryOverview({
	learningDiaryInformation
}: {
	learningDiaryInformation: LearningDiaryInformation;
}) {
	const [currentIndex, setCurrentIndex] = useState<number>(
		learningDiaryInformation.learningDiaryEntries.length - 1
	);

	const [entries, setEntries] = useState<LearningDiaryEntryResult[]>(
		learningDiaryInformation.learningDiaryEntries
	);

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
				<LearningDiaryEntry
					entry={entries[currentIndex]}
					setEntries={setEntries}
					learningDiaryInformation={learningDiaryInformation}
				/>
			</div>
		</div>
	);
}

function LearningDiaryEntry({
	entry,
	setEntries,
	learningDiaryInformation
}: {
	entry: LearningDiaryEntryResult;
	setEntries: (a: LearningDiaryEntryResult[]) => void;
	learningDiaryInformation: LearningDiaryInformation;
}) {
	const [learningLocation, setLearningLocation] = useState<{
		id: string | null;
		name: string;
		iconURL: string;
	}>(entry.learningLocation);

	const [effortLevel, setEffortLevel] = useState<number | null>(entry.effortLevel);
	const [distractionLevel, setDistractionLevel] = useState<number | null>(entry.distractionLevel);

	const { mutateAsync: updateLearningDiaryEntry } = trpc.learningDiaryEntry.update.useMutation();

	useEffect(() => {
		const updatedEntry: LearningDiaryEntryResult = {
			...entry,
			learningLocation,
			effortLevel,
			distractionLevel
		};

		setEntries((prevEntries: LearningDiaryEntryResult[]) => {
			const index = prevEntries.findIndex(e => e.id === entry.id);
			const newEntries = [...prevEntries];
			if (index !== -1) {
				newEntries[index] = updatedEntry;
			} else {
				newEntries.push(updatedEntry);
			}
			return newEntries;
		});

		console.log(updatedEntry.learningLocation.id);

		const result = updateLearningDiaryEntry({
			id: updatedEntry.id,
			learningLocationId: updatedEntry.learningLocation.id,
			effortLevel: effortLevel ?? 1,
			distractionLevel: distractionLevel ?? 1
		});
	}, [learningLocation, effortLevel, distractionLevel]);

	useMemo(() => {
		setLearningLocation(entry.learningLocation);
		setEffortLevel(entry.effortLevel);
		setDistractionLevel(entry.distractionLevel);
	}, [entry]);
	return (
		<div>
			<div className="mb-4 flex justify-center">
				<DefaultInformation learningDiaryEntry={entry} />
			</div>
			<div className="mb-4">
				<LocationInput
					learningLocations={learningDiaryInformation.learningLocations}
					initialLearningLocation={learningLocation}
					setLearningLocation={setLearningLocation}
				/>
			</div>
			<div className={"mb-4"}>
				<StarInputDialog
					name={"Bemühungen:"}
					note={
						"Bitte bewerte deine Bemühungen während der\n" +
						"Lernsession. Bemühungen können ... sein. Mehr\n" +
						"Sterne bedeutet du hast dich mehr bemüht."
					}
					initialRating={effortLevel}
					setRating={setEffortLevel}
				/>
			</div>
			<div className={"mb-4"}>
				<StarInputDialog
					name={"Ablenkungen:"}
					note={
						"Bitte bewerte deine Ablenkungen während der\n" +
						"Lernsession. Ablenkungen können z.B. eine hohe\n" +
						"Geräuschkulisse, Unterbrechungen, Anrufe,\n" +
						"Mitbewohner, etc. sein. Mehr Sterne zeigen eine\n" +
						"größere Ablenkung an.\n"
					}
					initialRating={distractionLevel}
					setRating={setDistractionLevel}
				/>
			</div>
		</div>
	);
}

function EntrySwitcher({
	maxLength,
	setIndex,
	currentIndex
}: {
	maxLength: number;
	setIndex: (a: number) => void;
	currentIndex: number;
}) {
	const handlePrev = () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		setIndex(prevIndex => Math.max(prevIndex - 1, 0));
	};

	const handleNext = () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
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

function StarInputDialog({
	name,
	note,
	initialRating,
	setRating
}: {
	name: string;
	note: string;
	initialRating: number | null;
	setRating: (a: number | null) => void;
}) {
	if (initialRating === null) {
		initialRating = 1;
	}

	const [stars, setStars] = useState<number>(initialRating);

	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	useEffect(() => {
		setStars(initialRating ?? 1);
	}, [initialRating]);

	function onSave() {
		setRating(stars);
		onClose();
	}

	function onClose() {
		setDialogOpen(false);
		setStars(initialRating ?? 1);
	}

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
	children: ReactElement;
	onToggleEdit: (a: boolean) => void;
	tileName: string;
}) {
	return (
		<div className="relative flex max-h-[200px] min-h-[200px] items-center justify-center rounded border bg-gray-100">
			<div className="absolute top-2 left-2 text-gray-800">{tileName}</div>
			<div className="absolute top-2 right-2">
				<PencilIcon
					className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
					onClick={() => onToggleEdit(true)}
				/>
			</div>

			<div className="flex h-full items-center justify-center">
				{React.cloneElement(children, {
					onClick: () => onToggleEdit(true),
					className: `${children.props.className || ""} cursor-pointer`
				})}
			</div>
		</div>
	);
}

function LocationInput({
	learningLocations,
	initialLearningLocation,
	setLearningLocation
}: {
	learningLocations: { id: string; name: string; iconURL: string }[];
	initialLearningLocation?: { id: string | null; name: string; iconURL: string } | null;
	setLearningLocation: (a: { id: string | null; name: string; iconURL: string }) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [locationList, setLocationList] =
		useState<{ id: string | null; name: string; iconURL: string }[]>(learningLocations);
	const [selectedLocation, setSelectedLocation] = useState(initialLearningLocation);
	const [tempLocation, setTempLocation] = useState<{
		id: string | null;
		name: string;
		iconURL: string;
	} | null>({ name: "", iconURL: "", id: null });

	const { mutateAsync: createLearningLocationAsync } = trpc.learningLocation.create.useMutation();

	const [newLocation, setNewLocation] = useState<{
		id: string | null;
		name: string;
		iconURL: string;
	}>({ name: "", iconURL: "", id: null });

	useEffect(() => {
		setSelectedLocation(initialLearningLocation);
	}, [initialLearningLocation]);

	function onClose() {
		setDialogOpen(false);
		setTempLocation({ name: "", iconURL: "", id: null });
		setNewLocation({ name: "", iconURL: "", id: null });
	}

	async function onSave() {
		if (tempLocation?.name !== "" && tempLocation) {
			if (await handleCreateLocation()) {
				onClose();
			} else {
				setSelectedLocation(tempLocation);
				setLearningLocation(tempLocation);
			}
		} else {
			onClose();
		}
	}

	async function handleCreateLocation() {
		const possibleExistingLocation = learningLocations.find(
			location => location.name.toLowerCase() === newLocation.name.toLowerCase()
		);

		if (possibleExistingLocation != undefined) {
			setSelectedLocation(possibleExistingLocation);
			setLearningLocation(possibleExistingLocation);

			showToast({
				type: "info",
				title: "Dieser Lernort existiert bereits.",
				subtitle:
					"Der Lernort mit dem Namen " +
					newLocation.name +
					" existiert bereits, daher wurde der Existierende Lernort gewählt."
			});

			return true;
		}

		if (tempLocation?.name.toLowerCase() === newLocation.name.toLowerCase()) {
			if (newLocation && newLocation.name !== "") {
				try {
					const result = await createLearningLocationAsync({
						...newLocation
					});
					setSelectedLocation(result);
					setLearningLocation(result);
					setLocationList(prefLocations => [...prefLocations, result]);
					showToast({
						type: "success",
						title: "Lernort Hinzugefügt",
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
							"konnte nicht hinzugefügt werden: "
					});
					console.error("Error creating new location:", error);
					return false;
				}
			}
		}
		return true;
	}

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
								{/*TODO DISABLED funzt noch nicht wenn man das gleiche auswählt, außerdem wird on close das flasche angezeigt beim raus gehen*/}
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
