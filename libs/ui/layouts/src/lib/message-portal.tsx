import { useState } from "react";
import styles from "./message-portal.module.css";
import { useCountdownSeconds } from "@self-learning/ui/common";

export function MessagePortal() {
	const message = process.env.NEXT_PUBLIC_SYSTEM_MSG;
	const [hide, setHide] = useState(false);
	const timeLeftSeconds = useCountdownSeconds(120);
	const showMessage = timeLeftSeconds > 0 && !hide;

	if (!showMessage || !message) return null;
	return (
		<div
			className={`relative bg-blue-500 p-4 text-white opacity-80 ${
				showMessage ? styles.slideIn : "translate-y-full opacity-0"
			}`}
		>
			<button
				className="absolute top-2 right-2 text-3xl text-white"
				onClick={() => setHide(true)}
			>
				&times;
			</button>
			<p className="absolute top-10 right-2 text-xs opacity-60">
				Automatisch in {timeLeftSeconds}
			</p>
			<p className="text-center" dangerouslySetInnerHTML={{ __html: message }}></p>
		</div>
	);
}
