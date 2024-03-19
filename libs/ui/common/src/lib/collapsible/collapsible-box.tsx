import { useState } from "react";

const ArrowSvG = ({ isOpen }: { isOpen: boolean }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={`ml-2 mr-2 h-6 w-6 transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
	</svg>
);

export const CollapsibleBox = ({
	title,
	children
}: {
	title: React.ReactNode;
	children: React.ReactNode;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleCollapse = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="">
			<button
				className="mx-auto inline-flex w-full items-center rounded bg-gray-300 py-2 px-4 font-bold text-gray-800 hover:bg-gray-400"
				onClick={toggleCollapse}
			>
				<ArrowSvG isOpen={isOpen} />
				{title}
			</button>
			{isOpen && <div className="bg-gray-100 p-2">{children}</div>}
		</div>
	);
};
