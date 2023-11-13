import { StrategyType } from "@prisma/client";
import { z } from "zod";

export const strategySchema = z.object({
	type: z.nativeEnum(StrategyType),
	confidenceRating: z.number(),
	notes: z.string().nullable()
});

export function getStrategyNameByType(type: StrategyType) {
	let out = "Strategie Auswählen";
	switch (type) {
		case StrategyType.REPEATING:
			out = "Wiederholung";
			break;
		case StrategyType.USERSPECIFIC:
			out = "Eigene Strategie bestimmen";
			break;
	}
	return out;
}

export type StrategyOverview = {
	type: StrategyType;
	_count: {
		type: number;
	};
	_avg: {
		confidenceRating: number | null;
	};
};
export type UserSpecificStrategyOverview = {
	notes: string | null;
	_count: {
		type: number;
	};
	_avg: {
		confidenceRating: number | null;
	};
};
