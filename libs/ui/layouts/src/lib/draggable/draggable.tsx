"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RemovableTab, Tab, Tabs } from "@self-learning/ui/common";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DraggableItem<T> = T & { id: string };

const fixContentIDs = <T,>(contentArray: T[]): DraggableItem<T>[] => {
	return contentArray.map(item => {
		if (
			typeof item === "object" &&
			item !== null &&
			"id" in item &&
			typeof (item as Record<string, unknown>).id === "string"
		) {
			return item as DraggableItem<T>;
		}
		return { ...item, id: crypto.randomUUID() } as DraggableItem<T>;
	});
};

export function useDraggableContent<T>(
	initialContent: T[],
	swapEnabled: boolean,
	removeEnabled: boolean
) {
	const normalizedInitialContent = useMemo(() => {
		return fixContentIDs(initialContent);
	}, [initialContent]);

	const [content, setContent] = useState<DraggableItem<T>[]>(normalizedInitialContent);
	const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

	useEffect(() => {
		setContent(fixContentIDs(initialContent));
	}, [initialContent]);

	const swapContent = useCallback((src: number, dest: number) => {
		setContent(prevContent => {
			const newContent = Array.from(prevContent);
			const [removed] = newContent.splice(src, 1);
			newContent.splice(dest, 0, removed);
			return newContent;
		});
	}, []);

	const removeContent = useCallback((idx: number) => {
		setContent(prevContent => prevContent.filter((_, i) => i !== idx));
	}, []);

	const appendContent = useCallback((newItem: T) => {
		setContent(prevContent => {
			const normalizedNewItem = fixContentIDs([newItem])[0];
			return [...prevContent, normalizedNewItem];
		});
	}, []);

	return {
		content,
		activeIndex,
		setActiveIndex,
		swapContent: swapEnabled ? swapContent : undefined,
		removeContent: removeEnabled ? removeContent : undefined,
		appendContent: appendContent
	};
}

/**
 * @usage
 * - Select combination of two elements: Viewer and Outline/Selector. You can use Outline/Selector separately from viewer
 * - T must have a string id field.
 * - Create your container of T[].
 * - Create TWO useState<number | undefined>(undefined):
 *   - activeIndex - holds current viewed element
 *   - targetIndex - used to trigger scroll on click on the desired content
 * - RenderContent for Viewer is a view for each T. Must have item: T and index: number fields.
 *   - if supplied item is undefined => content array is empty
 * - RenderContent for Outline/Selector is a view for each T. Must have item: T.
 *   - Keep it simple! Ideally make it just text
 *   - if supplied item is undefined => content array is empty
 * !!! look carefully which indexes are supplied into components! Can cause nasty errors!
 *
 * resetTargetIndex - set it to `() => setTargetIndex(nullptr)`
 */
export function DraggableContentViewer<
	T extends { id: string },
	RenderProps extends Record<string, unknown> = Record<string, never>
>({
	content,
	setActiveIndex,
	targetIndex, // separate from activeIndex to avoid circle dependency
	resetTargetIndex,
	RenderContent,
	renderProps,
	gap
}: {
	content: T[];
	setActiveIndex: (idx: number | undefined) => void;
	targetIndex: number | undefined;
	resetTargetIndex: () => void;
	RenderContent: (props: { item?: T; index?: number } & RenderProps) => JSX.Element;
	renderProps?: RenderProps;
	gap?: number;
}) {
	const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
	const visibleItemsRef = useRef<Set<number>>(new Set());
	const isAutoScrollRef = useRef<boolean>(false);
	// scroll into selected
	useEffect(() => {
		if (targetIndex !== undefined && content[targetIndex] && contentRefs.current[targetIndex]) {
			isAutoScrollRef.current = true;
			const prevScrollY = window.scrollY;
			contentRefs.current[targetIndex].scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
			setActiveIndex(targetIndex);
			resetTargetIndex(); // immediately drop so it can be triggered again
			// debounce
			setTimeout(() => {
				const newScrollY = window.scrollY;
				if (Math.abs(newScrollY - prevScrollY) < 1) {
					isAutoScrollRef.current = false; // Ensure it's false
				}
			}, 300);
		}
	}, [targetIndex]); // Deliberately avoid update on content to avoid scroll on delete, on swap, .... Allow only on click
	useEffect(() => {
		const handleScrollEnd = () => {
			if (isAutoScrollRef.current) {
				isAutoScrollRef.current = false;
			}
		};

		if ("onscrollend" in window) {
			window.addEventListener("scrollend", handleScrollEnd);
		} else {
			console.log("ERROR onscrollend is not supported");
		}
		return () => {
			if ("onscrollend" in window) {
				window.removeEventListener("scrollend", handleScrollEnd);
			}
		};
	}, []);

	// Detect active element
	const calculateMinVisibleIndex = () => {
		if (visibleItemsRef.current.size === 0) return undefined;
		let min: number | undefined;
		for (const idx of visibleItemsRef.current) {
			if (min === undefined || idx < min) min = idx;
		}
		return min;
	};
	useEffect(() => {
		const remInPx = parseInt(getComputedStyle(document.documentElement).fontSize);
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					const indexStr = (entry.target as HTMLElement).dataset?.["activeIndex"];
					if (indexStr !== undefined) {
						const index = parseInt(indexStr, 10);
						if (entry.isIntersecting) {
							visibleItemsRef.current.add(index);
						} else {
							visibleItemsRef.current.delete(index);
						}
					}
				});
				if (!isAutoScrollRef.current) {
					// if manual scroll - adjust active index
					const newActiveIndex = calculateMinVisibleIndex();
					setActiveIndex(newActiveIndex); // React ignores same index update
				}
			},
			{
				root: null,
				rootMargin: `-${4 * remInPx}px 0px 0px 0px`,
				threshold: 0.01
			}
		);

		contentRefs.current.forEach(ref => {
			if (ref) {
				observer.observe(ref);
			}
		});

		return () => {
			observer.disconnect();
		};
	}, [content, setActiveIndex]);

	if (!content || content.length === 0) {
		return (
			<div>
				<RenderContent {...(renderProps as RenderProps)} />
			</div>
		);
	}

	return (
		<div className={`flex flex-col gap-${gap ?? 4}`}>
			{content.map((item, index) => (
				<div
					key={item.id}
					ref={el => {
						contentRefs.current[index] = el;
					}}
					// Add a data attribute to easily retrieve the index in the Intersection Observer callback
					data-active-index={index}
					// Scroll positioning fix because of website header
					className="scroll-mt-16"
				>
					<RenderContent index={index} item={item} {...(renderProps as RenderProps)} />
				</div>
			))}
		</div>
	);
}

