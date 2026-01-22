import { useEffect, useRef, useState } from "react";
import { trpc } from "@self-learning/api-client";
// import { skipToken } from "@tanstack/react-query";

export default function TestPage() {
	const [text, setText] = useState("");
	const [label, setLabel] = useState("");
	const [jobId, setJobId] = useState<string | null>(null);

	const startReverse = trpc.textRouter.startReverse.useMutation({
		onSuccess: ({ jobId }) => {
			console.log("onSuccess jobId:", jobId);
			setJobId(jobId);
		}
	});

	// const jobInput = jobId ? { jobId } : skipToken;

	// trpc.textRouter.onReverse.useSubscription(jobInput, {
	// 	onData: evt => {
	// 		if (evt.type === "done") setLabel(evt.value);
	// 		if (evt.type === "error") setLabel(`ERROR: ${evt.message}`);
	// 	}
	// });

	const esRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (!jobId) return;
		esRef.current?.close();

		console.log("Subscribing SSE to jobId:", jobId);

		const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
		const es = new EventSource(
			`${basePath}/api/reverse-events?jobId=${encodeURIComponent(jobId)}`
		);
		es.onmessage = m => {
			const evt = JSON.parse(m.data);
			if (evt.type === "done") setLabel(evt.value);
			if (evt.type === "error") setLabel(`ERROR: ${evt.message}`);
		};
		es.onerror = () => es.close();

		return () => es.close();
	}, [jobId]);

	const onClick = async () => {
		startReverse.mutateAsync({ text });
	};
	return (
		<>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<input
					value={text}
					onChange={e => setText(e.target.value)}
					placeholder="Type something…"
					style={{ padding: 8, minWidth: 240 }}
				/>
				<button onClick={onClick} style={{ padding: "8px 12px" }}>
					Send
				</button>
			</div>

			<p style={{ marginTop: 16 }}>
				Label: <strong>{label}</strong>
			</p>
		</>
	);
}
