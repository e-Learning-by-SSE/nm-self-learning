// pages/test2.tsx
import { useRouter } from "next/router";

export default function Test2Page() {
	const router = useRouter();

	return (
		<div style={{ padding: "2rem" }}>
			<h1>Test 2 Page</h1>
			<button className="btn-primary" onClick={() => router.back()}>
				Back
			</button>
		</div>
	);
}
