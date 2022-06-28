export function ClozeAnswer({ textArray }: { textArray: string[] }) {
	return (
		<div className="grid items-start gap-8">
			<span className="text-slate-400">Vervollständige den nachfolgenden Text:</span>

			<div className="text-justify leading-10">
				{textArray.map((text, index) => (
					<span key={text}>
						{text}
						{index < textArray.length - 1 && (
							<input type="text" className="textfield" />
						)}
					</span>
				))}
			</div>
		</div>
	);
}
