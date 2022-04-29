import { createContext, PropsWithChildren, useContext, useState } from "react";
import { ExampleLayout } from ".";

const CounterContext = createContext({
	count: 0,
	increase: () => {},
	decrease: () => {}
});

function CounterContextProvider({ children }: PropsWithChildren<unknown>) {
	const [count, setCount] = useState(0);

	return (
		<CounterContext.Provider
			value={{
				count,
				decrease: () => setCount(c => c - 1),
				increase: () => setCount(c => c + 1)
			}}
		>
			{children}
		</CounterContext.Provider>
	);
}

export default function SharedCounter() {
	return (
		<ExampleLayout>
			<div className="wrapper">
				<span>
					The parent component only creates 4 counters, but does not manage any state or
					design. All counters are using the{" "}
					<span className="font-bold">CounterContext</span> that provides methods for
					updating and reading the count.
				</span>

				<span className="text-slate-400">
					Alternatively, the parent component could manage the counter state and use UI
					components to achieve synchronized state. This technique is sometimes referred
					to as &quot;lifting state up&quot;.
				</span>

				<div className="flex flex-wrap gap-8">
					<CounterContextProvider>
						<Counter />
						<Counter />
						<Counter />
						<Counter />
					</CounterContextProvider>
				</div>
			</div>
		</ExampleLayout>
	);
}

function Counter() {
	const { count, decrease, increase } = useContext(CounterContext);

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
