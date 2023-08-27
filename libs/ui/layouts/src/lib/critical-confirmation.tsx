export function CriticalConfirmationDialog({
	onConfirm,
	onCancel,
	confirmationText
}: {
	onConfirm: () => void;
	onCancel: () => void;
	confirmationText: string;
}) {
	return (
		<div className="fixed inset-0 z-10 overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center">
				<div className="fixed inset-0 bg-gray-500 opacity-75"></div>
				<div className="relative rounded-lg bg-white p-8">
					<p className="mb-4 text-lg font-medium">{confirmationText}</p>
					<div className="flex justify-end">
						<button
							className="mr-2 rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
							onClick={onConfirm}
						>
							Yes
						</button>
						<button
							className="rounded bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400"
							onClick={onCancel}
						>
							No
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
