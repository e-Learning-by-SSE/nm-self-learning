import { PencilIcon, StarIcon, TrashIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import {
	database,
	findLtbPage,
	getUserLocations,
	getAllStrategies,
	LearningDiaryPageDetail
} from "@self-learning/database";
import { LearningDiaryPage, learningDiaryPageSchema, ResolvedValue } from "@self-learning/types";
import { Dialog, showToast } from "@self-learning/ui/common";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { formatTimeIntervalToString } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";

type TechniqueEvaluation = LearningDiaryPageDetail["learningTechniqueEvaluation"][number];

async function allPages(username: string) {
	return await database.learningDiaryPage.findMany({
		select: {
			id: true
		},
		where: {
			studentName: username
		}
	});
}

type PagesMeta = ResolvedValue<typeof allPages>;

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

	const pageId = context.params?.pageId;

	try {
		const diaryPage = await findLtbPage(pageId as string);
		const pages = await allPages(session.user.name);
		const usersLocation = await getUserLocations(session.user.name);
		const availableStrategies = await getAllStrategies();
		// const learningDiaryInformation = await findManyLtbDetails({
		// 	username: session.user.name
		// });
		return {
			props: {
				diaryPage,
				pages,
				usersLocation,
				availableStrategies
			}
		};
	} catch (error) {
		console.error("Error fetching Learning Diary Information:", error);
		return {
			props: {
				learningDiaryInformation: null,
				pageNumber: null
			}
		};
	}
};

type Strategy = ResolvedValue<typeof getAllStrategies>[number];
type Location = ResolvedValue<typeof getUserLocations>[number];

export default function DiaryPageDetail({
	pages,
	diaryPage,
	availableStrategies,
	usersLocation
}: {
	diaryPage: LearningDiaryPageDetail;
	pages: PagesMeta;
	availableStrategies: Strategy[];
	usersLocation: Location[];
}) {
	const router = useRouter();
	const { mutateAsync: updateLtbPage } = trpc.learningDiary.update.useMutation();

	const handleUpdateEntry = (updatedEntry: LearningDiaryPage) => {
		updateLtbPage(updatedEntry);
	};
	const changePage = (diaryId: string) => {
		router.push("/learning-diary/page/" + diaryId);
	};

	return (
		<div className="flex justify-center">
			<div className="w-2/3 py-4">
				<div className="mb-4 flex justify-center">
					<PageChanger
						pages={pages}
						changePage={changePage}
						currentPageId={diaryPage.id}
					/>
				</div>
				<EvaluationForm
					entry={entries[currentIndex]}
					learningDiaryInformation={learningDiaryEvaluation}
					onUpdate={handleUpdateEntry}
					initDiaryPage={{
						id: entries[currentIndex].id,
						learningLocationId: entries[currentIndex].learningLocation?.id,
						effortLevel: entries[currentIndex].effortLevel,
						distractionLevel: entries[currentIndex].distractionLevel,
						notes: entries[currentIndex].notes ?? undefined,
						learningTechniqueEvaluation:
							entries[currentIndex].learningTechniqueEvaluation?.map(evaluation => ({
								id: evaluation.id,
								creatorName: "",
								score: evaluation.score,
								learningTechniqueId: evaluation.learningTechnique.id,
								learningDiaryEntryId: ""
							})) ?? []
					}}
				/>
			</div>
		</div>
	);
}

function PageChanger({
	pages,
	changePage,
	currentPageId
}: {
	pages: PagesMeta;
	changePage: (index: string) => void;
	currentPageId: string;
}) {
	const currentPageIndex = pages.findIndex(page => page.id === currentPageId);

	const updateToPreviousId = () => {
		const newIndex = Math.max(currentPageIndex - 1, 0);
		changePage(pages[newIndex].id);
	};

	const updateToNextId = () => {
		const newIndex = Math.min(currentPageIndex + 1, pages.length - 1);
		changePage(pages[newIndex].id);
	};

	return (
		<div className="flex space-x-16">
			<button
				className="btn btn-primary"
				onClick={updateToPreviousId}
				disabled={currentPageIndex === 0}
			>
				Vorheriger Eintrag
			</button>
			<div className="rounded bg-gray-100 p-2">{currentPageIndex + 1}</div>
			<button
				className="btn btn-primary"
				onClick={updateToNextId}
				disabled={currentPageIndex === pages.length - 1}
			>
				Nächster Eintrag
			</button>
		</div>
	);
}

