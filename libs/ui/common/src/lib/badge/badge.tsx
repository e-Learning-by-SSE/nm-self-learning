export function Badge({ text, className = "" }: { text: string; className?: string }) {
	return (
		<span
			className={`inline-flex items-center self-center rounded-full px-2 py-[2px] text-sm font-medium border ${className}`}
		>
			{text}
		</span>
	);
}
