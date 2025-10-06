"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { License, licenseSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LicenseViewModal,
	LoadingBox,
	OnDialogCloseFn,
	QuestionMarkTooltip,
	showToast
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

export function CreateLicenseDialog({ onClose }: { onClose: OnDialogCloseFn<License> }) {
	const { mutateAsync: createLicense } = trpc.licenseRouter.createAsAdmin.useMutation();

	async function onSubmit(license: License) {
		try {
			console.log(license);
			const result = await createLicense({ license: license });
			showToast({
				type: "success",
				title: "Lizenz erstellt!",
				subtitle: result.name
			});
			onClose(result);
		} catch (err) {
			showToast({
				type: "error",
				title: "Lizenz konnte nicht erstellt werden!",
				subtitle:
					"Das Erstellen der Lizenz ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
			});
		}
	}

	return (
		<LicenseFormModal
			license={{
				licenseId: 0,
				name: "Neue Lizenz",
				url: "",
				logoUrl: "",
				licenseText: "",
				selectable: true,
				oerCompatible: false,
				defaultSuggestion: false
			}}
			onSubmit={onSubmit}
			onClose={onClose}
		/>
	);
}

export function EditLicenseDialog({
	licenseId,
	onClose
}: {
	licenseId: number;
	onClose: OnDialogCloseFn<License>;
}) {
	const { mutateAsync: updateLicense } = trpc.licenseRouter.updateAsAdmin.useMutation();
	const { data: license, isLoading } = trpc.licenseRouter.getOne.useQuery({
		licenseId
	});

	async function onSubmit(license: License) {
		try {
			const result = await updateLicense({ license, licenseId });
			showToast({
				type: "success",
				title: "Lizenz gespeichert!",
				subtitle: result.name
			});
			onClose(result);
		} catch (err) {
			showToast({
				type: "error",
				title: "Lizenz konnte nicht gespeichert werden!",
				subtitle:
					"Das Speichern der Lizenz ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
			});
		}
	}

	if (isLoading) {
		return <LoadingBox />;
	} else if (license) {
		return <LicenseFormModal license={license} onSubmit={onSubmit} onClose={onClose} />;
	} else {
		showToast({
			type: "error",
			title: "Lizenz nicht gefunden!",
			subtitle: "Die Lizenz konnte nicht gefunden werden. Erstellen Sie eine neue."
		});
		return null;
	}
}

function LicenseFormModal({
	license,
	onSubmit,
	onClose
}: {
	license: License;
	onSubmit: (license: License) => void;
	onClose: OnDialogCloseFn<License>;
}) {
	return (
		<Dialog
			style={{ height: "80vh", width: "60vw", overflow: "auto" }}
			onClose={() => onClose(undefined)}
			title={license?.name ?? "Neue Lizenz"}
		>
			{license && (
				<LicenseForm onClose={onClose} initialLicense={license} onSubmit={onSubmit} />
			)}
		</Dialog>
	);
}

function LicenseForm({
	initialLicense,
	onSubmit,
	onClose
}: {
	initialLicense: License;
	onSubmit: (license: License) => void;
	onClose: OnDialogCloseFn<License>;
}) {
	const form = useForm({
		resolver: zodResolver(licenseSchema),
		defaultValues: initialLicense
	});

	return (
		<FormProvider {...form}>
			<form
				className="m flex flex-col justify-between"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="absolute top-8 right-8 flex">
					<LicensePreviewModal />
					<OpenAsJsonButton form={form} validationSchema={licenseSchema} />
				</div>

				<LicenseDataEditSection />

				<DialogActions onClose={onClose}>
					<button className="btn-primary" type="submit">
						Speichern
					</button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}

function LicensePreviewModal() {
	const [viewLicenseDialog, setViewLicenseDialog] = useState(false);
	const { watch } = useFormContext<License>();
	const formData = watch();

	return (
		<>
			<button
				type="button"
				className="btn-stroked rounded"
				onClick={() => setViewLicenseDialog(true)}
			>
				<span>Vorschau</span>
			</button>
			{viewLicenseDialog && (
				<LicenseViewModal
					description={formData.licenseText ?? ""}
					name={formData.name ?? ""}
					logoUrl={formData.logoUrl ?? ""}
					onClose={() => setViewLicenseDialog(false)}
				/>
			)}
		</>
	);
}

function LicenseDataEditSection() {
	const { register, control, formState, setValue } = useFormContext<License>();
	const selectable = useWatch({ control: control, name: "selectable" });
	const oerCompatible = useWatch({ control: control, name: "oerCompatible" });
	const defaultSuggestion = useWatch({ control: control, name: "defaultSuggestion" });

	const errors = formState.errors;

	return (
		<section className="flex flex-col rounded-lg border border-light-border p-4">
			<h2 className="mb-4 text-2xl">Daten</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.name?.message}>
					<input className="textfield" type={"text"} {...register("name")} />
				</LabeledField>
				<LabeledField label="Lizenz Url" error={errors.url?.message}>
					<input className="textfield" type={"text"} {...register("url")} />
				</LabeledField>
				<LabeledField label="Lizenz ImageUrl" error={errors.logoUrl?.message}>
					<input className="textfield" type={"text"} {...register("logoUrl")} />
				</LabeledField>
				<LabeledField label="Lizenz Text" error={errors.licenseText?.message}>
					<textarea className="textfield" {...register("licenseText")} />
				</LabeledField>
				<LabeledField label="Optionen" error={errors.licenseText?.message}>
					<div className="flex flex-col">
						<span className="flex items-center gap-2">
							<input
								id={"selectable"}
								type={"checkbox"}
								className="checkbox"
								checked={selectable}
								onChange={() => {
									setValue("selectable", !selectable);
								}}
							/>
							<label htmlFor={"selectable"} className="text-sm font-semibold">
								Auswählbar
							</label>
							<QuestionMarkTooltip content="Entscheidet ob die Lizenz für neue Lerneinheiten ausgewählt werden kann. Bestehende Zuordnungen bleiben bestehen" />
						</span>
						<span className="flex items-center gap-2">
							<input
								id={"oerCompatible"}
								type={"checkbox"}
								className="checkbox"
								checked={oerCompatible}
								onChange={() => {
									setValue("oerCompatible", !oerCompatible);
								}}
							/>
							<label htmlFor={"oerCompatible"} className="text-sm font-semibold">
								Export erlaubt
							</label>
							<QuestionMarkTooltip content="Entscheidet ob die LiaScript-Exportfunktion bei Lerneinheiten mit dieser Lizenz verwendet werden kann." />
						</span>
						<span className="flex items-center gap-2">
							<input
								id={"defaultSuggestion"}
								type={"checkbox"}
								className="checkbox"
								checked={defaultSuggestion}
								onChange={() => {
									setValue("defaultSuggestion", !defaultSuggestion);
								}}
							/>
							<label htmlFor={"defaultSuggestion"} className="text-sm font-semibold">
								Standardlizenz
							</label>
							<QuestionMarkTooltip content="Eine Standardlizenz wird für alle neuen Lerneinheiten vorgeschlagen. Alle Lerneinheiten ohne zugeordnete Lizenz erhalten ebenfalls die Standardlizenz. Es kann nur eine Standardlizenz geben." />
						</span>
					</div>
				</LabeledField>
			</div>
		</section>
	);
}
