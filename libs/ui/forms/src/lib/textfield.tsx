import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { slugify } from "@self-learning/util/common";
import { LabeledField } from "./labeled-field";

export function Textfield(props: JSX.IntrinsicElements["input"] & { label: string }) {
	return (
		<LabeledField label={props.label}>
			<input className="textfield" {...props} />
		</LabeledField>
	);
}

export function TextArea(props: JSX.IntrinsicElements["textarea"] & { label: string }) {
	return (
		<LabeledField label={props.label}>
			<textarea className="textfield" {...props}></textarea>
		</LabeledField>
	);
}

export function InputWithButton(
	props: JSX.IntrinsicElements["input"] & {
		button: React.ReactElement;
		input: React.ReactElement;
	}
) {
	return (
		<div className="grid items-start gap-2 sm:grid-cols-[1fr_auto]">
			{props.input}
			{props.button}
		</div>
	);
}

/**
 * Returns a function that generates a slug from the value of a field.
 *
 * @example
 * const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");
 * return (<>
 *  	<LabeledField label="Titel" error={errors.title?.message}>
 *			<input
 *				{...register("title")}
 *				type="text"
 *				className="textfield"
 *				placeholder="Die Neue Lerneinheit"
 *				onBlur={slugifyIfEmpty}
 *			/>
 *		</LabeledField>
 *		<LabeledField label="Slug" error={errors.slug?.message}>
 *			<InputWithButton
 *				input={
 *					<input
 *						className="textfield"
 *						placeholder="die-neue-lerneinheit"
 *						type={"text"}
 *						{...register("slug")}
 *					/>
 *				}
 *				button={
 *					<button type="button" className="btn-stroked" onClick={slugifyField}>
 *						Generieren
 *					</button>
 *				}
 *			/>
 *		</LabeledField>
 * </>);
 */
export function useSlugify<T extends Record<string, unknown>>(
	form: UseFormReturn<T, unknown>,
	field: keyof T,
	slugField: keyof T
) {
	return useMemo(() => {
		const slugifyField = () => {
			const title = form.getValues(field as any);
			const slug = slugify(title as any, { lower: true });
			form.setValue(slugField as any, slug as any);
		};

		return {
			slugifyField,
			slugifyIfEmpty: () => {
				if (form.getValues(slugField as any) === "") {
					slugifyField();
				}
			}
		};
	}, [form, field, slugField]);
}
