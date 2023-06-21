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
import { License} from "@self-learning/types";
import Link from "next/link";
import { LicenseViewModal } from "@self-learning/lesson";

export default function LicensesPage() {
	useRequiredSession();

    const [displayName, setDisplayName] = useState("");
	const { data: licenses, isLoading } = trpc.licenseRouter.getAll.useQuery();
	const [editTarget, setEditTarget] = useState<number | null>(null);
	const [createLicenseDialog, setCreateLicenseDialog] = useState(false);

	const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

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
	}

	function onCreateDialogClose(): void {
		setCreateLicenseDialog(false);
	}

    function onEdit(licenseId: number): void {
        setEditTarget(licenseId);
    }

	const toggleAccordion = (index: number) => {
		setActiveRowIndex(activeRowIndex === index ? null : index);
	  };


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
                       <CreateLicenseDialog onClose={onCreateDialogClose} licenseId={0} />
					)}
				</div>

				<SearchField
					placeholder="Suche nach Lizenz"
					onChange={e => {setDisplayName(e.target.value); setActiveRowIndex(null)}}
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
						{filteredLicenses.map(({licenseId, name, logoUrl}, index, value) => (
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
												<div className="text-sm font-medium hover:text-secondary" style={{cursor: "pointer"}} onClick={() => toggleAccordion(index)}>
													{name}
												</div>
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
								{activeRowIndex === index && (
									<AccordionElement license={{
											licenseId: licenseId,
											name: name,
											logoUrl: logoUrl,
											licenseText: value[index].licenseText,
											url: value[index].url,
											oerCompatible: value[index].oerCompatible,
											selectable: value[index].selectable,
											defaultSuggestion: value[index].defaultSuggestion
										}} 
										index={index}
										activeRowIndex={activeRowIndex}
									/>
								)}
							</Fragment>
						))}
					</Table>
				)}
			</CenteredSection>
		</AdminGuard>
	);
}

export function AccordionElement({ license ,index , activeRowIndex }: { license: License, index: number, activeRowIndex: number }) {

	const [viewLicenseDialog, setViewLicenseDialog] = useState(false);

	return(
		<tr className="border-b border-gray-300">
			<TableDataColumn>
			<button className="btn-primary btn-small" onClick={() => {setViewLicenseDialog(true)}}>
						<span>Preview</span>
					</button>
			</TableDataColumn>
			<td colSpan={5} className="py-2 px-3">
				<div
					className={`px-6 pt-0 overflow-hidden transition-[max-height] duration-500 ease-in ${
					activeRowIndex === index ? 'max-h-36' : 'max-h-0'
					}`}>
					<LicenseDetail license={license} />
					{viewLicenseDialog && (
						<LicenseViewModal 
							description={license.licenseText ?? ""}
							name={license.name}
							logoUrl={license.logoUrl ?? ""}
							onClose={() => setViewLicenseDialog(false)} 
						></LicenseViewModal>
					)}
				</div>
			</td>
		</tr>
	);

}

export function LicenseDetail({ license }: { license: License }) {

	const [viewLicenseDialog, setViewLicenseDialog] = useState(false);
	

	function shortenLongText(url: string): string {
		if (url.length > 20) {
			return url.slice(0, 20) + "...";
		}
		return url;
	}

	return(
		<div className="grid grid-cols-2 gap-4">
			<div className="col-span-1">
				<div className="text-sm font-medium">Url der Lizenzwebseite:</div>
				<div className="text-sm font-medium">Lizenzbeschreibung:</div>
				<div className="text-sm font-medium">Auswählbar</div>
				<div className="text-sm font-medium">OER - Kompatible:</div>
			</div>
			<div className="col-span-1">
				{license.url ? (
					<Link
						className="text-sm font-medium hover:text-secondary"
						href={license.url}
					>
						{shortenLongText(license.url)}
					</Link>
				):
					<div className="text-sm font-medium">Nicht definiert</div>
				}
				{license.licenseText ? (
					<div className="text-sm font-medium hover:text-secondary" style={{cursor: "pointer"}} onClick={() => setViewLicenseDialog(true)}>
						{shortenLongText(license.licenseText)}
					</div>
				):
					<div className="text-sm font-medium">Nicht definiert</div>
				}
				<div className="text-sm font-medium">{ license.selectable ? "Ja" : "Nein" }</div>
				<div className="text-sm font-medium">{ license.oerCompatible ? "Ja" : "Nein" }</div>
			</div>
			{viewLicenseDialog && (
				<LicenseViewModal 
					description={license.licenseText ?? ""}
					name={license.name}
					logoUrl={license.logoUrl ?? ""}
				 	onClose={() => setViewLicenseDialog(false)} 
					></LicenseViewModal>
				)}
		</div>

	);
}
