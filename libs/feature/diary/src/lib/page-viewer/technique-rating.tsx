import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, OnDialogCloseFn, StarRating } from "@self-learning/ui/common";
import { MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Tile } from "./input-tile";

type Technique = {
	name: string;
	description: string;
	id: string;
	score?: number;
};

type Strategy = {
	techniques: Technique[];
	id: string;
	name: string;
	description: string;
};

type StrategiesProps = {
	strategies: Strategy[];
	onTechniqueClick: (technique: Technique) => void;
};

function findRatedTechniques(strategies: Strategy[]) {
	return strategies.flatMap(strategy => strategy.techniques.filter(technique => technique.score));
}

export function PersonalTechniqueRatingTile({
	strategies,
	onChange
}: {
	strategies: Strategy[];
	onChange: (technique: Technique) => void;
}) {
	const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);

	const [evalTarget, setEvalTarget] = useState<Technique | null>(null);

	const techniquesWithRating = findRatedTechniques(strategies);

	const handleTileClick = () => {
		setStrategyDialogOpen(true);
	};

	const handleTechniqueRatingSubmit = (updatedTechnique: Technique) => {
		setEvalTarget(null);
		console.debug("save", updatedTechnique);
		onChange(updatedTechnique);
	};

	const handleEvaluationDialogClose = () => {
		setEvalTarget(null);
	};

	const toolTipText =
		"Welche Lernstrategie/-technik hast du genutzt? Und wie schätzt du den Nutzen ein?";

	return (
		<div>
			<Tile
				tileName="Genutzte Techniken"
				isFilled={techniquesWithRating.length > 0}
				onToggleEdit={handleTileClick}
				tooltip={toolTipText}
			>
				<UsedTechniqueList techniques={techniquesWithRating} />
			</Tile>
			{strategyDialogOpen && (
				<Dialog
					title="Lernstrategien"
					onClose={() => setStrategyDialogOpen(false)}
					className="w-4/5 h-4/5 flex items-center justify-center"
				>
					<span className="text-lg">{toolTipText}</span>
					<div className="grid grid-flow-* grid-cols-1 gap-4 w-full h-full overflow-y-auto">
						<StrategyList
							onTechniqueClick={technique => setEvalTarget(technique)}
							strategies={strategies}
						/>
					</div>
					<div className="flex w-full justify-end pt-5">
						<button
							className="btn-primary"
							onClick={() => setStrategyDialogOpen(false)}
						>
							OK
						</button>
					</div>
				</Dialog>
			)}
			{evalTarget && (
				<TechniqueRatingDialog
					technique={evalTarget}
					onClose={handleEvaluationDialogClose}
					onSubmit={handleTechniqueRatingSubmit}
				/>
			)}
		</div>
	);
}

