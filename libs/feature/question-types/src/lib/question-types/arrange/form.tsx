import { LabeledField, MarkdownEditorDialog, MarkdownViewer } from "@self-learning/ui/forms";
import { Fragment, useState } from "react";
import { useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { ArrangeItem, ArrangeQuestion } from "./schema";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import {
	PlusButton,
	TrashcanButton,
	Dialog,
	DialogActions,
	Divider,
	PencilButton,
	OnDialogCloseFn,
	SectionHeader,
	showToast,
	XButton,
	IconButton,
	Toggle
} from "@self-learning/ui/common";
import { getRandomId } from "@self-learning/util/common";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function ArrangeForm({ index }: { index: number }) {
	const { watch, setValue } = useFormContext<QuestionTypeForm<ArrangeQuestion>>();
	const items = watch(`quiz.questions.${index}.items`);
	const [addCategoryDialog, setAddCategoryDialog] = useState(false);
	const categoryOrder = watch(`quiz.questions.${index}.categoryOrder`) ?? [];
	const [editCategoryDialog, setEditCategoryDialog] = useState<string | null>(null);
	const [editItemDialog, setEditItemDialog] = useState<{
		item?: ArrangeItem;
		containerId: string;
	} | null>(null);
	const onDragEnd: OnDragEndResponder = result => {
		const { source, destination } = result;

		if (!destination) return;

		const value = { ...items };
		const [removed] = value[source.droppableId].splice(source.index, 1);
		value[destination.droppableId].splice(destination.index, 0, removed);

		setValue(`quiz.questions.${index}.items`, value);
	};

	const onAddCategory: OnDialogCloseFn<string> = title => {
		setAddCategoryDialog(false);

		if (!title || title.length === 0) return;

		if (items[title]) {
			showToast({ type: "warning", title: "Kategorie existiert bereits", subtitle: title });
			return;
		}

		setValue(`quiz.questions.${index}.items`, {
			...items,
			[title]: []
		});
		const updatedOrder = [...categoryOrder, title];
		setValue(`quiz.questions.${index}.categoryOrder`, updatedOrder);
	};

	const onEditItem: OnDialogCloseFn<ArrangeItem> = item => {
		setEditItemDialog(null);

		if (!editItemDialog) return;
		if (!item) return;

		const value = { ...items };
		const container = value[editItemDialog.containerId];

		if (editItemDialog.item) {
			const index = container.findIndex(i => i.id === editItemDialog.item?.id);
			container[index] = item;
		} else {
			container.push(item);
		}

		setValue(`quiz.questions.${index}.items`, value);
	};

	const onEditContainer: OnDialogCloseFn<string> = title => {
		setEditCategoryDialog(null);
		const currentContainerId = editCategoryDialog;
		if (!title || !editCategoryDialog || currentContainerId === title || !currentContainerId) {
			return;
		}
		if (items[title]) {
			showToast({ type: "warning", title: "Kategorie existiert bereits", subtitle: title });
			return;
		}
		const updatedItems = { ...items };
		updatedItems[title] = updatedItems[currentContainerId];
		delete updatedItems[currentContainerId];
		setValue(
			`quiz.questions.${index}.categoryOrder`,
			categoryOrder.map(id => (id === currentContainerId ? title : id))
		);
		setValue(`quiz.questions.${index}.items`, updatedItems);
	};

	function onDeleteItem(containerId: string, itemId: string): void {
		if (window.confirm("Element wirklich entfernen?")) {
			setValue(`quiz.questions.${index}.items`, {
				...items,
				[containerId]: items[containerId].filter(i => i.id !== itemId)
			});
		}
	}

	function onDeleteContainer(containerId: string): void {
		if (
			window.confirm(
				"Kategorie wirklich entfernen? Alle enthaltenen Elemente werden ebenfalls gelöscht."
			)
		) {
			const value = { ...items };
			delete value[containerId];
			setValue(`quiz.questions.${index}.items`, value);
			const updatedOrder = categoryOrder.filter(id => id !== containerId);
			setValue(`quiz.questions.${index}.categoryOrder`, updatedOrder);
		}
	}

	return (
		<div className="flex flex-col gap-8 pr-4">
			<SectionHeader
				title="Kategorien"
				button={
					<IconButton
						text="Kategorie Hinzufügen"
						icon={<PlusIcon className="icon w-5" />}
						onClick={() => setAddCategoryDialog(true)}
					/>
				}
			/>
			<div className="flex items-center gap-2">
				<Toggle
					value={watch(`quiz.questions.${index}.randomizeItems`)}
					onChange={value => setValue(`quiz.questions.${index}.randomizeItems`, value)}
					label="Antworten dem Nutzer zufällig anordnen"
				/>
			</div>
			{addCategoryDialog && <AddCategoryDialog onClose={onAddCategory} />}
			{editItemDialog && <EditItemDialog onClose={onEditItem} item={editItemDialog.item} />}
			{editCategoryDialog && (
				<EditCategoryDialog onClose={onEditContainer} category={editCategoryDialog} />
			)}
			<DragDropContext onDragEnd={onDragEnd}>
				<div className="grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2">
					{categoryOrder
						.filter(containerId => containerId !== "_init" && items[containerId])
						.map(containerId => (
							// eslint-disable-next-line react/jsx-no-useless-fragment
							<Fragment key={containerId}>
								{containerId === "_init" ? null : (
									<div className="flex min-w-fit flex-col gap-4 rounded-lg bg-gray-200 p-4">
										<span className="flex items-center justify-between gap-4 font-semibold">
											<span>{containerId}</span>
											<div className="flex gap-2">
												<PencilButton
													onClick={() =>
														setEditCategoryDialog(containerId)
													}
													title={"Kategorie bearbeiten"}
												/>
												<PlusButton
													onClick={() =>
														setEditItemDialog({ containerId })
													}
													title={"Element hinzufügen"}
												/>
												<TrashcanButton
													onClick={() => onDeleteContainer(containerId)}
													title={"Kategorie entfernen"}
												/>
											</div>
										</span>

										<Droppable droppableId={containerId} direction="horizontal">
											{provided => (
												<ul
													ref={provided.innerRef}
													{...provided.droppableProps}
													className="flex w-full gap-4 overflow-x-auto min-h-[164px] rounded-lg bg-gray-100 p-4"
												>
													{items[containerId].map((item, index) => (
														<DraggableContent
															key={item.id}
															item={item}
															index={index}
															onDeleteItem={onDeleteItem}
															setEditItemDialog={setEditItemDialog}
															containerId={containerId}
														/>
													))}
													{provided.placeholder}
												</ul>
											)}
										</Droppable>
									</div>
								)}
							</Fragment>
						))}
				</div>
			</DragDropContext>
		</div>
	);
}

function DraggableContent({
	item,
	index,
	setEditItemDialog,
	containerId,
	onDeleteItem
}: {
	item: ArrangeItem;
	index: number;
	setEditItemDialog: (value: { item?: ArrangeItem; containerId: string } | null) => void;
	containerId: string;
	onDeleteItem: (containerId: string, itemId: string) => void;
}) {
	return (
		<Draggable key={item.id} draggableId={item.id} index={index}>
			{provided => (
				<li
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className="flex h-fit w-fit flex-col gap-2 rounded-lg bg-white p-4 shadow-lg"
				>
					<div className="flex justify-end gap-2">
						<PencilButton
							onClick={() =>
								setEditItemDialog({
									containerId,
									item
								})
							}
							title={"Bearbeiten"}
						/>

						<XButton
							onClick={() => onDeleteItem(containerId, item.id)}
							title="Löschen"
						/>
					</div>

					<Divider />
					<MarkdownViewer content={item.content} />
				</li>
			)}
		</Draggable>
	);
}

function AddCategoryDialog({ onClose }: { onClose: OnDialogCloseFn<string> }) {
	const [title, setTitle] = useState("");

	return (
		<Dialog title="Kategorie hinzufügen" onClose={onClose}>
			<LabeledField label="Titel">
				<input
					type="text"
					className="textfield"
					value={title}
					onChange={e => setTitle(e.target.value)}
					onKeyDown={e => {
						if (e.key === "Enter") {
							onClose(title.trim());
							e.preventDefault();
						}
					}}
				/>
			</LabeledField>

			<DialogActions onClose={onClose}>
				<button
					type="button"
					className="btn-primary"
					onClick={() => onClose(title.trim())}
					disabled={title.length === 0}
				>
					Hinzufügen
				</button>
			</DialogActions>
		</Dialog>
	);
}

function EditCategoryDialog({
	onClose,
	category
}: {
	onClose: OnDialogCloseFn<string>;
	category: string | undefined;
}) {
	const [title, setTitle] = useState(category);
	return (
		<Dialog title="Kategorie bearbeiten" onClose={onClose}>
			<LabeledField label="Titel">
				<input
					type="text"
					className="textfield"
					value={title}
					onChange={e => setTitle(e.target.value)}
					onKeyDown={e => {
						if (e.key === "Enter") {
							onClose(title?.trim());
							e.preventDefault();
						}
					}}
				/>
			</LabeledField>

			<DialogActions onClose={onClose}>
				<button
					type="button"
					className="btn-primary"
					onClick={() => onClose(title?.trim())}
					disabled={title?.length === 0}
				>
					Speichern
				</button>
			</DialogActions>
		</Dialog>
	);
}

function EditItemDialog({
	item,
	onClose
}: {
	item?: ArrangeItem;
	onClose: OnDialogCloseFn<ArrangeItem>;
}) {
	const [isEditorOpen, setIsEditorOpen] = useState(true);

	return (
		isEditorOpen && (
			<MarkdownEditorDialog
				title="Markdown bearbeiten"
				initialValue={item?.content ?? ""}
				onClose={newValue => {
					setIsEditorOpen(false);
					if (newValue !== undefined) {
						onClose({ id: item?.id ?? getRandomId(), content: newValue });
					} else {
						onClose(undefined);
					}
				}}
			/>
		)
	);
}
