import Link from "next/link";

export function Card({
	imageElement,
	title,
	href
}: {
	imageElement: React.ReactNode;
	title: string;
	href: string;
}) {
	return (
		<Link
			href={href}
			className="flex flex-col place-items-center gap-4 rounded-lg border border-light-border bg-white pt-4"
		>
			<div className="flex aspect-square h-32 w-32">{imageElement}</div>
			<span className="w-full rounded-b-lg bg-secondary p-4 text-center font-semibold text-white">
				{title}
			</span>
		</Link>
	);
}
