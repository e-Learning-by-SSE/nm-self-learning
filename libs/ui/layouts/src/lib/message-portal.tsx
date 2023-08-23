import { useEffect, useState } from "react";
import styles from "./message-portal.module.css";

export function MessagePortal() {
	const [showMessage, setShowMessage] = useState(true);
	const [timeLeft, setTimeLeft] = useState(120); // 3 minutes in seconds
	//const [message, setMessage] = useState(process.env.REACT_APP_MESSAGE || '');
	const message = process.env.NEXT_PUBLIC_SYSTEM_MSG;

	useEffect(() => {
		const timer = setInterval(() => {
			if (timeLeft <= 0) setShowMessage(false);
			else setTimeLeft(timeLeft - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [timeLeft, showMessage]);

	const handleCloseMessage = () => setShowMessage(false);

	if (!showMessage || !message) return null;

	return (
		<div
			className={`relative bg-blue-500 p-4 text-white opacity-80 ${
				showMessage ? styles.slideIn : "translate-y-full opacity-0"
			}`}
		>
			<button
				className="absolute top-2 right-2 text-3xl text-white"
				onClick={handleCloseMessage}
			>
				&times;
			</button>
			{showMessage && (
				<p className="absolute top-10 right-2 text-xs opacity-60">
					Automatisch in {timeLeft}
				</p>
			)}
			<p className="text-center" dangerouslySetInnerHTML={{ __html: message }}></p>
		</div>
	);
}
