export function Toggle({
	value,
	onChange,
	label
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
}) {
	return (
		<label className="inline-flex cursor-pointer items-center">
			<input
				type="checkbox"
				checked={value}
				className="peer sr-only"
				aria-label="Toggle switch"
				onChange={e => onChange(e.target.checked)}
			/>
			<div
				className="after:start-[2px]
             peer relative h-6 w-11 rounded-full
              bg-gray-200 after:absolute after:top-[2px] 
              after:h-5 after:w-5 after:rounded-full
               after:border after:border-gray-300
                after:bg-white after:transition-all 
                after:content-[''] peer-checked:bg-secondary 
                peer-checked:after:translate-x-full
                 peer-checked:after:border-white 
                 peer-focus:outline-none 
                rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700"
			></div>
			<span className="ml-2">{label}</span>
		</label>
	);
}
