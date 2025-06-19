"use client";
import React, { memo, useEffect, useState } from "react";

const listenerMap: Map<string, Array<(state: State) => void>> = new Map();

let memoryState: State = { isOpen: false, dialog: null };

interface State {
	isOpen: boolean;
	dialog: React.ReactNode;
}

/**
 * @deprecated
 */
export const dispatchDialog = (dialog: React.ReactNode, id: string) => {
	memoryState = { isOpen: true, dialog: dialog };
	const listeners = listenerMap.get(id);
	if (!listeners) return;
	listeners.forEach(listener => {
		listener(memoryState);
	});
};

/**
 * Should be used if the same dialog is opened multiple times in one component
 * Reason React will not rerender the component if the same dialog is used
 * @deprecated
 */
export const freeDialog = (id: string) => {
	memoryState = { isOpen: false, dialog: null };
	const listeners = listenerMap.get(id);
	if (!listeners) return;
	listeners.forEach(listener => {
		listener(memoryState);
	});
};

/**
 * @deprecated
 */
function useDialog(id: string): State {
	const [state, setState] = useState<State>(memoryState);

	useEffect(() => {
		const listeners = listenerMap.get(id);
		if (!listeners) {
			listenerMap.set(id, [setState]);
			return;
		} else {
			listeners.push(setState);
			return () => {
				const index = listeners.indexOf(setState);
				if (index > -1) {
					listeners.splice(index, 1);
				}
			};
		}
	}, [id, state]);

	return state;
}

/**
 * @deprecated
 */
export const DialogHandler = memo(DialogHandlerComponent);

/**
 * @deprecated
 */
function DialogHandlerComponent({ id }: { id: string }) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { isOpen, dialog } = useDialog(id);

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>{dialog}</>
	);
}
