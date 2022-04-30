import { ReactElement, useState } from "react";
import { ExampleLayout } from "./";

export default function Parent() {
	return (
		<ExampleLayout>
			<div className="wrapper">
				<span>
					The parent component only manages the styles of individual elements. The state
					and composition is controlled by the child component, which receives
					ReactElements factory functions as input.
				</span>

				<CustomizableCounter
					renderCount={count => <span className="count">{count}</span>}
					renderDecrease={decrease => (
						<button className="btn-secondary" onClick={decrease}>
							Decrease
						</button>
					)}
					renderIncrease={increase => (
						<button className="btn-primary" onClick={increase}>
							Increase
						</button>
					)}
				/>
			</div>
		</ExampleLayout>
	);
}

export function CustomizableCounter({
	renderCount,
	renderDecrease,
	renderIncrease
}: {
	renderCount: (count: number) => ReactElement;
	renderDecrease: (decrease: () => void) => ReactElement;
	renderIncrease: (increase: () => void) => ReactElement;
}) {
	const [count, setCount] = useState(0);

	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-4">
				<span className="text-green-700">The count element will be displayed here:</span>
				<div className="w-fit">{renderCount(count)}</div>
			</div>

			<div className="grid gap-4">
				<span className="text-green-700">The decrease element will be displayed here:</span>
				<div className="w-fit">{renderDecrease(() => setCount(c => c - 1))}</div>
			</div>

			<div className="grid gap-4">
				<span className="text-green-700">The increase element will be displayed here:</span>
				<div className="w-fit">{renderIncrease(() => setCount(c => c + 1))}</div>
			</div>
		</div>
	);
}
