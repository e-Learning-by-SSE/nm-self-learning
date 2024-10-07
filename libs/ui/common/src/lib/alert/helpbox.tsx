import { Alert } from "./alert";

export function HelpBox({ message }: { message: string }) {
	return (
		<div className="max-w-4xl mx-auto my-4 p-4 overflow-auto animation-fadeIn">
			<Alert
				type={{
					severity: "INFORMATION",
					message: message
				}}
			/>
		</div>
	);
}
