import { PlusIcon } from "@heroicons/react/24/solid";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { TRPCClientError } from "@trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import { AddAuthorDialog, AuthorFromGetAllQuery } from "../author/add-author-dialog";

type AuthorSpecializationMap = {
	[specializationId: string]: {
		[username: string]: boolean;
	};
};

type SpecializationsFromQuery =
	inferRouterOutputs<AppRouter>["subject"]["getForEdit"]["specializations"];

export function SpecializationPermissionsDialog({
	subjectId,
	onClose,
	specializations
}: {
	subjectId: string;
	specializations: SpecializationsFromQuery;
	onClose: () => void;
}) {
	const [authors, setAuthors] = useState(() => {
		const initialAuthors = specializations
			.flatMap(a => a.specializationAdmin)
			.map(a => a.author);

		const map = new Map<
			string,
			SpecializationsFromQuery[0]["specializationAdmin"][0]["author"]
		>();

		for (const author of initialAuthors) {
			map.set(author.username, author);
		}

		return Array.from(map.values());
	});

	const [specMap, setSpecMap] = useState<AuthorSpecializationMap>(() => {
		const _specMapp: AuthorSpecializationMap = {};

		for (const spec of specializations) {
			const usernames: Record<string, boolean> = {};
			for (const admin of spec.specializationAdmin) {
				usernames[admin.author.username] = true;
			}
			_specMapp[spec.specializationId] = usernames;
		}

		return _specMapp;
	});

	const [openAddAuthorDialog, setOpenAddAuthorDialog] = useState(false);

	const { mutateAsync: updateSpecAdmins } =
		trpc.subject.setSpecializationPermissions.useMutation();

	function handleAddAuthor(author: AuthorFromGetAllQuery | null | undefined): void {
		setOpenAddAuthorDialog(false);
		if (!author) return;

		if (authors.some(a => a.username === author.username)) {
			showToast({
				type: "warning",
				title: "Bereits vorhanden",
				subtitle: author.displayName
			});
			return;
		}

		setAuthors(prev => [author, ...prev]);
	}

	function onChecked(specId: string, username: string, checked: boolean) {
		setSpecMap(prev => ({
			...prev,
			[specId]: {
				...prev[specId],
				[username]: checked
			}
		}));
	}

	async function onSave() {
		try {
			await updateSpecAdmins({ subjectId, specMap });
			showToast({ type: "success", title: "Berechtigte Autoren aktualisiert", subtitle: "" });
			onClose();
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	}

	return (
		<Dialog
			onClose={onClose}
			title="Berechtigte Autoren"
			style={{ maxWidth: "80vw", maxHeight: "80vh" }}
		>
			<div className="flex flex-col gap-4 divide-x divide-light-border overflow-auto">
				<div className="text-sm text-light">
					<p>
						In diesem Dialog können Autoren <strong>Spezialisierungen</strong>{" "}
						zugeordnet werden. Nur Autoren, die einer Spezialisierung zugeordnet sind,
						können diese bearbeiten.
					</p>
					<p>
						Admins und Fachbereich-Admins können ebenfalls Spezialisierungen bearbeiten
					</p>
					<p>
						In der folgenden Tabelle sind alle Autoren aufgelistet, die mindestens einer
						Spezialisierung zugeordnet sind. Weitere Autoren können durch den{" "}
						<strong>Autor hinzufügen</strong>-Button hinzugefügt werden.
					</p>
				</div>

				<button
					type="button"
					className="btn-primary w-fit"
					onClick={() => setOpenAddAuthorDialog(true)}
				>
					<PlusIcon className="icon h-5" />
					<span>Autor hinzufügen</span>
				</button>

				{openAddAuthorDialog && (
					<AddAuthorDialog
						open={openAddAuthorDialog}
						onAuthorSelected={handleAddAuthor}
					/>
				)}

				<Table
					head={
						<>
							<TableHeaderColumn>Autor</TableHeaderColumn>
							{specializations.map(spec => (
								<TableHeaderColumn key={spec.specializationId}>
									{spec.title}
								</TableHeaderColumn>
							))}
						</>
					}
				>
					{authors.map(author => (
						<tr key={author.username}>
							<TableDataColumn>
								<span className="flex items-center gap-4">
									<ImageOrPlaceholder
										src={author.imgUrl ?? undefined}
										className="h-10 w-10 shrink-0 rounded-lg object-cover"
									/>
									<a
										target="_blank"
										rel="noreferrer"
										href={`/authors/${author.slug}`}
										className="whitespace-nowrap hover:text-secondary"
									>
										{author.displayName}
									</a>
								</span>
							</TableDataColumn>
							{specializations.map(spec => (
								<TableDataColumn key={spec.specializationId}>
									<span className="flex justify-center">
										<input
											type={"checkbox"}
											className="checkbox"
											checked={
												specMap[spec.specializationId][author.username]
											}
											onChange={e => {
												onChecked(
													spec.specializationId,
													author.username,
													e.target.checked
												);
											}}
										/>
									</span>
								</TableDataColumn>
							))}
						</tr>
					))}
				</Table>
			</div>

			<DialogActions onClose={onClose}>
				<button type="button" className="btn-primary" onClick={onSave}>
					Speichern
				</button>
			</DialogActions>
		</Dialog>
	);
}
