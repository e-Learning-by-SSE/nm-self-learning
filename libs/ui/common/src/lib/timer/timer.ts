import { useEffect, useState } from "react";

export function useCountdownSeconds(timeoutInSeconds: number) {
	const [timeLeft, setTimeLeft] = useState(timeoutInSeconds);

	useEffect(() => {
		const timerId = setInterval(() => {
			setTimeLeft(p => p - 1);
		}, 1000);
		return () => clearInterval(timerId);
	}, [timeoutInSeconds]);

	return timeLeft;
}
