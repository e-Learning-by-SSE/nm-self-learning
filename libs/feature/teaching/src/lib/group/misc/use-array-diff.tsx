import { TableDataColumn } from "@self-learning/ui/common";
import { type ReactNode, useRef } from "react";

export type ArrayDiffStatus = "unchanged" | "added" | "modified" | "deleted";
export type ArrayDiffItem<T> = {
	key: string;
	value: T;
	status: ArrayDiffStatus;
};

const diffInsetClass: Record<ArrayDiffStatus, string> = {
	unchanged: "",
	added: "shadow-[inset_4px_0_0_0_var(--c-primary)]",
	modified: "shadow-[inset_4px_0_0_0_var(--c-info)]",
	deleted: "shadow-[inset_4px_0_0_0_var(--c-danger)]"
};

const diffCellClass = "bg-c-surface-0 py-2 px-4 text-sm";

export function useArrayDiff<T>({
	current,
	diffKey, // use to force restart diff when form was updated
	getKey,
	isEqual
}: {
	current: T[];
	diffKey: number;
	getKey: (item: T) => string;
	isEqual: (left: T, right: T) => boolean;
}) {
	const originalByKey = useRef<Map<string, T> | null>(null);
	const diffKeyRef = useRef(diffKey);
	if (!originalByKey.current || diffKeyRef.current !== diffKey) {
		diffKeyRef.current = diffKey;
		originalByKey.current = new Map(current.map(item => [getKey(item), item]));
	}
	const currentKeys = new Set(current.map(getKey));
	const getStatus = (item: T): ArrayDiffStatus => {
		const original = originalByKey.current?.get(getKey(item));
		if (!original) return "added";
		return isEqual(original, item) ? "unchanged" : "modified";
	};
	const deleted = Array.from(originalByKey.current.entries())
		.filter(([key]) => !currentKeys.has(key))
		.map(([key, value]) => ({ key, value, status: "deleted" as const }));
	return {
		getStatus,
		deleted
	};
}

export function TableDiffColumn({
	children,
	status = "unchanged"
}: {
	status?: ArrayDiffStatus;
	children: ReactNode;
}) {
	const accent = diffInsetClass[status];
	const className = accent ? `${diffCellClass} ${accent}` : diffCellClass;
	return <TableDataColumn className={className}>{children}</TableDataColumn>;
}
