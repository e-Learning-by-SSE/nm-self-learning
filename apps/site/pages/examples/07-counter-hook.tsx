import { useState } from "react";
import { ExampleLayout } from ".";

function useCounter() {
	const [count, setCount] = useState(0);
	return {
		count,
		decrease: () => setCount(c => c - 1),
		increase: () => setCount(c => c + 1)
	};
}

export default function Counter() {
	const { count, decrease, increase } = useCounter();

	return (
		<ExampleLayout>
			<div className="wrapper">
				<span>Similar to the normal counter, but logic is moved into a separate hook.</span>

				<div className="counter">
					<span className="count">{count}</span>
					<div className="actions">
						<button className="btn-secondary" onClick={decrease}>
							Decrease
						</button>
						<button className="btn-primary" onClick={increase}>
							Increase
						</button>
					</div>
				</div>
			</div>
		</ExampleLayout>
	);
}
