import { useState } from "react";
import { ExampleLayout } from "./";

export default function Counter() {
	const [count, setCount] = useState(0);

	return (
		<ExampleLayout>
			<div className="counter">
				<span className="count">{count}</span>
				<div className="actions">
					<button className="btn-secondary" onClick={() => setCount(c => c - 1)}>
						Decrease
					</button>
					<button className="btn-primary" onClick={() => setCount(c => c + 1)}>
						Increase
					</button>
				</div>
			</div>
		</ExampleLayout>
	);
}