function EvaluationForm({
	details,
	initPageValues,
	availableStrategies,
	usersLocation,
	onSubmit
}: {
	details: LearningDiaryPageDetail;
	initPageValues: LearningDiaryPage;
	availableStrategies: Strategy[];
	usersLocation: Location[];
	onSubmit: (updatedEntry: LearningDiaryPage) => void;
}) {
	// 	initDiaryPage,
	// 	onSubmit
	// }: {
	// 	data: LearningDiaryEvaluation;
	// 	initDiaryPage: LearningDiaryPage;
	// 	onSubmit: (updatedEntry: LearningDiaryPage) => void;
	// }) {
	const form = useForm<LearningDiaryPage>({
		resolver: zodResolver(learningDiaryPageSchema),
		defaultValues: initPageValues
	});

	// const { reset } = form;

	const { mutateAsync: updateLtbPage } = trpc.learningDiary.update.useMutation();

	// const onSubmit2 = async (formData: LearningDiaryPage) => {
	// 	// const updatedEntry: LearningDiaryPage = {
	// 	// 	...formData
	// 	// };
	// 	await updateLtbPage({
	// 		...formData,
	// 		learningLocationId:
	// 			formData.learningLocationId ?? learningDiaryPage.learningLocation.id,
	// 		effortLevel: formData.effortLevel ?? learningDiaryPage.effortLevel,
	// 		distractionLevel: formData.distractionLevel ?? learningDiaryPage.distractionLevel,
	// 		notes: formData.notes ?? leariningDiaryPage.notes
	// 	});

	// 	onUpdate(updatedEntry);
	// 	reset(data);
	// };

	// maybe not necessary
	// useEffect(() => {
	// 	reset({
	// 		learningLocation: entry.learningLocation,
	// 		effortLevel: entry.effortLevel,
	// 		distractionLevel: entry.distractionLevel,
	// 		notes: entry.notes,
	// 		learningTechniqueEvaluation: entry.learningTechniqueEvaluation
	// 	});
	// }, [entry, reset]);

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="mb-4 flex justify-center">
					<PageDetails page={details} />
				</div>
				<div className="mb-4">
					<Controller
						name="learningLocationId"
						control={form.control}
						render={({ field }) => (
							<LocationInputTile
								learningLocations={diaryPage.learningLocation}
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
						control={form.control}
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
						control={form.control}
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
						control={form.control}
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
						name="learningTechniqueEvaluation"
						control={form.control}
						render={({ field }) => (
							<LearningTechniqueEvaluationInput
								onSubmit={onSubmit}
								evaluation={field.value}
								entryId={entry.id}
								setEvaluations={field.onChange}
								learningStrategies={diaryPage.learningStrategies}
								learningTechniques={diaryPage.learningTechniques}
							/>
						)}
					/>
				</div>
			</form>
		</FormProvider>
	);
}

function LearningTechniqueEvaluationInput({
	entryId,
	diaryPage,
	setEvaluations,
	onSubmit
}: {
	entryId: string;
	diaryPage: LearningDiaryEvaluation;
	evaluation: TechniqueEvaluation[];
	setEvaluations: (evaluations: TechniqueEvaluation[]) => void;
	onSubmit: (data: InputType) => Promise<void>;
}) {
	const { learningTech } = diaryPage;
	const { mutateAsync: createLearningTechniqueEvaluation } =
		trpc.learningTechniqueEvaluation.create.useMutation();

	const { mutateAsync: deleteManyLearningTechniqueEvaluations } =
		trpc.learningTechniqueEvaluation.deleteMany.useMutation();

	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [currentSelectedTechnique, setCurrentSelectedTechnique] = useState<{
		score: number;
		learningTechniqueId: string;
	}>({
		score: 1,
		learningTechniqueId: ""
	});

	const [selectableTechniques, setSelectableTechniques] = useState<LearningStrategy[]>([]);

	const [evaluationsToDelete, setEvaluationsToDelete] = useState<
		{ evaluationID: string; techniqueId: string }[]
	>([]);

	const { handleSubmit } = useFormContext();

	function onClose() {
		setCurrentSelectedTechnique({ score: 1, learningTechniqueId: "" });
		setSelectableTechniques([]);
		setEvaluationsToDelete([]);
		setDialogOpen(false);
	}

	async function onSave() {
		try {
			if (currentSelectedTechnique.learningTechniqueId !== "") {
				const newEvaluation = await createLearningTechniqueEvaluation({
					score: currentSelectedTechnique.score,
					learningTechniqueId: currentSelectedTechnique.learningTechniqueId,
					learningDiaryEntryId: entryId
				});

				const evaluationsWithoutNewEvaluation = learningTechniqueEvaluations.filter(
					evaluation =>
						evaluation.learningTechnique.id != newEvaluation.learningTechnique.id
				);

				setEvaluations([...evaluationsWithoutNewEvaluation, newEvaluation]);
			}

			if (evaluationsToDelete.length > 0) {
				await deleteManyLearningTechniqueEvaluations(
					evaluationsToDelete.map(i => i.evaluationID)
				);

				const techniqueIdsToRemove = evaluationsToDelete.map(i => i.techniqueId);

				const evaluationsWithoutDeletions = learningTechniqueEvaluations.filter(
					evaluation => !techniqueIdsToRemove.includes(evaluation.learningTechnique.id)
				);

				setEvaluations(evaluationsWithoutDeletions);
				setEvaluationsToDelete([]);
			}

			await handleSubmit(onSubmit)();

			onClose();
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred";

			showToast({
				type: "error",
				title: "Error",
				subtitle: errorMessage
			});
		}
	}

	function handleEvaluationToDelete(techniqueId: string) {
		setEvaluationsToDelete(function (prevEvaluationsToDelete) {
			const evaluation = learningTechniqueEvaluations.find(evaluation => {
				return evaluation.learningTechnique.id === techniqueId;
			});

			if (evaluation) {
				return [
					...prevEvaluationsToDelete,
					{
						evaluationID: evaluation.id,
						techniqueId: evaluation.learningTechnique.id
					}
				];
			}

			return prevEvaluationsToDelete;
		});
	}

	return (
		<div>
			<Tile
				onToggleEdit={setDialogOpen}
				tileName={"Lernstrategie"}
				isFilled={learningTechniqueEvaluations && learningTechniqueEvaluations.length > 0}
			>
				<div>
					{learningTechniqueEvaluations && learningTechniqueEvaluations.length > 0 ? (
						<table className="w-full">
							<tbody>
								{learningTechniqueEvaluations.map(evaluation => (
									<tr key={evaluation.learningTechnique.id} className="">
										<td className="w-1/2 py-2 pr-8 text-left">
											{evaluation.learningTechnique.name}
										</td>
										<td className="w-1/2 py-2 pl-8 text-right">
											<StarRatingDisplay rating={evaluation.score} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<span>{"Noch keine Bewertung Hinterlegt."}</span>
					)}
				</div>
			</Tile>
			{dialogOpen && (
				<Dialog title={"Lerntechniken Bewerten"} onClose={onClose}>
					<div className="mx-auto w-full max-w-lg">
						<label className="mb-1 block py-2 text-sm text-gray-700">Strategie</label>
						<select
							className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm"
							defaultValue=""
							onChange={event => {
								setSelectableTechniques(
									learningTechniques.filter(technique =>
										technique.learningStrategie.id.localeCompare(
											event.target.value
										)
									)
								);
								setCurrentSelectedTechnique({ score: 1, learningTechniqueId: "" });
							}}
						>
							<option value="" hidden>
								Bitte wählen eine Lernstrategie...
							</option>
							{learningStrategies.map(strat => (
								<option key={strat.id} value={strat.id}>
									{strat.name}
								</option>
							))}
						</select>

						<div className="h-64 py-4">
							<label className="mb-1 block py-2 text-sm text-gray-700">Technik</label>
							<div className="h-full overflow-y-auto rounded border border-gray-300 shadow-sm">
								<div>
									{selectableTechniques && selectableTechniques.length > 0 ? (
										selectableTechniques.map(technique => {
											return (
												<div
													key={technique.id}
													className="flex w-full items-center rounded border-b border-gray-300 bg-white shadow-sm hover:bg-gray-100"
												>
													<button
														className={`flex flex-grow items-center space-x-4 p-4`}
														onClick={() => {
															setCurrentSelectedTechnique({
																score: 1,
																learningTechniqueId: technique.id
															});
														}}
													>
														{technique.name}
													</button>

													{learningTechniqueEvaluations.some(
														evaluatedTechnique =>
															evaluatedTechnique.learningTechnique
																.id === technique.id
													) &&
														!evaluationsToDelete.some(
															deletionObject =>
																deletionObject.techniqueId ===
																technique.id
														) && (
															<button
																onClick={() =>
																	handleEvaluationToDelete(
																		technique.id
																	)
																}
																className="flex items-center justify-center px-4 text-red-500 hover:text-red-700"
															>
																<TrashIcon className="h-5 w-5" />
															</button>
														)}
												</div>
											);
										})
									) : (
										<div className="flex flex-1 items-center justify-center p-4 text-gray-500">
											Noch keine Lernstrategie Ausgewählt.
										</div>
									)}
								</div>
							</div>
						</div>

						<div className="mt-4 flex items-center py-4">
							<label className="mb-1 text-sm text-gray-700">Bewertung</label>
							<div className="flex flex-1 justify-end">
								{currentSelectedTechnique.learningTechniqueId !== "" ? (
									<StarRatingInput
										name={"Bewertung"}
										setSelectedStars={score => {
											setCurrentSelectedTechnique({
												score,
												learningTechniqueId:
													currentSelectedTechnique.learningTechniqueId
											});
										}}
									/>
								) : (
									<StarRatingDisplay rating={0} />
								)}
							</div>
						</div>

						<div className="mt-4 flex justify-end space-x-4">
							<button
								onClick={onClose}
								className="btn-stroked w-full max-w-lg hover:bg-gray-100"
							>
								Abbrechen
							</button>
							<button
								onClick={onSave}
								className="btn-primary w-full max-w-lg"
								disabled={
									currentSelectedTechnique.learningTechniqueId === "" &&
									evaluationsToDelete.length === 0
								}
							>
								Speichern
							</button>
						</div>
					</div>
				</Dialog>
			)}
		</div>
	);
}

function MarkDownInputTile({
	initialNote,
	setNote,
	onSubmit
}: {
	initialNote: string | null;
	setNote: (note: string) => void;
	onSubmit: (data: InputType) => Promise<void>;
}) {
	const [displayedNotes, setDisplayedNotes] = useState<string | null>(initialNote);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const { handleSubmit } = useFormContext();

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

function PageDetails({ page }: { page: LearningDiaryPageDetail }) {
	return (
		<div className="flex w-full space-x-4 p-4">
			<div className="flex flex-shrink-0 flex-grow basis-1/6 flex-col">
				<span className="font-semibold">Datum:</span>
				<span>{page.createdAt.toString() /*TODO*/}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-2/6 flex-col">
				<span className="font-semibold">Kurs:</span>
				<span>{page.course.title}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-2/6 flex-col">
				<span className="font-semibold">Dauer:</span>
				<span>{formatTimeIntervalToString(page.learningDurationMs)}</span>
			</div>
			<div className="flex flex-shrink-0 flex-grow basis-1/6 flex-col">
				<span className="font-semibold">Umfang:</span>
				<span>{page.scope}</span>
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
			<Tile onToggleEdit={setDialogOpen} tileName={name} isFilled={initialRating >= 1}>
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
	tileName,
	isFilled
}: {
	children: React.ReactElement;
	onToggleEdit: (open: boolean) => void;
	tileName: string;
	isFilled: boolean;
}) {
	return (
		<div
			className={`relative flex max-h-[200px] min-h-[200px] items-center justify-center rounded border ${
				isFilled ? "bg-green-100" : "bg-gray-100"
			}`}
		>
			<div className="absolute top-2 left-2 text-gray-800">{tileName}</div>
			<div className="absolute top-2 right-2">
				<PencilIcon
					className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
					onClick={() => onToggleEdit(true)}
				/>
			</div>
			<div
				className={`flex h-full items-center justify-center rounded-md border p-4 hover:bg-gray-100 ${
					isFilled ? "shadow-secondary-color shadow-md" : "shadow-md"
				}`}
			>
				{React.cloneElement(children, {
					onClick: () => onToggleEdit(true),
					className: `${children.props.className || ""} cursor-pointer`
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
	learningLocations: Location[];
	initialLearningLocation?: Location;
	setLearningLocation: (location: Location) => void;
	onSubmit: (data: any) => Promise<void>;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const { mutateAsync: createLearningLocationAsync } = trpc.learningLocation.create.useMutation();
	const { handleSubmit } = useFormContext();

	const [selectedLocation, setSelectedLocation] = useState(initialLearningLocation);
	const [tempLocation, setTempLocation] = useState<Location | null>(null);

	type LocationWithNullableId = Omit<Location, "id"> & { id: string | null };
	const [newLocation, setNewLocation] = useState<LocationWithNullableId | null>({
		name: "",
		iconURL: "",
		id: null
	});

	const onClose = () => {
		setDialogOpen(false);
		setTempLocation(null);
		setNewLocation(null);
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
		<Tile
			onToggleEdit={setDialogOpen}
			tileName={"Lernort"}
			isFilled={initialLearningLocation != null || initialLearningLocation != undefined}
		>
			<div className="p-4">
				{selectedLocation ? (
					<div>
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
								<CreateLocation setNewLocation={setNewLocation} />
								{learningLocations.map(location => {
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

function CreateLocation({ setNewLocation }: { setNewLocation: (location: Location) => void }) {
	return (
		<div className={"py-1"}>
			<button
				key={"newLocation"}
				className={`flex w-full items-center space-x-4 rounded border border-gray-300 p-4 shadow-sm ${
					tempLocation?.id === newLocation.id ? "bg-gray-100" : "bg-white"
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
