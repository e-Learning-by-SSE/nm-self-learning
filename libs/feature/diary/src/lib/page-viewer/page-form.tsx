import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { LearningTechnique } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import {
	LearningDiaryPageInput,
	LearningDiaryPageOutput,
	learningDiaryPageSchema
} from "@self-learning/types";
import { Divider, LoadingCircleCorner, Tooltip } from "@self-learning/ui/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, ControllerRenderProps, FormProvider, useForm } from "react-hook-form";
import { LearningDiaryPageDetail, Strategy } from "../access-learning-diary";
import {
	LearningGoalInputTile,
	LocationInputTile,
	MarkDownInputTile,
	StarInputTile
} from "./input-tile";
import { DiaryLearnedContent } from "./page-details";
import { PersonalTechniqueRatingTile } from "./technique-rating";

function convertToLearningDiaryPageSafe(pageDetails: LearningDiaryPageDetail | undefined | null) {
	if (!pageDetails) {
		return undefined;
	}
	const inputType = {
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
			pageDetails.learningGoals?.map(goal => ({
				id: goal.id,
				description: goal.description,
				learningSubGoals: goal.learningSubGoals.map(subGoal => ({
					id: subGoal.id,
					description: subGoal.description,
					priority: subGoal.priority,
					learningGoalId: goal.id // rename
				}))
			})) ?? undefined,
		techniqueRatings:
			pageDetails.techniqueRatings?.map(rating => ({
				id: rating.technique.id,
				score: rating.score,
				learningTechniqueId: rating.technique.id, // rename
				learningDiaryEntryId: pageDetails.id // rename
			})) ?? undefined
	} satisfies LearningDiaryPageInput;
	return learningDiaryPageSchema.parse(inputType); // parse to add defaults
}

/**
 * Initialize the form with the page details and update the page on every change (currently not debounced).
 */
function usePageForm({
	pageDetails,
	onChange
}: {
	pageDetails: LearningDiaryPageDetail | null | undefined;
	onChange?: (page: LearningDiaryPageInput) => void;
}) {
	const values = useMemo(() => {
		//  Since we start with values directly from the database we need to transform them to the correct zod-input type for form validation.
		// Especially the incompatibilities between, null and undefined are important here, but there are other properties which needs to be renamed. This is a common pattern in the codebase.
		return convertToLearningDiaryPageSafe(pageDetails);
	}, [pageDetails]);

	const form = useForm<LearningDiaryPageOutput>({
		resolver: zodResolver(learningDiaryPageSchema),
		values
	});

	// useEffect to avoid render loops
	useEffect(() => {
		const subscription = form.watch((value, _) => {
			const updateCandidate = { ...values, ...value };
			/** We do manual cast here, even if trpc would validate it later. We want to have some kind of compiler check here to make development easier. It should warn if the props, ignoring null and undefined. */
			const result = learningDiaryPageSchema.parse(updateCandidate);
			onChange?.(result);
		});

		return () => subscription.unsubscribe();
	}, [form, onChange, values]);

	return { ...form };
}

function useCompactView() {
	const [isCompact, setIsCompact] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedState = localStorage.getItem("is-diary-page-compact");
			setIsCompact(savedState !== null ? JSON.parse(savedState) : false);
		}
	}, []);

	const toggleCompactView = useCallback((): void => {
		setIsCompact((prev: boolean): boolean => {
			const newState = !prev;
			if (typeof window !== "undefined") {
				localStorage.setItem("is-diary-page-compact", JSON.stringify(newState));
			}
			return newState;
		});
	}, [setIsCompact]);

	return { isCompact, toggleCompactView };
}

export function DiaryContentForm({
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
	const { isCompact, toggleCompactView } = useCompactView();

	// add "rating" prop
	const itemsWithRatings = availableStrategies.map(strategy => {
		const updatedStrategy = strategy.techniques.map(technique => {
			const score = pageDetails?.techniqueRatings.find(
				evaluation => evaluation.technique.id === technique.id
			)?.score;
			return { ...technique, score };
		});
		return { ...strategy, techniques: updatedStrategy };
	});

	type Technique = { name: string; id: string; score?: number };

	function onTechniqueChange(
		updatedTechnique: Technique,
		field: ControllerRenderProps<LearningDiaryPageOutput, "techniqueRatings">
	) {
		const updatedArray = field.value?.some(
			(technique: { id: string; score: number }) => technique.id === updatedTechnique.id
		)
			? field.value.map((technique: { id: string; score: number }) =>
					technique.id === updatedTechnique.id ? updatedTechnique : technique
				)
			: [...(field.value || []), updatedTechnique];

		field.onChange(updatedArray.length > 0 ? updatedArray : [updatedTechnique]);
	}

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

			<div className="flex justify-end">
				<Tooltip content={"Wechselt zwischen der normalen und der kompakten Ansicht."}>
					<button onClick={toggleCompactView}>
						{isCompact ? (
							<ArrowsPointingOutIcon className="h-6 w-6 text-gray-500" />
						) : (
							<ArrowsPointingInIcon className="h-6 w-6 text-gray-500" />
						)}
					</button>
				</Tooltip>
			</div>

			<FormProvider {...form}>
				<form className=" space-y-6 xl:space-y-4">
					<div
						className={
							isCompact
								? "grid grid-cols-1 2xl:grid-cols-2 gap-4"
								: "flex flex-col gap-4"
						}
					>
						<Controller
							name="learningGoals"
							control={form.control}
							render={({ field }) => (
								<LearningGoalInputTile
									goals={field.value ?? []}
									onChange={field.onChange}
									isCompact={isCompact}
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
									isCompact={isCompact}
								/>
							)}
						/>
						<Controller
							name="effortLevel"
							control={form.control}
							render={({ field }) => (
								<StarInputTile
									name={"Bemühungen"}
									initialRating={field.value}
									onChange={field.onChange}
									description={
										"Hier kannst du deine eigenen Bemühungen einschätzen. Dies kann dir helfen deine Lernstrategien zu optimieren."
									}
									isCompact={isCompact}
								/>
							)}
						/>
						<Controller
							name="distractionLevel"
							control={form.control}
							render={({ field }) => (
								<StarInputTile
									name={"Ablenkungen"}
									initialRating={field.value}
									onChange={field.onChange}
									description={
										"Wie stark waren deine Ablenkungen beim Lernen? Hier kannst du deine Ablenkungen einschätzen und das kann dir helfen deine Lernstrategien zu optimieren."
									}
									isCompact={isCompact}
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
										onTechniqueChange(updatedTechnique, field);
									}}
									isCompact={isCompact}
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
									isCompact={isCompact}
								/>
							)}
						/>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}
