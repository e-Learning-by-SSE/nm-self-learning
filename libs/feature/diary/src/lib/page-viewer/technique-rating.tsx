import { StarIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Dialog, DialogActions, OnDialogCloseFn, StarRating } from "@self-learning/ui/common";
import { Tile } from "./input-tile";
import { Strategy, Technique } from "../util/types";

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

	const ratedTechniques = findRatedTechniques(strategies);

	const handleTileClick = () => {
		setStrategyDialogOpen(true);
	};

	const handleEvaluationSubmit = (updatedTechnique: Technique) => {
		setEvalTarget(null);
		console.debug("save", updatedTechnique);
		onChange(updatedTechnique);
	};

	const handleEvaluationDialogClose = () => {
		setEvalTarget(null);
	};

	return (
		<>
			<Tile
				tileName="Genutzte Techniken"
				isFilled={ratedTechniques.length > 0}
				onToggleEdit={handleTileClick}
			>
				<UsedTechniqueList techniques={ratedTechniques} />
			</Tile>
			{strategyDialogOpen && (
				<Dialog
					title="Lernstrategien"
					onClose={() => setStrategyDialogOpen(false)}
					className="fixed inset-0 z-10 overflow-y-auto"
				>
					<div className="mt-4 p-4 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8">
						<StrategyList
							onTechniqueClick={technique => setEvalTarget(technique)}
							strategies={strategies}
						/>
						<DialogActions onClose={() => setStrategyDialogOpen(false)} />
					</div>
				</Dialog>
			)}
			{evalTarget && (
				<TechniqueRatingDialog
					technique={evalTarget}
					onClose={handleEvaluationDialogClose}
					onSubmit={handleEvaluationSubmit}
				/>
			)}
		</>
	);
}

export function UsedTechniqueList({ techniques }: { techniques: Technique[] }) {
	return (
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
	);
}

function StrategyList({ strategies, onTechniqueClick }: StrategiesProps) {
	const handleInfoClick = (strategyId: string) => {
		console.log("Aktuell keine Funktion");
	};

	return (
		<div className="p-4 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8">
			{strategies.map(strategy => (
				<div key={strategy.id} className="mb-8 break-inside-avoid">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-bold text-xl">{strategy.name}</h2>
						<button onClick={() => handleInfoClick(strategy.id)}>
							<InformationCircleIcon className="h-6 w-6 text-blue-500" />
						</button>
					</div>
					<ul className="pl-8 border-l-2 border-gray-300">
						{strategy.techniques.map(technique => (
							<li
								key={technique.id}
								className="flex items-center justify-between cursor-pointer text-blue-500 underline mb-2 hover:bg-gray-200"
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
		</div>
	);
}

export function TechniqueRatingDialog({
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
			className="fixed inset-0 z-10 overflow-y-auto"
		>
			<div className="flex justify-center items-center">
				<StarRating
					rating={selectedTechnique.score ?? 0}
					onChange={handleTechniqueRatingChange}
				/>
			</div>
			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={submitRating}>
					<span>Fertig</span>
				</button>
			</DialogActions>
		</Dialog>
	);
}
