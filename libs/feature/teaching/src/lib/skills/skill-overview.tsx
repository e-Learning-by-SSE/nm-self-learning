"use client";
import { useTranslation } from "next-i18next";

import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	IconTextButton
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AuthorGuard, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";
import { PencilIcon } from "@heroicons/react/24/solid";
import { SkillDeleteButton } from "./skill-row-delete-button";

export function ParentSkillOverview() {
	const { t } = useTranslation(["feature-teaching", "common"]);
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
					placeholder={t("Skills_Search_Repositories")}
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
								<TableHeaderColumn>{t("common:Name")}</TableHeaderColumn>
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
												{t("Skills_Empty_Repositories")}
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
	const { t } = useTranslation(["feature-teaching", "common"]);
	return (
		<div className="flex flex-row justify-end gap-4">
			<Link href={`/skills/${skillId}`}>
				<IconTextButton
					icon={<PencilIcon className="h-5 w-5" />}
					text={t("common:edit")}
					className="btn-stroked"
					title={t("common:edit")}
				/>
			</Link>
			<SkillDeleteButton skillId={skillId} variant="default" />
		</div>
	);
}
