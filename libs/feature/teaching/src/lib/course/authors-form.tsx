import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import { PlusIcon, SearchIcon, XIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { IconButton, OnDialogCloseFn, SectionHeader } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
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
		<CenteredContainer>
			<SectionHeader title="Autoren" subtitle="Die Autoren dieses Kurses." />

			<IconButton
				type="button"
				data-testid="author-add"
				onClick={() => setOpenAddDialog(true)}
				title="Hinzufügen"
				text="Hinzufügen"
				icon={<PlusIcon className="h-5" />}
			/>

			{authors.length === 0 ? (
				<p className="mt-8 text-sm text-light">
					Für diesen Kurs sind noch keine Autoren hinterlegt.
				</p>
			) : (
				<ul className="mt-8 flex flex-wrap gap-4">
					{authors.map(({ slug }, index) => (
						<Author key={slug} slug={slug} onRemove={() => handleRemove(index)} />
					))}
				</ul>
			)}

			{openAddDialog && <AddAuthorDialog open={openAddDialog} onClose={handleAdd} />}
		</CenteredContainer>
	);
}

function Author({ slug, onRemove }: { slug: string; onRemove: () => void }) {
	const { data: author } = trpc.author.getBySlug.useQuery({ slug });

	if (!author) {
		return <li className="rounded-lg border border-light-border p-2">Loading...</li>;
	}

	return (
		<li
			className="flex items-center gap-2 rounded-lg border border-light-border bg-white pr-2 text-sm"
			data-testid="author"
		>
			<div className="h-12 w-12 rounded-l-lg bg-gray-100">
				{author.imgUrl && (
					<img
						src={author.imgUrl}
						alt={author.displayName}
						className="h-12 w-12 rounded-l-lg"
					/>
				)}
			</div>

			<Link href={`/authors/${author.slug}`}>
				<a
					target="_blank"
					className="font-medium hover:text-secondary"
					rel="noopener noreferrer"
				>
					{author.displayName}
				</a>
			</Link>

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

function AddAuthorDialog({
	onClose,
	open
}: {
	open: boolean;
	onClose: OnDialogCloseFn<CourseFormModel["authors"][0]>;
}) {
	const { data: _authors } = trpc.author.getAll.useQuery();
	const [filter, setFilter] = useState("");

	const filteredAuthors = useMemo(() => {
		if (!_authors) return [];

		if (!filter || filter === "") {
			return _authors;
		}

		const lcFilter = filter.toLowerCase();
		return _authors.filter(author => author.displayName.toLowerCase().includes(lcFilter));
	}, [_authors, filter]);

	return (
		<HeadlessDialog open={open} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full translate-y-1/4 justify-center">
					{/* The actual dialog panel  */}
					<HeadlessDialog.Panel
						className="mx-auto flex h-fit w-[90vw] flex-col overflow-hidden rounded-lg bg-white lg:w-[800px]"
						style={{ maxHeight: "624px" }}
					>
						<Combobox value={null} onChange={onClose}>
							<span className="flex items-center border-b border-b-light-border py-1 px-3">
								<SearchIcon className="h-6 text-light" />
								<Combobox.Input
									className="w-full border-none focus:ring-0"
									placeholder="Suche nach Autor"
									onChange={e => setFilter(e.target.value)}
								/>
							</span>
							<div className="divide-border-light playlist-scroll mt-8 flex flex-col divide-y overflow-auto">
								<Combobox.Options className="flex flex-col divide-y divide-light-border">
									{filteredAuthors.map(author => (
										<Combobox.Option
											value={author}
											key={author.slug}
											as={Fragment}
										>
											{({ active }) => (
												<button
													type="button"
													data-testid="author-option"
													className={`flex items-center gap-4 rounded px-4 py-2 ${
														active ? "bg-secondary text-white" : ""
													}`}
												>
													<div className="h-12 w-12 rounded-lg bg-gray-100">
														{author.imgUrl && (
															<img
																src={author.imgUrl}
																alt={author.displayName}
																className="h-12 w-12 rounded-lg"
															/>
														)}
													</div>
													<div className="flex flex-col">
														<span className="text-sm font-medium">
															{author.displayName}
														</span>
														<span
															className={`text-start text-xs ${
																active ? "text-white" : "text-light"
															}`}
														>
															{author.slug}
														</span>
													</div>
												</button>
											)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							</div>
						</Combobox>
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}
