import { StarIcon } from "@heroicons/react/24/solid";

export function StarRating({
	rating,
	onChange
}: {
	rating: number;
	onChange: (rating: number) => void;
}) {
	return (
		<div className="flex justify-start">
			{Array.from({ length: 5 }).map((_, index) => {
				const val = index + 1;
				return (
					<StarIcon
						key={val}
						className={`h-8 w-8 cursor-pointer ${val <= rating ? "text-yellow-500" : "text-gray-400"}`}
						onClick={() => onChange(val)}
					/>
				);
			})}
		</div>
	);
}
