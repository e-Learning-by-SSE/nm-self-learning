import { PlusIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { IconButton, ImageChip, OnDialogCloseFn } from "@self-learning/ui/common";
import { Form } from "@self-learning/ui/forms";
import Link from "next/link";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CourseFormModel } from "../course/course-form-model";
import { AddAuthorDialog } from "./add-author-dialog";

export function AuthorsForm({ subtitle, emptyString }: { subtitle: string; emptyString: string }) {
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
			if (authors.find(a => a.username === result.username)) {
				console.log(`Author ${result.username} is already added.`);
				return;
			}

			append({ username: result.username });
		}
		setOpenAddDialog(false);
	};

	function handleRemove(index: number) {
		window.confirm("Autor entfernen?") && remove(index);
	}

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Autoren" subtitle={subtitle}>
				<IconButton
					type="button"
					data-testid="author-add"
					onClick={() => setOpenAddDialog(true)}
					title="Hinzufügen"
					text="Hinzufügen"
					icon={<PlusIcon className="h-5" />}
				/>
			</Form.SidebarSectionTitle>

			{authors.length === 0 ? (
				<p className="text-sm text-light">{emptyString}</p>
			) : (
				<ul className="grid gap-4">
					{authors.map(({ username }, index) => (
						<Author
							key={username}
							username={username}
							onRemove={() => handleRemove(index)}
						/>
					))}
				</ul>
			)}

			{openAddDialog && <AddAuthorDialog open={openAddDialog} onClose={handleAdd} />}
		</Form.SidebarSection>
	);
}

function Author({ username, onRemove }: { username: string; onRemove: () => void }) {
	const { data: author } = trpc.author.getByUsername.useQuery({ username });

	if (!author) {
		return <li className="rounded-lg border border-light-border bg-white p-2">Loading...</li>;
	}

	return (
		<ImageChip imgUrl={author.imgUrl} onRemove={onRemove}>
			<Link
				href={`/authors/${author.slug}`}
				target="_blank"
				className="font-medium hover:text-secondary"
				rel="noopener noreferrer"
			>
				{author.displayName}
			</Link>
		</ImageChip>
	);
}
