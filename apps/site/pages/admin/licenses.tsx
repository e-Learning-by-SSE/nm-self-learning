import { PlusIcon } from "@heroicons/react/solid";
import { CreateLicenseDialog, EditLicenseDialog } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useMemo, useState } from "react";

export default function LicensesPage() {
	useRequiredSession();

    const [displayName, setDisplayName] = useState("");
	const { data: licenses, isLoading } = trpc.licenseRouter.getAll.useQuery();
	const [editTarget, setEditTarget] = useState<number | null>(null);
	const [createLicenseDialog, setCreateLicenseDialog] = useState(false);

    const filteredLicenses = useMemo(() => {
		if (!licenses) return [];
		if (!displayName || displayName.length === 0) return licenses;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return licenses.filter(license =>
			license.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, licenses]);


	function onEditDialogClose(): void {
		setEditTarget(null);
        setCreateLicenseDialog(false);
	}

    function onEdit(licenseId: number): void {
        setEditTarget(licenseId);
    }


	return (
		<AdminGuard>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">Lizenzen</h1>
					<button className="btn-primary" onClick={() => setCreateLicenseDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Lizenz hinzufügen</span>
					</button>
					{createLicenseDialog && (
                       <CreateLicenseDialog onClose={onEditDialogClose} licenseId={editTarget} />
					)}
				</div>

				<SearchField
					placeholder="Suche nach Lizenz"
					onChange={e => setDisplayName(e.target.value)}
				/>

				{editTarget && (
					<EditLicenseDialog onClose={onEditDialogClose} licenseId={editTarget} />
				)}

				{isLoading ? (
					<LoadingBox />
				) : (
					<Table
						head={
							<>
								<TableHeaderColumn></TableHeaderColumn>
								<TableHeaderColumn>Name</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{filteredLicenses.map(({licenseId, name, logoUrl }) => (
							<Fragment key={name}>
								{name && (
									<tr key={name}>
										<TableDataColumn>
											<ImageOrPlaceholder
												src={logoUrl ?? undefined}
												className="m-0 h-10 w-10 rounded-lg object-cover"
											/>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap gap-4">
													{name}
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="btn-stroked"
													onClick={() => onEdit(licenseId)}
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
		</AdminGuard>
	);
}
