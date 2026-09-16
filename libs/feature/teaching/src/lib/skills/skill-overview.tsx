"use client";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	IconOnlyButton,
	IconTextButton
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AuthorGuard, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export function ParentSkillOverview() {
	useRequiredSession();

	const [displayName, setDisplayName] = useState("");

	const { data: skillTrees, isLoading } = trpc.skill.getParentSkillsByAuthorId.useQuery();

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
					placeholder="Suche nach Skillkarten"
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
													href={`/skills/${id}`}
												>
													{name}
												</Link>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<RepositoryTaskbar skillId={id} />
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
											<span className="text-sm font-medium hover:text-c-primary">
												Keine Skillkarten vorhanden
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

function RepositoryTaskbar({ skillId }: { skillId: string }) {
	return (
		<div className="flex flex-row justify-end gap-4">
			<Link href={`/skills/${skillId}`}>
				<IconTextButton
					icon={<PencilIcon className="h-5 w-5" />}
					text={"Bearbeiten"}
					className="btn-stroked"
					title="bearbeiten"
				/>
			</Link>
			<RepositoryDeleteOption skillId={skillId} />
		</div>
	);
}

function RepositoryDeleteOption({ skillId }: { skillId: string }) {
	const { mutateAsync: deleteSkill } = trpc.skill.deleteSkills.useMutation();
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteSkill({ ids: [skillId] });
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
			<IconOnlyButton
				icon={<TrashIcon className="h-5 w-5" />}
				className="btn-danger"
				onClick={() => setShowConfirmation(true)}
				title={"Repository löschen"}
			/>
			{showConfirmation && (
				<Dialog title={"Löschen"} onClose={handleCancel}>
					Möchten Sie dieses Repository wirklich löschen?
					<DialogActions onClose={handleCancel}>
						<button className="btn-primary hover:bg-c-danger" onClick={handleConfirm}>
							Löschen
						</button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
