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
	Tile
} from "@self-learning/diary";

import { LearningDiaryPage, learningDiaryPageSchema, ResolvedValue } from "@self-learning/types";
import { Divider, LoadingCircleCorner, Tooltip } from "@self-learning/ui/common";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Sidebar } from "../../../../../libs/feature/diary/src/lib/page-viewer/sidebar";

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
					<Sidebar pages={pages} />
				</div>

				<div>
					<div className="w-2/3 py-4">
						<div className="mb-4 flex justify-center">
							<PageChanger pages={pages} currentPageId={diaryId} />
						</div>
						<Divider />
						<DiaryContentForm
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
	const router = useRouter();
	const currentPageIndex = pages.findIndex(page => page.id === currentPageId);
	const [pageInput, setPageInput] = useState(currentPageIndex + 1);

	useEffect(() => {
		setPageInput(currentPageIndex + 1);
	}, [router.asPath]);

	const jumpToFirstEntry = () => {
		changePage(pages[0].id);
	};

	const jumpToLastEntry = () => {
		changePage(pages[pages.length - 1].id);
	};

	const changePage = (diaryId: string) => {
		console.log("push");
		router.push("/learning-diary/page/" + diaryId);
	};

	const updateToPreviousId = () => {
		const newIndex = Math.max(currentPageIndex - 1, 0);
		changePage(pages[newIndex].id);
	};

	const updateToNextId = () => {
		const newIndex = Math.min(currentPageIndex + 1, pages.length - 1);
		changePage(pages[newIndex].id);
	};

	const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		console.debug(value, pages);
		if (!isNaN(value) && value >= 1 && value <= pages.length) {
			changePage(pages[value - 1].id);
		}
		setPageInput(value);
	};

	return (
		<div className="flex space-x-4 items-center w-full">
			<Tooltip content="Zum ersten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={jumpToFirstEntry}
					disabled={currentPageIndex === 0}
				>
					<ChevronDoubleLeftIcon className="h-4 w-4" />
				</button>
			</Tooltip>
			<Tooltip content="Zum vorherigen Eintrag springen">
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
			<Tooltip content="Zum nächsten Eintrag springen">
				<button
					className="btn btn-primary flex items-center"
					onClick={updateToNextId}
					disabled={currentPageIndex === pages.length - 1}
				>
					Nächster Eintrag
					<ChevronRightIcon className="h-5 w-5 ml-2" />
				</button>
			</Tooltip>
			<Tooltip content="Zum letzten Eintrag springen">
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

function DiaryContentForm({
	diaryId,
	availableStrategies
}: {
	diaryId: string;
	availableStrategies: Strategy[];
}) {
	const { mutateAsync: updateLtbPage } = trpc.learningDiary.update.useMutation();
	const { data: pageDetails, isLoading } = trpc.learningDiary.get.useQuery({ id: diaryId });

	const defaultValues = useMemo(
		() => ({
			...pageDetails,
			// convert since data from database has null values and in API we only allow undefined
			notes: pageDetails?.notes ?? undefined,
			learningLocation: pageDetails?.learningLocation
				? {
						name: pageDetails?.learningLocation.name,
						iconURL: pageDetails?.learningLocation.iconURL ?? undefined,
						defaultLocation: false
					}
				: undefined
		}),
		[pageDetails]
	);

	const form = useForm<LearningDiaryPage>({
		resolver: zodResolver(learningDiaryPageSchema),
		defaultValues
	});

	useEffect(() => {
		const subscription = form.watch((value, _) => {
			const updateCandidate = { ...defaultValues, ...value };
			console.debug("Update Candidate:", updateCandidate);

			/* The type should match since the missing values come from the defaultValues
			 * but it does not hurt to do un unsafely cast here, since trpc will validate the data anyway
			 */
			updateLtbPage(updateCandidate as LearningDiaryPage);
		});
		return () => subscription.unsubscribe();
	}, [form, form.watch, updateLtbPage, defaultValues]);

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
								name={"Bemühungen:"}
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
						name="notes"
						control={form.control}
						render={({ field }) => (
							<MarkDownInputTile
								initialNote={field.value}
								onSubmit={field.onChange}
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
				</form>
			</FormProvider>
		</div>
	);
}

function MarkDownInputTile({
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
