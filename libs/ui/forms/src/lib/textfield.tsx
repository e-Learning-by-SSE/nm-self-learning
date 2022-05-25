export function Textfield(props: JSX.IntrinsicElements["input"] & { label: string }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<label className="text-sm font-semibold" htmlFor={props.name}>
				{props.label}
			</label>
			<input className="textfield" {...props} />
		</div>
	);
}

export function TextArea(props: JSX.IntrinsicElements["textarea"] & { label: string }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<label className="text-sm font-semibold" htmlFor={props.name}>
				{props.label}
			</label>
			<textarea className="textfield" {...props}></textarea>
		</div>
	);
}
