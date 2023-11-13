import { StarIcon } from "@heroicons/react/solid";
import { useState } from "react";

export default StarRating;

function Star({
	filled,
	onClick
}: Readonly<{ filled: boolean; onClick?: React.MouseEventHandler }>) {
	return (
		<StarIcon className="h-5 w-5" color={filled ? "orange" : "lightgray"} onClick={onClick} />
	);
}

function StarRating({
	onChange,
	value
}: Readonly<{ onChange: (value: number) => void; value: number }>) {
	const [rating, setRating] = useState(value);
	const changeRating = (newRating: number) => {
		setRating(newRating);
		onChange?.(newRating);
	};
	return (
		<div className="flex flex-row">
			{[1, 2, 3, 4, 5].map(value => (
				<Star key={value} filled={value <= rating} onClick={() => changeRating(value)} />
			))}
		</div>
	);
}
