import { useState, useEffect } from "react";
import { trpc } from "@self-learning/api-client";
import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"]);

export default function TestPage() {
	const [text, setText] = useState("");
	const [label, setLabel] = useState("");
	const [jobId, setJobId] = useState<string | null>(null);

	const startReverse = trpc.textRouter.startReverse.useMutation({
		onSuccess: ({ jobId }) => {
			console.log("onSuccess jobId:", jobId);
			setJobId(jobId);
			// Reset
			setLabel("");
		}
	});

	const getResult = trpc.textRouter.getResult.useQuery(
		{ jobId: jobId ?? "" }, // match your input name exactly
		{
			enabled: !!jobId, // only run once we have a jobId
			refetchInterval: 1000, // poll every 1s
			refetchIntervalInBackground: true
		}
	);

	// When data changes and is non-empty, update label and stop polling
	useEffect(() => {
		const value = getResult.data ?? "";
		if (value) {
			console.log("getResult data:", getResult.data);
			setLabel(value);
			setJobId(null); // Stop polling by clearing jobId
		}
	}, [getResult.data]);

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
