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
	LearningGoalInputTile,
	Sidebar,
	LearningDiaryPageDetail,
	useDiaryPage,
	MarkDownInputTile
} from "@self-learning/diary";

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

/**
 * Initialize the form with the page details and update the page on every change (currently not debounced).
 * onChange must do the validation of the form and update the page accordingly
 */
function usePageForm({
	pageDetails,
	onChange
}: {
	pageDetails: LearningDiaryPageDetail | null | undefined;
	onChange?: (page: LearningDiaryPage) => void;
}) {
	const defaultValues = useMemo(() => {
		return {
			// Set the defaults of the form here. Since we have start values directly from the database
			// we need to transform the to the correct zod-input type for validation. Especially the incompatibilities between
			// null and undefined are important here. This is a common pattern in the codebase.
			...pageDetails,
			notes: pageDetails?.notes ?? undefined,
			learningGoals: pageDetails?.learningGoals.map(goal => ({
				...goal,
				lastProgressUpdate: goal.lastProgressUpdate ?? undefined
			})),
			learningLocation: pageDetails?.learningLocation
				? {
						name: pageDetails.learningLocation.name,
						iconURL: pageDetails.learningLocation.iconURL ?? undefined,
						defaultLocation: false
					}
				: undefined
		};
	}, [pageDetails]);

	const form = useForm<LearningDiaryPage>({
		resolver: zodResolver(learningDiaryPageSchema),
		defaultValues
	});

	// avoid render loops
	useEffect(() => {
		const subscription = form.watch((value, _) => {
			const updateCandidate = { ...defaultValues, ...value };
			/* The type should match since the missing values come from the defaultValues
			 * but it does not hurt to do un unsafely cast here, since trpc will validate the data anyway
			 */
			onChange?.(updateCandidate as LearningDiaryPage);
		});

		return () => {
			// // Reset the form on every db load
			// form.reset(defaultValues);
			subscription.unsubscribe();
		};
	}, [form, onChange, defaultValues]);

	return { ...form };
}

function DiaryContentForm({
	diaryId,
	availableStrategies
}: {
	diaryId: string;
	availableStrategies: Strategy[];
}) {
	const { data: pageDetails, isLoading } = trpc.learningDiary.get.useQuery({ id: diaryId });
	const { mutateAsync: updateLtbPage } = trpc.learningDiary.update.useMutation();
	const form = usePageForm({ pageDetails, onChange: updateLtbPage });

	const itemsWithRatings = availableStrategies.map(strategy => {
		const updatedStrategy = strategy.techniques.map(technique => {
			const rating = pageDetails?.techniqueRatings.find(
				evaluation => evaluation.technique.id === technique.id
			)?.score;
			return { ...technique, rating };
		});
		return { ...strategy, techniques: updatedStrategy };
	});

	type StrategyWithRating = typeof itemsWithRatings;

	const handleUpdateTechniqueRating = (update: StrategyWithRating) => {};

	if (isLoading) {
		return <LoadingCircleCorner />;
	} else if (!pageDetails) {
		// should not happen since we are fetching the pages in SSR and return 404 if not found
		return null;
	}
	return (
		<div className="space-y-4">
			<div className="flex justify-center">
				<DiaryLearnedContent page={pageDetails} />
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
								onChange={field.onChange}
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
