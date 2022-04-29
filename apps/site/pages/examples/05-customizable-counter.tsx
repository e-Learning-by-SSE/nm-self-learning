import { ReactElement, useState } from "react";
import { ExampleLayout } from "./";

export default function Parent() {
	const [count, setCount] = useState(0);

	return (
		<ExampleLayout>
			<div className="wrapper">
				<span>
					The parent manages the state styles of individual elements. The composition is
					controlled by the child component, which receives ReactElements as input.
				</span>

				<CustomizableCounter
					countElement={<span className="count">{count}</span>}
					decreaseElement={
						<button className="btn-secondary" onClick={() => setCount(c => c - 1)}>
							Decrease
						</button>
					}
					increaseElement={
						<button className="btn-primary" onClick={() => setCount(c => c + 1)}>
							Increase
						</button>
					}
				/>
			</div>
		</ExampleLayout>
	);
}

export function CustomizableCounter({
	countElement,
	decreaseElement,
	increaseElement
}: {
	countElement: ReactElement;
	decreaseElement: ReactElement;
	increaseElement: ReactElement;
}) {
	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-4">
				<span className="text-green-700">The count element will be displayed here:</span>
				<div className="w-fit">{countElement}</div>
			</div>

			<div className="grid gap-4">
				<span className="text-green-700">The decrease element will be displayed here:</span>
				<div className="w-fit">{decreaseElement}</div>
			</div>

			<div className="grid gap-4">
				<span className="text-green-700">The increase element will be displayed here:</span>
				<div className="w-fit">{increaseElement}</div>
			</div>
		</div>
	);
}