function UsedTechniqueList({ techniques }: { techniques: Technique[] }) {
	return (
		<div className="flex items-center justify-center max-h-[140px] min-h-40 w-full overflow-y-auto">
			<ul className="space-y-4">
				{techniques.map(technique => (
					<li key={technique.id} className="flex items-center justify-between">
						<span className="flex-grow whitespace-normal break-words">
							{technique.name}
						</span>
						{technique.score !== undefined && (
							<div className="flex items-center space-x-2 ml-4">
								<StarRating
									rating={technique.score}
									onChange={() => {
										/* Nothing; user is not able to change rating from this view */
									}}
								/>
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

function StrategyList({ strategies, onTechniqueClick }: StrategiesProps) {
	const [infoDialogOpen, setInfoDialogOpen] = useState<Strategy | null>(null);
	const handleInfoClick = (strategy: Strategy) => {
		setInfoDialogOpen(strategy);
	};

	return (
		<div className="p-4 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8">
			{strategies.map(strategy => (
				<div key={strategy.id} className="mb-8  break-inside-avoid">
					<div className="flex items-center justify-between mb-4 pr-4">
						<h2 className="font-bold text-xl mr-4">{strategy.name}</h2>
						<button
							title="Erweiterte Informationen"
							onClick={() => handleInfoClick(strategy)}
						>
							<InformationCircleIcon className="h-6 w-6 text-gray-500" />
						</button>
					</div>
					<ul className="pl-8 border-l-2 border-gray-300">
						{strategy.techniques.map(technique => (
							<li
								key={technique.id}
								className="flex items-center justify-between cursor-pointer mb-2 hover:text-green-500"
								onClick={() => onTechniqueClick(technique)}
							>
								<span>{technique.name}</span>
								{technique.score !== undefined && (
									<div className="flex items-center space-x-1">
										<span className="text-gray-700">{technique.score}</span>
										<StarIcon className="h-5 w-5 text-yellow-500" />
									</div>
								)}
							</li>
						))}
					</ul>
				</div>
			))}
			{infoDialogOpen && (
				<StrategieInfoDialog
					strategy={infoDialogOpen}
					onClose={() => {
						setInfoDialogOpen(null);
					}}
				/>
			)}
		</div>
	);
}

function StrategieInfoDialog({ strategy, onClose }: { strategy: Strategy; onClose: () => void }) {
	const [showEditDialog, setShowEditDialog] = useState(false);
	const session = useSession();
	const { mutateAsync: saveStrategy } = trpc.learningDiary.updateStrategy.useMutation();
	const { reload } = useRouter();

	const handleSaveStrategy = async (updatedDesc: string | undefined) => {
		if (updatedDesc) {
			await saveStrategy({
				...strategy,
				description: updatedDesc
			});
		}
		setShowEditDialog(false);
		reload();
	};

	const user = session.data?.user;
	const isAdmin = user?.role ?? "USER";

	if (showEditDialog) {
		return (
			<MarkdownEditorDialog
				title="Strategie bearbeiten"
				initialValue={strategy.description}
				onClose={handleSaveStrategy}
			/>
		);
	} else {
		return (
			<Dialog
				title={strategy.name}
				onClose={onClose}
				className="fixed inset-0 z-10 overflow-y-auto"
			>
				<div className={"prose prose-emerald max-w-full"}>
					<MarkdownViewer content={strategy.description} />
				</div>
				<DialogActions onClose={onClose}>
					{isAdmin === "ADMIN" && (
						<button className="btn-stroked" onClick={() => setShowEditDialog(true)}>
							(Admin) Bearbeiten
						</button>
					)}
				</DialogActions>
			</Dialog>
		);
	}
}

function TechniqueRatingDialog({
	technique,
	onSubmit,
	onClose
}: {
	technique: Technique;
	onSubmit: (updatedTechnique: Technique) => void;
	onClose: OnDialogCloseFn<void>;
}) {
	const [selectedTechnique, setSelectedTechnique] = useState<Technique>(technique);

	const handleTechniqueRatingChange = (score: number) => {
		if (selectedTechnique) {
			setSelectedTechnique({ ...selectedTechnique, score });
		}
	};

	const submitRating = () => {
		onSubmit(selectedTechnique);
	};

	return (
		<Dialog
			title={`Bewertung von "${selectedTechnique.name}"`}
			onClose={onClose}
			className="fixed inset-0 z-10"
		>
			<div className="flex flex-col justify-start items-start overflow-y-auto">
				<div className="w-full max-w-md pb-5 text-l prose prose-emerald">
					<MarkdownViewer content={selectedTechnique.description} />
				</div>
				<div className="">
					<StarRating
						rating={selectedTechnique.score ?? 0}
						onChange={handleTechniqueRatingChange}
					/>
				</div>
			</div>
			<div className="relative h-10 bg-white">
				<button className="btn-primary absolute bottom-0 right-3" onClick={submitRating}>
					<span>Fertig</span>
				</button>
			</div>
		</Dialog>
	);
}
