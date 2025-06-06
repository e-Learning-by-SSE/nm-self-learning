"use client";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AuthorGuard, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export function SkillRepositoryOverview() {
	useRequiredSession();

	const [displayName, setDisplayName] = useState("");

	const { data: skillTrees, isLoading } = trpc.skill.getRepositoriesByUser.useQuery();

	const filteredSkillTrees = useMemo(() => {
		if (!skillTrees) return [];
		if (!displayName || displayName.length === 0) return skillTrees;
		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillTrees.filter(skillTree =>
			skillTree.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, skillTrees]);

	return (
		<AuthorGuard>
			<div className="flex min-h-[300px] flex-col">
				<SearchField
					placeholder="Suche nach Skill-Trees"
					onChange={e => {
						setDisplayName(e.target.value);
					}}
				/>

				{isLoading ? (
					<LoadingBox />
				) : (
					<Table
						head={
							<>
								<TableHeaderColumn>Name</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{filteredSkillTrees.map(({ name, id }) => (
							<Fragment key={name}>
								{name && (
									<tr key={name}>
										<TableDataColumn>
											<div className="flex flex-wrap gap-4">
												<Link
													className="text-sm font-medium hover:text-secondary"
													href={`/skills/repository/${id}`}
												>
													{name}
												</Link>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<RepositoryTaskbar repositoryId={id} />
										</TableDataColumn>
									</tr>
								)}
							</Fragment>
						))}
						{filteredSkillTrees.length === 0 && (
							<Fragment key={"no_data_there:default"}>
								<tr key={"default:table"}>
									<TableDataColumn>
										<div className="flex flex-wrap gap-4">
											<span className="text-sm font-medium hover:text-secondary">
												Keine Skill Repositories vorhanden
											</span>
										</div>
									</TableDataColumn>
									<TableDataColumn>
										<div className="flex flex-wrap justify-end gap-4" />
									</TableDataColumn>
								</tr>
							</Fragment>
						)}
					</Table>
				)}
			</div>
		</AuthorGuard>
	);
}

function RepositoryTaskbar({ repositoryId }: { repositoryId: string }) {
	return (
		<div className="flex flex-row justify-end gap-4">
			<Link href={`/skills/repository/${repositoryId}`}>
				<button
					type="button"
					className="lg:flex rounded-lg lg:border lg:place-content-center lg:items-center border-gray-200 bg-white lg:w-fit lg:self-end p-2 lg:px-8 lg:py-2"
				>
					<PencilIcon className="icon" />
					<span className="hidden lg:inline">Bearbeiten</span>
				</button>
			</Link>
			<RepositoryDeleteOption repositoryId={repositoryId} />
		</div>
	);
}

function RepositoryDeleteOption({ repositoryId }: { repositoryId: string }) {
	const { mutateAsync: deleteRepo } = trpc.skill.deleteRepository.useMutation();
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteRepo({ id: repositoryId });
	};

	const handleConfirm = () => {
		handleDelete();
		setShowConfirmation(false);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};

	return (
		<>
			<button
				className="rounded bg-red-500 font-medium text-white hover:bg-red-600"
				onClick={() => setShowConfirmation(true)}
			>
				<div className="ml-4">
					<TrashIcon className="icon " />
				</div>
			</button>
			{showConfirmation && (
				<Dialog title={"Löschen"} onClose={handleCancel}>
					Möchten Sie dieses Repository wirklich löschen?
					<DialogActions onClose={handleCancel}>
						<button className="btn-primary hover:bg-red-500" onClick={handleConfirm}>
							Löschen
						</button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
