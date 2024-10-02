import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon
} from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import {
	allPages,
	DiaryLearnedContent,
	getAllStrategies,
	LocationInputTile,
	StarInputTile,
	Strategy,
	PersonalTechniqueRatingTile,
	Sidebar,
	LearningDiaryPageDetail,
	useDiaryPage,
	MarkDownInputTile,
	LearningGoalInputTile
} from "@self-learning/diary";
import { subMilliseconds } from "date-fns";

import { LearningDiaryPage, learningDiaryPageSchema, ResolvedValue } from "@self-learning/types";
import { Divider, LoadingCircleCorner, Tooltip } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

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
	const pages = await allPages(session.user.name);
	const availableStrategies = await getAllStrategies();

	const pageExists = pages.some(page => page.id === pageId);
	if (!pageExists) {
		return {
			notFound: true
		};
	}

	return {
		props: {
			diaryId: pageId,
			pages,
			availableStrategies
		}
	};
};

export default function DiaryPageDetail({
	diaryId,
	pages,
	availableStrategies
}: {
	diaryId: string;
	pages: PagesMeta;
	availableStrategies: Strategy[];
}) {
	// Identify the end date of the page, required for computations / filtering of details
	const index = pages.findIndex(page => page.id === diaryId);
	let endDate = index >= 0 && index < pages.length - 1 ? pages[index + 1].createdAt : new Date();
	endDate = subMilliseconds(endDate, 1); // subtract 1 ms to avoid fetching data of the next page

	return (
		<div className="flex flex-col">
			<div className="mx-auto flex w-full flex-col-reverse gap-8 px-4 xl:grid xl:grid-cols-[400px_1fr]">
				<div>
					<Sidebar selectedPageId={diaryId} pages={pages} />
				</div>

				<div>
					<div className="w-2/3 py-4">
						<div className="mb-4 flex justify-center">
							<PageChanger key={diaryId} pages={pages} currentPageId={diaryId} />
						</div>

						<Divider />
						<DiaryContentForm
							key={diaryId}
							diaryId={diaryId}
							availableStrategies={availableStrategies}
							endDate={endDate}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

/** This component relies on the LearningDiaryPages list being sorted in ascending manner (refer to the database function)  */
function PageChanger({ pages, currentPageId }: { pages: PagesMeta; currentPageId: string }) {
	const currentPageIndex = pages.findIndex(page => page.id === currentPageId);
	const [pageInput, setPageInput] = useState(currentPageIndex + 1);

	const { changePage, jumpToFirstEntry, jumpToLastEntry, updateToPreviousId, updateToNextId } =
		useDiaryPage({ pages, diaryId: currentPageId });

	const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		console.debug(value, pages);
		if (!isNaN(value) && value >= 1 && value <= pages.length) {
			changePage(pages[value - 1].id);
		}
		setPageInput(value);
	};

	return (
		<div className="flex space-x-4 items-center">
			<Tooltip placement={"bottom"} content="Zum ersten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={jumpToFirstEntry}
					disabled={currentPageIndex === 0}
				>
					<ChevronDoubleLeftIcon className="h-4 w-4" />
				</button>
			</Tooltip>
			<Tooltip placement={"bottom"} content="Zum vorherigen Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={updateToPreviousId}
					disabled={currentPageIndex === 0}
				>
					<ChevronLeftIcon className="h-5 w-5 mr-2" />
					Vorheriger Eintrag
				</button>
			</Tooltip>
			<form className="flex items-center">
				<input
					type="number"
					// ref={inputRef}
					value={pageInput}
					// instead of using the submit event, this enables live updating while switching "pages"
					onInput={handlePageInputChange}
					className="w-16 text-center border rounded"
					min={1}
					max={pages.length}
				/>
				<span className="ml-2">/ {pages.length}</span>
			</form>
			<Tooltip placement={"bottom"} content="Zum nächsten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={updateToNextId}
					disabled={currentPageIndex === pages.length - 1}
				>
					Nächster Eintrag
					<ChevronRightIcon className="h-5 w-5 ml-2" />
				</button>
			</Tooltip>
			<Tooltip placement={"bottom"} content="Zum letzten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={jumpToLastEntry}
					disabled={currentPageIndex === pages.length - 1}
				>
					<ChevronDoubleRightIcon className="h-4 w-4" />
				</button>
			</Tooltip>
		</div>
	);
}

function convertToLearningDiaryPageSafe(
	pageDetails: LearningDiaryPageDetail | undefined | null
): LearningDiaryPage | undefined {
	if (!pageDetails) {
		return undefined;
	}
	return {
		id: pageDetails.id,
		scope: pageDetails.scope,
		distractionLevel: pageDetails.distractionLevel,
		effortLevel: pageDetails.effortLevel,
		notes: pageDetails.notes ?? undefined,
		learningLocation: pageDetails?.learningLocation
			? {
					name: pageDetails.learningLocation.name,
					iconURL: pageDetails.learningLocation.iconURL ?? undefined,
					defaultLocation: false
				}
			: undefined,
		learningGoals:
			pageDetails?.learningGoals?.map(goal => ({
				id: goal.id,
				description: goal.description,
				learningSubGoals: goal.learningSubGoals.map(subGoal => ({
					id: subGoal.id,
					description: subGoal.description,
					priority: subGoal.priority,
					learningGoalId: goal.id, // rename
					status: subGoal.status ?? undefined
				})),
				status: goal.status ?? undefined
			})) ?? undefined,
		techniqueRatings:
			pageDetails?.techniqueRatings?.map(rating => ({
				id: rating.technique.id,
				score: rating.score,
				learningTechniqueId: rating.technique.id, // rename
				learningDiaryEntryId: pageDetails.id // rename
			})) ?? undefined
	};
}

/**
 * Initialize the form with the page details and update the page on every change (currently not debounced).
 * onChange must do the validation of the form and triggers a rerender then.
 */
function usePageForm({
	pageDetails,
	onChange
}: {
	pageDetails: LearningDiaryPageDetail | null | undefined;
	onChange?: (page: LearningDiaryPage) => void;
}) {
	const values = useMemo(() => {
		//  Since we start with values directly from the database we need to transform them to the correct zod-input type for form validation.
		// Especially the incompatibilities between, null and undefined are important here, but there are other properties which needs to be renamed. This is a common pattern in the codebase.
		return convertToLearningDiaryPageSafe(pageDetails);
	}, [pageDetails]);

	const form = useForm<LearningDiaryPage>({
		resolver: zodResolver(learningDiaryPageSchema),
		values
	});

	// avoid render loops
	useEffect(() => {
		const subscription = form.watch((value, _) => {
			const updateCandidate /* TODO check here that the updateCandidate is indeed compatible with LearningDiaryPage except null values  */ =
				{ ...values, ...value };
			console.log("updateCandidate", updateCandidate);
			/* TypeCast: The prop should match since the missing values come from the already transformed values. An exception are  undefined and null values which
			 * are possible. To ensure this, updateCandidate must be a partial type. Then we can safely cast here since trpc will validate the data anyway. So
			 * we just ignore undefined/null values here.
			 */
			onChange?.(updateCandidate as LearningDiaryPage);
		});

		return () => subscription.unsubscribe();
	}, [form, onChange, values]);

	return { ...form };
}

function DiaryContentForm({
	diaryId,
	availableStrategies,
	endDate
}: {
	diaryId: string;
	availableStrategies: Strategy[];
	endDate: Date;
}) {
	const { data: pageDetails, isLoading } = trpc.learningDiary.get.useQuery({ id: diaryId });
	const { mutateAsync: updateLtbPage } = trpc.learningDiary.update.useMutation();
	const form = usePageForm({ pageDetails, onChange: updateLtbPage });

	// add "rating" prop
	const itemsWithRatings = availableStrategies.map(strategy => {
		const updatedStrategy = strategy.techniques.map(technique => {
			const rating = pageDetails?.techniqueRatings.find(
				evaluation => evaluation.technique.id === technique.id
			)?.score;
			return { ...technique, rating };
		});
		return { ...strategy, techniques: updatedStrategy };
	});

	if (isLoading) {
		return <LoadingCircleCorner />;
	} else if (!pageDetails) {
		// should not happen since we are fetching the pages in SSR and return 404 if not found
		return null;
	}
	return (
		<div className="space-y-4">
			<div className="flex justify-center">
				<DiaryLearnedContent page={pageDetails} endDate={endDate} />
			</div>
			<Divider />
			<FormProvider {...form}>
				<form className="space-y-4">
					<Controller
						name="learningGoals"
						control={form.control}
						render={({ field }) => (
							<LearningGoalInputTile
								goals={field.value ?? []}
								onChange={field.onChange}
							/>
						)}
					/>
					<Controller
						name="learningLocation"
						control={form.control}
						render={({ field }) => (
							<LocationInputTile
								initialSelection={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
					<Controller
						name="effortLevel"
						control={form.control}
						render={({ field }) => (
							<StarInputTile
								name={"Bemühungen:"}
								initialRating={field.value}
								onChange={field.onChange}
								description={
									"Bitte bewerte deine Bemühungen während der\n" +
									"Lernsession. Bemühungen können ... sein. Mehr\n" +
									"Sterne bedeutet du hast dich mehr bemüht."
								}
							/>
						)}
					/>
					<Controller
						name="distractionLevel"
						control={form.control}
						render={({ field }) => (
							<StarInputTile
								name={"Ablenkungen:"}
								initialRating={field.value}
								onChange={field.onChange}
								description={
									"Bitte bewerte deine Ablenkungen während der\n" +
									"Lernsession. Ablenkungen können z.B. eine hohe\n" +
									"Geräuschkulisse, Unterbrechungen, Anrufe,\n" +
									"Mitbewohner, etc. sein. Mehr Sterne zeigen eine\n" +
									"größere Ablenkung an.\n"
								}
							/>
						)}
					/>
					<Controller
						name="techniqueRatings"
						control={form.control}
						render={({ field }) => (
							<PersonalTechniqueRatingTile
								strategies={itemsWithRatings}
								onChange={updatedTechnique => {
									const updatedArray = field.value?.some(
										technique => technique.id === updatedTechnique.id
									)
										? field.value.map(technique =>
												technique.id === updatedTechnique.id
													? updatedTechnique
													: technique
											)
										: [...(field.value || []), updatedTechnique];

									field.onChange(
										updatedArray.length > 0 ? updatedArray : [updatedTechnique]
									);
								}}
							/>
						)}
					/>
					<Controller
						name="notes"
						control={form.control}
						render={({ field }) => (
							<MarkDownInputTile
								initialNote={field.value}
								onSubmit={field.onChange}
							/>
						)}
					/>
				</form>
			</FormProvider>
		</div>
	);
}
