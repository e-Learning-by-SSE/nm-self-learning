"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { EditorField } from "@self-learning/ui/forms";
import { useMemo, useState } from "react";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { ZodSchema } from "zod";
import { useTranslation } from "next-i18next";

export function JsonEditorDialog<T>({
	onClose,
	validationSchema
}: {
	validationSchema?: ZodSchema;
	onClose: (value: T | undefined) => void;
}) {
	const { getValues } = useFormContext();
	const [jsonValue, setJsonValue] = useState(JSON.stringify(getValues()));
	const [initialJsonValue] = useState(JSON.stringify(getValues()));
	const [error, setError] = useState<string | null>(null);
	const { t } = useTranslation("common");

	function handleOutsideClick(): (value: boolean) => void {
		return () => {
			if (initialJsonValue !== JSON.stringify(JSON.parse(jsonValue))) {
				window.confirm(`${t("Abort Changes")}?`);
			}
			onClose(undefined);
		};
	}

	function closeWithReturn() {
		try {
			const parsedJson = JSON.parse(jsonValue);

			if (validationSchema) {
				const validation = validationSchema.safeParse(parsedJson);

				if (!validation.success) {
					setError(validation.error.message);
					return;
				}
			}

			onClose(parsedJson);
		} catch (e) {
			setError("JSON-Format ist ungültig.");
		}
	}

	return (
		<Dialog open={true} onClose={handleOutsideClick()} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="flex min-h-full items-center justify-center">
					{/* The actual dialog panel  */}
					<DialogPanel className="mx-auto w-[50vw] rounded bg-white px-8 pb-8">
						<DialogTitle className="py-8 text-xl">{t("Edit as JSON")}</DialogTitle>

						{error && (
							<div className="mb-8 max-h-32 overflow-auto">
								<pre className="rounded-lg bg-c-danger-subtle p-4 pb-4 text-xs text-c-danger">
									{error}
								</pre>
							</div>
						)}

						<EditorField
							language="json"
							value={jsonValue}
							height="60vh"
							onChange={value => setJsonValue(value ?? "{}")}
						/>

						<div className="mt-8 flex gap-4 justify-end">
							<button
								type="button"
								className="btn-stroked w-fit"
								onClick={() => onClose(undefined)}
							>
								{t("Abort")}
							</button>

							<button
								type="button"
								className="btn-primary w-fit"
								onClick={closeWithReturn}
							>
								{t("save")}
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}

function useJsonEditor(form: UseFormReturn) {
	const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);

	return useMemo(() => {
		return {
			isJsonEditorOpen,
			openJsonEditor: () => setIsJsonEditorOpen(true),
			onCloseJsonEditor: (value?: unknown) => {
				if (value) {
					form.reset(value);
				}

				setIsJsonEditorOpen(false);
			}
		};
	}, [form, isJsonEditorOpen, setIsJsonEditorOpen]);
}

/**
 * Provides a `button` that opens the surrounding form in {@link JsonEditorDialog}.
 * Must be nested inside a `FormProvider` (react-hook-form).
 *
 * @example
 * const form = useForm();
 *
 * <FormProvider {...form}>
 *  	<JsonEditorButton />
 * </FormProvider>
 */
export function OpenAsJsonButton({
	validationSchema,
	form
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	form: UseFormReturn<any>;
	validationSchema?: ZodSchema;
}) {
	const { isJsonEditorOpen, openJsonEditor, onCloseJsonEditor } = useJsonEditor(form);
	const { t } = useTranslation("common");

	return (
		<button className="btn btn-tertiary" onClick={openJsonEditor}>
			<span className={"text-gray-600"}>{t("Edit as JSON")}</span>
			{isJsonEditorOpen && (
				<JsonEditorDialog onClose={onCloseJsonEditor} validationSchema={validationSchema} />
			)}
		</button>
	);
}
