import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Dialog, DialogActions, OnDialogCloseFn, StarRating } from "@self-learning/ui/common";
import { MarkdownEditorDialog } from "@self-learning/ui/forms";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { TileLayout } from "./input-tile";
import { MarkdownViewer } from "@self-learning/ui/common";

type Technique = { name: string; description: string | null; id: string; score?: number };

type Strategy = { techniques: Technique[]; id: string; name: string; description: string };

type StrategiesProps = {
	strategies: Strategy[];
	onTechniqueClick: (technique: Technique) => void;
	onCreateTechniqueClick: (learningStrategyId: string) => void;
};

function findRatedTechniques(strategies: Strategy[]) {
	return strategies.flatMap(strategy => strategy.techniques.filter(technique => technique.score));
}

export function PersonalTechniqueRatingTile({
	strategies,
	onChange,
	isCompact
}: {
	strategies: Strategy[];
	onChange: (technique: Technique) => void;
	isCompact: boolean;
}) {
	const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
	const [evalTarget, setEvalTarget] = useState<Technique | null>(null);
	const [createNewTechnique, setCreateNewTechnique] = useState<{
		learningStrategyId: string;
	} | null>(null);
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
		<TileLayout
			isCompact={isCompact}
			onClick={handleTileClick}
			isFilled={techniquesWithRating.length > 0}
			tileDescription={toolTipText}
			tileName="Genutzte Techniken"
		>
			{/* Strategy List Dialog */}
			{strategyDialogOpen && (
				<Dialog
					title="Lernstrategien"
					onClose={() => setStrategyDialogOpen(false)}
					className="w-4/5 h-4/5 flex flex-col items-center justify-center overflow-hidden"
				>
					<span className="text-lg mb-4">{toolTipText}</span>
					<div className="grid grid-flow-row grid-cols-1 gap-4 w-full h-full overflow-y-auto p-4">
						<StrategyList
							onTechniqueClick={technique => setEvalTarget(technique)}
							onCreateTechniqueClick={learningStrategyId =>
								setCreateNewTechnique({ learningStrategyId })
							}
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

			{/* Technique Rating Dialog */}
			{evalTarget && (
				<TechniqueRatingDialog
					technique={evalTarget}
					onClose={handleEvaluationDialogClose}
					onSubmit={handleTechniqueRatingSubmit}
				/>
			)}
			{createNewTechnique && (
				<CreateOwnTechniqueDialog
					learningStrategieId={createNewTechnique.learningStrategyId}
					onClose={() => setCreateNewTechnique(null)}
					onSubmit={technique => {
						setCreateNewTechnique(null);
						onChange(technique);
					}}
				/>
			)}
			{/* Display List of Used Techniques */}
			<div className="mt-4 py-2 min-h-40 max-h-40 overflow-y-auto">
				<UsedTechniqueList techniques={techniquesWithRating} />
			</div>
		</TileLayout>
	);
}

export function UsedTechniqueList({ techniques }: { techniques: Technique[] }) {
	return (
		<div className="flex items-center justify-center w-full ">
			<ul className="space-y-4 w-full">
				{techniques.map(technique => (
					<li key={technique.id} className="flex items-center justify-between">
						<span className="flex-grow whitespace-normal break-words text-gray-800">
							{technique.name}
						</span>
						{technique.score !== undefined && (
							<div className="flex items-center space-x-2 ml-4">
								<StarRating rating={technique.score} onChange={() => {}} />
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

function StrategyList({ strategies, onTechniqueClick, onCreateTechniqueClick }: StrategiesProps) {
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
						<li
							key={"createTechnique" + strategy.id}
							className="flex items-center justify-between cursor-pointer mb-2 hover:text-green-500"
							onClick={() => onCreateTechniqueClick(strategy.id)}
						>
							<span className="font-bold italic">Eigene Technik erstellen</span>
						</li>
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
			await saveStrategy({ ...strategy, description: updatedDesc });
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
				<div className={"max-w-full"}>
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

function CreateOwnTechniqueDialog({
	learningStrategieId,
	onClose,
	onSubmit
}: {
	learningStrategieId: string;
	onClose: OnDialogCloseFn<void>;
	onSubmit: (technique: Technique) => void;
}) {
	const { mutateAsync: saveNewTechnique } =
		trpc.learningTechniqueRating.createNewTechnique.useMutation();
	const [selectedTechnique, setSelectedTechnique] = useState<Technique>({
		name: "",
		description: null,
		id: "",
		score: 0
	});

	const submit = async () => {
		if (selectedTechnique.name !== "") {
			const newTechnique = await saveNewTechnique({
				...selectedTechnique,
				description: selectedTechnique.description ?? undefined,
				learningStrategieId
			});
			onSubmit({ ...selectedTechnique, ...newTechnique });
		}
	};

	return (
		<Dialog title={`Neu Technik erstellen`} onClose={onClose} className="fixed inset-0 z-10">
			<div className="flex flex-col justify-start items-start overflow-y-auto">
				<div className="w-full max-w-md  text-l prose prose-emerald p-2">
					<input
						className="textfield w-full"
						type={"text"}
						onChange={e =>
							setSelectedTechnique({ ...selectedTechnique, name: e.target.value })
						}
					/>
				</div>
				<div className="p-2">
					<StarRating
						rating={selectedTechnique.score ?? 0}
						onChange={score => setSelectedTechnique({ ...selectedTechnique, score })}
					/>
				</div>
			</div>
			<div className="relative h-10 bg-white">
				<button
					className="btn-primary absolute bottom-0 right-3"
					onClick={submit}
					disabled={!selectedTechnique.score}
				>
					<span>Fertig</span>
				</button>
			</div>
		</Dialog>
	);
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
		if (selectedTechnique.score === undefined) {
			const techniqueWithScore = { ...selectedTechnique, score: 1 };
			onSubmit(techniqueWithScore);
			return;
		}
		onSubmit(selectedTechnique);
	};

	return (
		<Dialog
			title={`Bewertung von "${selectedTechnique.name}"`}
			onClose={onClose}
			className="fixed inset-0 z-10"
		>
			<div className="flex flex-col justify-start items-start overflow-y-auto">
				<div className="w-full max-w-md pb-5 text-l">
					<MarkdownViewer content={selectedTechnique.description ?? ""} />
				</div>
				<div className="">
					<StarRating
						rating={selectedTechnique.score ?? 0}
						onChange={handleTechniqueRatingChange}
					/>
				</div>
			</div>
			<div className="relative h-10 bg-white">
				<button
					className="btn-primary absolute bottom-0 right-3"
					onClick={submitRating}
					disabled={!selectedTechnique.score}
				>
					<span>Fertig</span>
				</button>
			</div>
		</Dialog>
	);
}