export function DraggableContentOutline<T extends { id: string }>({
	content,
	swapContent,
	removeContent,
	activeIndex,
	setTargetIndex,
	RenderContent
}: {
	content: T[];
	swapContent?: (src: number, dest: number) => void;
	removeContent?: (idx: number) => void;
	activeIndex: number | undefined;
	setTargetIndex: (idx: number) => void; // separate from activeIndex to avoid circle dependency
	RenderContent: (props: {
		item?: T;
		swappable?: boolean;
		remove?: () => void;
		select?: () => void;
		active?: boolean;
	}) => JSX.Element;
}) {
	return (
		<DragDropContext
			onDragEnd={result => {
				if (!swapContent || result.reason !== "DROP" || !result.destination) return;
				swapContent(result.source.index, result.destination.index);
			}}
		>
			<Droppable droppableId="droppable" direction="vertical">
				{provided => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="overflow-y-auto"
					>
						<div className="flex flex-col flex-no-wrap min-w-max">
							{content.map((item, index) => (
								<Draggable
									key={item.id}
									draggableId={item.id}
									index={index}
									isDragDisabled={!swapContent}
								>
									{provided => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
										>
											<RenderContent
												item={item}
												swappable={!!swapContent}
												remove={
													removeContent && (() => removeContent(index))
												}
												select={() => setTargetIndex(index)}
												active={activeIndex === index}
											/>
										</div>
									)}
								</Draggable>
							))}
							{(!content || content.length === 0) && (
								<div className={`flex gap-5 text-nowrap flex-nowrap items-center`}>
									<span>
										<RenderContent />
									</span>
								</div>
							)}
						</div>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

export function DraggableContentSelector<T extends { id: string }>({
	content,
	swapContent,
	removeContent,
	activeIndex,
	setTargetIndex,
	RenderContent
}: {
	content: T[];
	swapContent?: (src: number, dest: number) => void;
	removeContent?: (idx: number) => void;
	activeIndex: number | undefined;
	setTargetIndex: (idx: number) => void;
	RenderContent: (props: { item?: T }) => JSX.Element;
}) {
	return (
		<DragDropContext
			onDragEnd={result => {
				if (!swapContent || result.reason !== "DROP" || !result.destination) return;
				swapContent(result.source.index, result.destination.index);
			}}
		>
			<Droppable droppableId="droppable" direction="horizontal">
				{provided => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="overflow-auto"
					>
						<Tabs selectedIndex={activeIndex} onChange={setTargetIndex}>
							<div className="flex flex-no-wrap gap-4 min-w-max">
								{content.map((item, index) => (
									<Draggable
										key={item.id}
										draggableId={item.id}
										index={index}
										isDragDisabled={!swapContent}
									>
										{provided => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
											>
												{removeContent && (
													<RemovableTab
														onRemove={() => removeContent(index)}
													>
														<div className="flex gap-5 items-center">
															{swapContent && (
																<Bars3Icon className="h-5 text-light" />
															)}
															<RenderContent item={item} />
														</div>
													</RemovableTab>
												)}
												{!removeContent && (
													<Tab>
														<div className="flex gap-5 items-center">
															{swapContent && (
																<Bars3Icon className="h-5 text-light" />
															)}
															<RenderContent item={item} />
														</div>
													</Tab>
												)}
											</div>
										)}
									</Draggable>
								))}
								{(!content || content.length === 0) && (
									<div
										className={`flex gap-5 text-nowrap flex-nowrap items-center`}
									>
										<span>
											<RenderContent />
										</span>
									</div>
								)}
							</div>
						</Tabs>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}
