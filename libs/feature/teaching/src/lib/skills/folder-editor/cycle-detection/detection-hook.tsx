import {FolderItem} from "./cycle-detection";
import {useEffect, useState} from "react";



interface DrawState {
	item: FolderItem | null,
	initial: boolean
}

const listener: Map<string, (state: DrawState) => void> = new Map();
const memorizedDetection: FolderItem[] = [];

export const dispatchDetection = (items: FolderItem[]) => {
	items.forEach(item => {
		const listenerCallback = listener.get(item.skill.id);
		if (listenerCallback) {
			if(item.cycle || item.parent) {
				memorizedDetection.push(item);
			}
			listenerCallback({item: item, initial: false});
		}
	});
};

export const ClearCycleDetection = () => {
	memorizedDetection.forEach(item => {
		const listenerCallback = listener.get(item.skill.id);
		if (listenerCallback) {
			const folderItem = {
				skill: item.skill,
				selectedSkill: item.selectedSkill,
			};
			listenerCallback({item: folderItem, initial: false});
		}
	});
	memorizedDetection.length = 0;
}


export function useDetection(id: string): DrawState {
	const [state, setState] = useState<DrawState>({item: null, initial: true});

	useEffect(() => {
		listener.set(id, setState);
	}, [id, state]);
	return state;
}
