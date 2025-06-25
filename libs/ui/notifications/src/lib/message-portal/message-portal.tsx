"use client";
import { useEffect, useState } from "react";
import styles from "./message-portal.module.css";
import { useCountdownSeconds } from "@self-learning/ui/common";
import { secondsToMilliseconds } from "date-fns";
import { NotificationPropsMap } from "../notification-types";

export function MessagePortal({
	htmlMessage,
	visibleTime = secondsToMilliseconds(120),
	autoDismiss = true,
	dismissible = true
}: NotificationPropsMap["BannerMessage"]) {
	const [hide, setHide] = useState(false);
	const timeLeftSeconds = useCountdownSeconds(visibleTime);
	const showMessage = timeLeftSeconds > 0 && !hide;

	useEffect(() => {
		if (autoDismiss) {
			const timer = setTimeout(() => setHide(true), visibleTime);
			return () => clearTimeout(timer);
		}
	}, [autoDismiss, visibleTime]);

	if (!showMessage) return null;

	return (
		<div
			className={`relative bg-blue-500 p-4 text-white opacity-80 ${
				showMessage ? styles.slideIn : "translate-y-full opacity-0"
			}`}
		>
			{/* Dismiss button, only shown if dismissible is true */}
			{dismissible && (
				<button
					className="absolute top-2 right-2 text-3xl text-white"
					onClick={() => setHide(true)}
				>
					&times;
				</button>
			)}
			<p className="absolute top-10 right-2 text-xs opacity-60">
				Automatisch in {timeLeftSeconds} Sekunden
			</p>
			<p className="text-center" dangerouslySetInnerHTML={{ __html: htmlMessage }}></p>
		</div>
	);
}
