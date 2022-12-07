import { PlusIcon, XIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { IconButton, OnDialogCloseFn } from "@self-learning/ui/common";
import { Form } from "@self-learning/ui/forms";
import Link from "next/link";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AddAuthorDialog } from "../author/add-author-dialog";
import { CourseFormModel } from "./course-form-model";

export function AuthorsForm() {
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const { control } = useFormContext<{ authors: CourseFormModel["authors"] }>();
	const {
		fields: authors,
		append,
		remove
	} = useFieldArray({
		control,
		name: "authors"
	});

	const handleAdd: OnDialogCloseFn<CourseFormModel["authors"][0]> = result => {
		if (result) {
			if (authors.find(a => a.slug === result.slug)) {
				console.log(`Author ${result.slug} is already added.`);
				return;
			}

			append(result);
		}
		setOpenAddDialog(false);
	};

	function handleRemove(index: number) {
		window.confirm("Autor entfernen?") && remove(index);
	}

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Autoren" subtitle="Die Autoren dieses Kurses." />

			<IconButton
				type="button"
				data-testid="author-add"
				onClick={() => setOpenAddDialog(true)}
				title="Hinzufügen"
				text="Hinzufügen"
				icon={<PlusIcon className="h-5" />}
			/>

			{authors.length === 0 ? (
				<p className="text-sm text-light">
					Für diesen Kurs sind noch keine Autoren hinterlegt.
				</p>
			) : (
				<ul className="grid gap-4">
					{authors.map(({ slug }, index) => (
						<Author key={slug} slug={slug} onRemove={() => handleRemove(index)} />
					))}
				</ul>
			)}

			{openAddDialog && <AddAuthorDialog open={openAddDialog} onClose={handleAdd} />}
		</Form.SidebarSection>
	);
}

function Author({ slug, onRemove }: { slug: string; onRemove: () => void }) {
	const { data: author } = trpc.author.getBySlug.useQuery({ slug });

	if (!author) {
		return <li className="rounded-lg border border-light-border bg-white p-2">Loading...</li>;
	}

	return (
		<li
			className="flex items-center gap-4 rounded-lg border border-light-border bg-white pr-2 text-sm"
			data-testid="author"
		>
			<div className="h-12 w-12 shrink-0 rounded-l-lg bg-gray-200">
				{author.imgUrl && (
					<img
						src={author.imgUrl}
						alt={author.displayName}
						className="h-12 w-12 shrink-0 rounded-l-lg"
					/>
				)}
			</div>

			<span className="w-full">
				<Link
					href={`/authors/${author.slug}`}
					target="_blank"
					className="font-medium hover:text-secondary"
					rel="noopener noreferrer"
				>
					{author.displayName}
				</Link>
			</span>

			<button
				type="button"
				data-testid="author-remove"
				className="rounded-full p-2 hover:bg-gray-50 hover:text-red-500"
				onClick={onRemove}
			>
				<XIcon className="h-3" />
			</button>
		</li>
	);
}
