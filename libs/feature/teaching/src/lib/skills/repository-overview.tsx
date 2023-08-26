import { LoadingBox, Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AuthorGuard, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";

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
													href={`/skills/create/${id}`}
												>
													{name}
												</Link>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="btn-stroked"
													onClick={() => {
														/* new function */
													}}
												>
													Editieren
												</button>
											</div>
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
