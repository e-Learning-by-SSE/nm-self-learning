import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function TestPage() {
	const router = useRouter();
	const [modalOpen, setModalOpen] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;

		// Initial load: set modal state based on history
		if (router.query.modal === undefined) {
			// Push a state with modal open
			router
				.replace({ pathname: router.pathname, query: { modal: "open" } }, undefined, {
					shallow: true
				})
				.then(() => {
					// Remove the query param from the address bar
					window.history.replaceState(
						{ ...window.history.state, as: router.pathname },
						"",
						router.pathname
					);
				});
		}

		// Update state on actual query param
		setModalOpen(router.query.modal !== "closed");
	}, [router]);

	const handleOk = () => {
		router
			.push({ pathname: router.pathname, query: { modal: "closed" } }, undefined, {
				shallow: true
			})
			.then(() => {
				window.history.replaceState(
					{ ...window.history.state, as: router.pathname },
					"",
					router.pathname
				);
			});
	};

	const handleNext = () => {
		router.push("/test2");
	};

	return (
		<div style={{ padding: "2rem" }}>
			<h1>Test Page</h1>
			{!modalOpen && <button onClick={handleNext}>Next</button>}
			{modalOpen && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0,0,0,0.5)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					<div
						style={{
							backgroundColor: "white",
							padding: "2rem",
							borderRadius: "8px",
							textAlign: "center"
						}}
					>
						<p>This is a modal</p>
						<button onClick={handleOk}>OK</button>
					</div>
				</div>
			)}
		</div>
	);
}
