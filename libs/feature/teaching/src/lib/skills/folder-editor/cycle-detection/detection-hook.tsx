import {FolderItem} from "./cycle-detection";
import {useEffect, useState} from "react";


interface State {
	items: FolderItem[],
	initial: boolean,
}

interface DrawState {
	item: FolderItem | null,
	initial: boolean
}

let memoryState: State = {items: [], initial: true}
const listener: Map<string, (state: DrawState) => void> = new Map();

export const dispatchDetection = (items: FolderItem[]) => {
	memoryState = {items: items, initial: false};
	items.forEach(item => {
		const listenerCallback = listener.get(item.skill.id);
		if (listenerCallback) {
			listenerCallback({item: item, initial: false});
		}
	});
};

export function useDetection(id: string): DrawState {
	const [state, setState] = useState<DrawState>({item: null, initial: true});

	useEffect(() => {
		listener.set(id, setState);
	}, [id, state]);
	return state;
}
