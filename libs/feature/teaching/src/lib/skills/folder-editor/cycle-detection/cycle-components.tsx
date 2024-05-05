export function CycleComponents<S extends { name: string; hasNestedCycleMembers?: boolean }>({
	cycles,
	onClick
}: {
	cycles: S[];
	onClick: (cycle: S) => void;
}) {
	return (
		<>
			{cycles.map((cycle, index, array) => {
				if (cycle.hasNestedCycleMembers) return null;

				return (
					<>
						<button
							key={index}
							className="m-5 rounded-md bg-gray-200 p-5"
							onClick={() => onClick(cycle)}
						>
							{cycle.name}
						</button>
						{(array.length -1) !== index && <span>{"->"}</span>}
					</>
				);
			})}
		</>
	);
}
