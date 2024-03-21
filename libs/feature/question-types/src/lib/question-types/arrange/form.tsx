import { LabeledField, MarkdownField, MarkdownViewer } from "@self-learning/ui/forms";
import { Fragment, useState } from "react";
import { useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { ArrangeItem, ArrangeQuestion } from "./schema";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import {
	AddButton,
	DeleteButton,
	Dialog,
	DialogActions,
	Divider,
	EditButton,
	OnDialogCloseFn,
	SectionHeader,
	showToast,
	TransparentDeleteButton
} from "@self-learning/ui/common";
import { getRandomId } from "@self-learning/util/common";

export default function ArrangeForm({ index }: { index: number }) {
	const { watch, setValue } = useFormContext<QuestionTypeForm<ArrangeQuestion>>();
	const items = watch(`quiz.questions.${index}.items`);
	const [addCategoryDialog, setAddCategoryDialog] = useState(false);
	const [editItemDialog, setEditItemDialog] = useState<{
		item?: ArrangeItem;
		containerId: string;
	} | null>(null);

	const onDragEnd: OnDragEndResponder = result => {
		console.log(result);
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
			showToast({ type: "warning", title: "Kategorie exisitert bereits", subtitle: title });
			return;
		}

		setValue(`quiz.questions.${index}.items`, {
			...items,
			[title]: []
		});
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
		}
	}

	console.log(items);

	return (
		<div className="flex flex-col gap-8 pr-4">
			{/*<button type="button" className="btn-primary w-fit" onClick={}>*/}
			{/*	<PlusIcon className="icon h-5" />*/}
			{/*</button>*/}
			<SectionHeader
				title={"Kategorien"}
				button={
					<AddButton
						title={"Kategorie Hinzufügen"}
						onAdd={() => setAddCategoryDialog(true)}
						additionalClassNames={"w-fit"}
					>
						<span>Kategorie hinzufügen</span>
					</AddButton>
				}
			/>
			{addCategoryDialog && <AddCategoryDialog onClose={onAddCategory} />}
			{editItemDialog && <EditItemDialog onClose={onEditItem} item={editItemDialog.item} />}
			<DragDropContext onDragEnd={onDragEnd}>
				<ul className="grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2">
					{Object.entries(items).map(([containerId, items]) => (
						// eslint-disable-next-line react/jsx-no-useless-fragment
						<Fragment key={containerId}>
							{containerId === "_init" ? null : (
								<li
									key={containerId}
									className="flex min-w-fit flex-col gap-4 rounded-lg bg-gray-200 p-4"
								>
									<span className="flex items-center justify-between gap-4 font-semibold">
										<span>{containerId}</span>
										<div className="flex gap-2">
											<AddButton
												onAdd={() => setEditItemDialog({ containerId })}
												title={"Element hinzufügen"}
											/>

											<DeleteButton
												onDelete={() => onDeleteContainer(containerId)}
												title={"Kategorie entfernen"}
											/>
										</div>
									</span>

									<Droppable droppableId={containerId}>
										{provided => (
											<ul
												ref={provided.innerRef}
												{...provided.droppableProps}
												className="flex h-full min-h-[128px] flex-col gap-4 rounded-lg bg-gray-100 p-4"
											>
												{items.map((item, index) => (
													<DraggableContent
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
								</li>
							)}
						</Fragment>
					))}
				</ul>
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
					className="prose prose-emerald flex h-fit w-fit flex-col gap-2 rounded-lg bg-white p-4 shadow-lg"
				>
					<div className="flex justify-end gap-2">
						<EditButton
							onEdit={() =>
								setEditItemDialog({
									containerId,
									item
								})
							}
							title={"Editieren"}
						/>

						<TransparentDeleteButton
							onDelete={() => onDeleteItem(containerId, item.id)}
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

function EditItemDialog({
	item,
	onClose
}: {
	item?: ArrangeItem;
	onClose: OnDialogCloseFn<ArrangeItem>;
}) {
	const [content, setContent] = useState(item?.content ?? "");

	return (
		<Dialog className="w-[80vw]" title={item ? "Bearbeiten" : "Hinzufügen"} onClose={onClose}>
			<MarkdownField content={content} setValue={setContent as any} />

			<DialogActions onClose={onClose}>
				<button
					type="button"
					className="btn-primary"
					onClick={() =>
						onClose({
							id: item?.id ?? getRandomId(),
							content
						})
					}
				>
					{item ? "Übernehmen" : "Hinzufügen"}
				</button>
			</DialogActions>
		</Dialog>
	);
}
