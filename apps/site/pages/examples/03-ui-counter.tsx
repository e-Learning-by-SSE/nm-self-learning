import { useState } from "react";
import { ExampleLayout } from "./";

export default function Counter() {
	const [count, setCount] = useState(0);

	return (
		<ExampleLayout>
			<div className="wrapper">
				<span>
					This parent component manages the state. The UI-component below will only
					display it and use the given callback functions when buttons were clicked.
				</span>

				<CounterUi
					count={count}
					decrease={() => setCount(c => c - 1)}
					increase={() => setCount(c => c + 1)}
				></CounterUi>
			</div>
		</ExampleLayout>
	);
}

type CounterUiProps = {
	count: number;
	decrease: () => void;
	increase: () => void;
};

export function CounterUi({ count, decrease, increase }: CounterUiProps) {
	return (
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
	);
}
