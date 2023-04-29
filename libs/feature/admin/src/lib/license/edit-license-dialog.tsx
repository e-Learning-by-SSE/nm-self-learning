import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import {  License, licenseSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { LabeledField} from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";



export function CreateLicenseDialog({
    licenseId,
    onClose
}: {
    licenseId: number | null,
    onClose: OnDialogCloseFn<License>;
}) {
    const { mutateAsync: createLicense } =  trpc.licenseRouter.createAsAdmin.useMutation();

    async function onSubmit(license: License) {
        try {
            const result = await createLicense({license: license});
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
                subtitle: "Das Erstellen der Lizenz ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
            });
        }
    }

    return (
        <LicenseModal licenseId={licenseId} onSubmit={onSubmit} onClose={onClose} />
    );


}

export function EditLicenseDialog({
    licenseId,
    onClose
}: {
    licenseId: number,
    onClose: OnDialogCloseFn<License>;
}) {
    const { mutateAsync: updateLicense } =  trpc.licenseRouter.updateAsAdmin.useMutation();

    async function onSubmit(license: License) {
        try {
            const result = await updateLicense({license: license, licenseId: licenseId});
            showToast({
                type: "success",
                title: "Lizenz gespeichert!",
                subtitle: result.name
            });
            onClose(result);
        } catch (err) {
            showToast({
                type: "error",
                title: "Lizenz konnte nicht gespeichdert werden!",
                subtitle: "Das Speichern der Lizenz ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
            });
        }
       

    }

    return (
        <LicenseModal licenseId={licenseId} onSubmit={onSubmit} onClose={onClose} />
    );

}



function LicenseModal({
    licenseId,
    onSubmit,
    onClose
}: {
    licenseId: number | null,
    onSubmit: (license: License) => void,
    onClose: OnDialogCloseFn<License>;
}) {
    const { data: license, isLoading } = getLicenseOrDefault(licenseId);

    return (
		<Dialog onClose={() => onClose(undefined)} title={licenseId === null ? "Neue Lizenz" : license?.name ?? "Neue Lizenz"}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{license && (
						<LicenseForm
							onClose={onClose}
                            initialLicense={license}
                            onSubmit={onSubmit}
						/>
					)}
				</>
			)}
		</Dialog>
	);


}

function LicenseForm({
	initialLicense,
    onSubmit,
	onClose
}: {
	initialLicense: License,
    onSubmit: (license: License) => void,
	onClose: OnDialogCloseFn<License>,
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

	const errors = formState.errors;

	return (
		<section className="flex flex-col rounded-lg border border-light-border p-4">
			<h2 className="mb-4 text-2xl">Daten</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.name?.message}>
					<input className="textfield" type={"text"} {...register("name")} />
				</LabeledField>
				<LabeledField label="Lizenz Url" error={errors.licenseUrl?.message}>
					<input className="textfield" type={"text"} {...register("licenseUrl")} />
				</LabeledField>
                <LabeledField label="Lizenz ImageUrl" error={errors.imgUrl?.message}>
					<input className="textfield" type={"text"} {...register("imgUrl")} />
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
                                onChange={() => {setValue("selectable", !selectable)}}
                            />
                            <label
                                htmlFor={"selectable"}
                                className="text-sm font-semibold"
                            >
                                Auswählbar
                            </label>
                        </span>
                        <span className="flex items-center gap-2">
                            <input
                                id={"oercompatible"}
                                type={"checkbox"}
                                className="checkbox"
                                checked={oercompatible}
                                onChange={() => {setValue("oerCompatible", !oercompatible)}}
                            />
                            <label
                                htmlFor={"oercompatible"}
                                className="text-sm font-semibold"
                            >
                                OER-kompatibel
                            </label>
                        </span>
                    </div>
				</LabeledField>
			</div>
		</section>
	);
}

function getLicenseOrDefault(licenseId: number | null) {
    if(licenseId === null) {
        return ({
            isLoading: false,
            data: {
                licenseId: 0,
                name: "",
                licenseUrl: "",
                imgUrl: "",
                licenseText: "",
                selectable: true,
                oerCompatible: false,
            } as License
        });
    } else {
        const data = trpc.licenseRouter.getOne.useQuery({licenseId: licenseId})
        return {
            isLoading: data.isLoading,
            data: {
                licenseId: data.data?.licenseId ?? 0,
                name: data.data?.name ?? "",
                licenseUrl: data.data?.url ?? "",
                imgUrl: data.data?.logoUrl ?? "",
                licenseText: data.data?.licenseText ?? "",
                selectable: data.data?.selectable ?? true,
                oerCompatible: data.data?.oerCompatible ?? false,
            }
        }
    }
}


