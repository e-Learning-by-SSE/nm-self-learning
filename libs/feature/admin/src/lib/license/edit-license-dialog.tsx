import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { License, licenseSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

export function CreateLicenseDialog({ onClose }: { onClose: OnDialogCloseFn<License> }) {
	const { mutateAsync: createLicense } = trpc.licenseRouter.createAsAdmin.useMutation();

	async function onSubmit(license: License) {
		try {
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
		<LicenseModal
			license={{
				licenseId: 0,
				name: "",
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
		licenseId: licenseId
	});

	async function onSubmit(license: License) {
		try {
			const result = await updateLicense({ license: license, licenseId: licenseId });
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
	const [licenseFound, setLicenseFound] = useState<boolean | null>(null);

	useEffect(() => {
		if (!isLoading) {
			setLicenseFound(!!license);
			if (!license) {
				showToast({
					type: "error",
					title: "Lizenz nicht gefunden!",
					subtitle: "Die Lizenz konnte nicht gefunden werden. Erstellen Sie eine neue."
				});
			}
		}
	}, [isLoading, license]);

	if (isLoading) {
		return <LoadingBox />;
	} else if (licenseFound && license) {
		return <LicenseModal license={license} onSubmit={onSubmit} onClose={onClose} />;
	} else {
		return <CreateLicenseDialog onClose={onClose} />;
	}
}

function LicenseModal({
	license,
	onSubmit,
	onClose
}: {
	license: License;
	onSubmit: (license: License) => void;
	onClose: OnDialogCloseFn<License>;
}) {
	return (
		<Dialog onClose={() => onClose(undefined)} title={license?.name ?? "Neue Lizenz"}>
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
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="absolute top-8 right-8">
					<OpenAsJsonButton form={form} validationSchema={licenseSchema} />
				</div>

				<LicenseData />

				<DialogActions onClose={onClose}>
					<button className="btn-primary" type="submit">
						Speichern
					</button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}

function LicenseData() {
	const { register, control, formState, setValue } = useFormContext<License>();
	const selectable = useWatch({ control: control, name: "selectable" });
	const oercompatible = useWatch({ control: control, name: "oerCompatible" });
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
						</span>
						<span className="flex items-center gap-2">
							<input
								id={"oercompatible"}
								type={"checkbox"}
								className="checkbox"
								checked={oercompatible}
								onChange={() => {
									setValue("oerCompatible", !oercompatible);
								}}
							/>
							<label htmlFor={"oercompatible"} className="text-sm font-semibold">
								OER-kompatibel
							</label>
						</span>
						<span className="flex items-center gap-2">
							<input
								id={"defaultsuggestion"}
								type={"checkbox"}
								className="checkbox"
								checked={defaultSuggestion}
								onChange={() => {
									setValue("defaultSuggestion", !defaultSuggestion);
								}}
							/>
							<label htmlFor={"defaultsuggestion"} className="text-sm font-semibold">
								Default - Suggestion
							</label>
						</span>
					</div>
				</LabeledField>
			</div>
		</section>
	);
}
