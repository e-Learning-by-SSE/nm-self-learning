import {FolderItem} from "./cycle-detection";
import {useEffect, useState} from "react";



interface DrawState {
	item: FolderItem | null,
	initial: boolean
}

const listener: Map<string, Array<(state: DrawState) => void>> = new Map();
const memorizedDetection: FolderItem[] = [];

export const dispatchDetection = (items: FolderItem[]) => {
	items.forEach(item => {
		const listenerCallbacks = listener.get(item.skill.id);
		if (listenerCallbacks) {
			if(item.cycle || item.parent) {
				memorizedDetection.push(item);
			}
			for(const callback of listenerCallbacks) {
				callback({item: item, initial: false});
			}
		}
	});
};

export const ClearCycleDetection = () => {
	memorizedDetection.forEach(item => {
		const listenerCallbacks = listener.get(item.skill.id);
		if (listenerCallbacks) {
			const folderItem = {
				skill: item.skill,
				selectedSkill: item.selectedSkill,
			};
			for(const callback of listenerCallbacks) {
				callback({item: folderItem, initial: false});
			}
		}
	});
	memorizedDetection.length = 0;
}


export function useDetection(id: string): DrawState {
	const [state, setState] = useState<DrawState>({item: null, initial: true});

	useEffect(() => {
		if(!listener.has(id)) {
			listener.set(id, [setState]);
			return;
		} else {
			const listenerCallbacks = listener.get(id);
			if(listenerCallbacks) {
				listenerCallbacks.push(setState);
			}
			return () => {
				if(listenerCallbacks) {
					const index = listenerCallbacks.indexOf(setState);
					if(index > -1) {
						listenerCallbacks.splice(index, 1);
					}
				}
			}
		}
	}, [id, state]);
	return state;
}
