"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * README
 * Navigable Content is a group of helper components, which provide 
 * ready-to-use solution for creating a document outline (good analogy: google doc, or just a e-book), where:
 * - Outline/Selector: is Table of Contents, where you can see the outline of a document, and navigate through it.
 * - Viewer is: Chapters of a book themselves. 
 * It provides following functionality:
 * - see what element is currently in focus
 * - select any element and autoscroll to it
 * - change element order by drag&drop
 * - delete elements
 * Navigable Content is created over some data of type T (continuing with a book example: list of book chapters)
 * @usage
 * - Select combination of two elements: @see NavigableContentViewer (Viewer - Displays ) 
 *     and @see NavigableContentOutline / @see NavigableContentSelector Outline/Selector. 
 * - Create your container of T[]. (T must have an unique `id: string` field.)
 * - Create TWO useState<number | undefined>(undefined):
 *   - activeIndex - holds current viewed element;
 *   - targetIndex - used to trigger scroll on click on the desired content.
 *   - set `resetTargetIndex` to `() => setTargetIndex(nullptr)`
 * - RenderContent for Viewer is a view for each T.
 *   - it receives T item and decides how to render it
 *   - if supplied item is undefined => there is no items in T[] - you can render some placeholder
 * - RenderContent for Outline/Selector is a view for each T. 
 * 	 - it receives T item and decides how to render it
 *   - if supplied item is undefined => there is no items in T[] - you can render some placeholder
 * @important look carefully which ids have T[]! Can cause nasty errors!
 * 
 * For simplicity of data management use @see useNavigableContent.
 * 
 * @usage
 * ```
 * // Following a book analogy:
 * 
 * type Chapter = {
 * 		id: string,
 * 		name: string,
 * 		content: string
 * }
 * 
 * function Book(content) : {content: Chapter[] } {

		const [targetTabIndex, setTargetTabIndex] = useState<number | undefined>(undefined);
		const ctx = useNavigableContent(content, true, true); // include drag&drop and deletions - not really like a book - but imagine you are an author

		render(
	 		<div className="grid grid-cols-[1fr_300px] gap-8">
	 			<NavigableContentOutline
					content={ctx.content}
					swapContent={ctx.swapContent}
					removeContent={ctx.removeContent}
					activeIndex={ctx.activeIndex}
					setTargetIndex={setTargetTabIndex}
					RenderContent={ChapterOutlineRenderer}
				/>
				<NavigableContentViewer
					content={ctx.content}
					targetIndex={targetTabIndex}
					resetTargetIndex={() => setTargetTabIndex(undefined)} // drops targetIndex when scroll is finished, so scroll is done once
					setActiveIndex={ctx.setActiveIndex}
					RenderContent={ChapterContentRenderer}
				/>
			</div>
		)
 * }

	function ChapterContentRenderer({
		index,
		item
	}: {
		index?: number;
		item?: T;
	}) {
		if (item) {
			// render chapter content here
		} else {
			return <span className="text-red-500">Book is empty :(</span>;
		}
	}

	function ChapterOutlineRenderer({
		item,
		swappable,
		remove,
		select,
		active
	}: 
		INavigableOutlineTab<T> // just convenience type
	) {
		// You are completely free how to render T, but make it compact and clean, 
		// as this view is going to be composed into list
		return (
			<>
				{item && (
					<div>
						{swappable && <IconCanSwap/>}
						<span
							className={`${active ? "active" : "non-active"}`}
							onClick={select}
						>
							{item.text}
						</span>
						{remove && (
							<Button onClick={remove}/>
						)}
					</div>
				)}
				{!item && "empty book"}
			</>
		);
	}
 * 
 */

/**
 * A generic wrapper type that ensures each item has a unique `id` field.
 */
export type NavigableItem<T> = T & { id: string };

export type INavigableOutlineTab<T> = {
	item?: T;
	swappable?: boolean;
	remove?: () => void;
	select?: () => void;
	active?: boolean;
};

export type NavigableContent<T> = {
	content: NavigableItem<T>[];
	activeIndex: number | undefined;
	setActiveIndex: (idx: number | undefined) => void;
	swapContent?: (a: number, b: number) => void;
	removeContent?: (idx: number) => void;
	appendContent?: (newItem: T) => void;
};

export type NavigableContentContext<T> = NavigableContent<T> & {
	targetIndex: number | undefined;
	setTargetIndex: (idx: number | undefined) => void;
};

/**
 * React hook to manage navigable content with optional swap/remove capabilities.
 *
 * @template T - Type of the content items
 *
 * @param initialContent - Initial array of content items
 * @param swapEnabled - Whether swapping items (drag & drop reorder) is allowed
 * @param removeEnabled - Whether removing items is allowed
 *
 * @note will create separate array of content; will append `id` field if missing
 *
 * @returns Object with:
 *  - `content`: current array of navigable items
 *  - `activeIndex`: index of the currently active item
 *  - `setActiveIndex`: setter for the active index
 *  - `swapContent`: function to swap two items (if `swapEnabled`)
 *  - `removeContent`: function to remove an item by index (if `removeEnabled`)
 *  - `appendContent`: function to append a new item
 */
export function useNavigableContent<T>(
	initialContent: T[],
	swapEnabled: boolean,
	removeEnabled: boolean
): NavigableContent<T> {
	const [content, setContent] = useState(() => fixContentIDs(initialContent));
	const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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
 * Component for rendering a vertically scrollable viewer of navigable content.
 *
 * @template T - Item type (must include an `id: string` field)
 * @template RenderProps - Extra props passed to each `RenderContent`
 *
 * @remarks
 * - Designed for pairing with `NavigableContentOutline` (selector).
 * - Tracks visible items using IntersectionObserver.
 * - Supports smooth auto-scroll to `targetIndex`.
 * - Updates `activeIndex` based on scroll position.
 */
export function NavigableContentViewer<
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
	// Scroll into selected (targetIndex)
	// We intentionally only depend on targetIndex.
	// Content changes (e.g., on delete) should NOT retrigger scrolling.
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [targetIndex]);
	useEffect(() => {
		const handleScrollEnd = () => {
			if (isAutoScrollRef.current) {
				isAutoScrollRef.current = false;
			}
		};
		let scrollTimeout: ReturnType<typeof setTimeout>;
		const handleScroll = () => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				handleScrollEnd();
			}, 100);
		};
		if (typeof window !== "undefined") {
			if ("onscrollend" in window) {
				window.addEventListener("scrollend", handleScrollEnd);
			} else {
				// @ts-expect-error ts always thinks that onscrollend is present. For safari might not be the case
				window.addEventListener("scroll", handleScroll, { passive: true });
			}
		}
		return () => {
			if (typeof window !== "undefined") {
				if ("onscrollend" in window) {
					window.removeEventListener("scrollend", handleScrollEnd);
				} else {
					// @ts-expect-error ts always thinks that onscrollend is present. For safari might not be the case
					window.removeEventListener("scroll", handleScroll);
				}
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
			ref && observer.observe(ref);
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

/**
 * Outline-style sidebar for navigable content.
 *
 * @remarks
 * - Vertical list
 * - Allows selecting items
 * - Allows drag & drop (reorder) 	(if `swapContent`  is provided)
 * - Allows removing items 			(if `removeContent` is provided)
 */
export function NavigableContentOutline<T extends { id: string }>({
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
						<div className="flex flex-col flex-nowrap min-w-max">
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
								<div
									className={`flex gap-5 whitespace-nowrap flex-nowrap items-center`}
								>
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

/**
 * Horizontal selector variant of @see NavigableContentOutline
 *
 * @remarks
 * - Horizontal scrolling instead of vertical
 * - Supports drag & drop reordering
 */
export function NavigableContentSelector<T extends { id: string }>({
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
			<Droppable droppableId="droppable" direction="horizontal">
				{provided => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="overflow-auto"
					>
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

const fixContentIDs = <T,>(contentArray: T[]): NavigableItem<T>[] => {
	return contentArray.map(item => {
		if (
			typeof item === "object" &&
			item !== null &&
			"id" in item &&
			typeof (item as Record<string, unknown>).id === "string"
		) {
			return item as NavigableItem<T>;
		}
		return { ...item, id: crypto.randomUUID() } as NavigableItem<T>;
	});
};
