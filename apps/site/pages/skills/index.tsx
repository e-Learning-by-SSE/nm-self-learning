import { PlusIcon } from "@heroicons/react/solid";
import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useState, useMemo} from "react";
import Link  from "next/link";
import { trpc } from "@self-learning/api-client";





export default function SkillPage() {
    useRequiredSession();

    const [displayName, setDisplayName] = useState("");

    
    const { data: skillTrees, isLoading } =  trpc.skill.getRepsFromUser.useQuery();



    const filteredSkillTrees = useMemo(() => {
		if (!skillTrees) return [];
		if (!displayName || displayName.length === 0) return skillTrees;
		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillTrees.filter(skillTree =>
			skillTree.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, skillTrees]);





    return (
        <AdminGuard>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">SkillTrees</h1>
					<Link href="skills/create/new" className="btn-primary">
						<PlusIcon className="icon h-5" />
						<span>Skilltree anlegen</span>
					</Link>
				</div>

				<SearchField
					placeholder="Suche nach Skill-Trees"
					onChange={e => {setDisplayName(e.target.value)}}
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
						{filteredSkillTrees.map(({name, id}) => (
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
													onClick={() => {/* new function */}}
												>
													Editieren
												</button>
											</div>
										</TableDataColumn>
									</tr>
								)}
							</Fragment>
						))}
					</Table>
				)}
			</CenteredSection>
		</AdminGuard>);

}