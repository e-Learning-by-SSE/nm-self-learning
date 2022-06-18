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
