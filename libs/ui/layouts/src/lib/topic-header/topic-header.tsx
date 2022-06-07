import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";

export function TopicHeader({
	title,
	subtitle,
	parentLink,
	parentTitle,
	imgUrlBanner,
	children
}: PropsWithChildren<{
	imgUrlBanner?: string | null;
	parentTitle: string;
	parentLink: string;
	title: string;
	subtitle: string;
}>) {
	return (
		<div className="flex flex-col">
			{imgUrlBanner && (
				<div className="relative h-48 w-full bg-white">
					<Image
						priority
						className=""
						src={imgUrlBanner}
						layout="fill"
						alt=""
						objectFit="cover"
					/>
				</div>
			)}

			<div className="glass flex w-full flex-col rounded-b-lg px-8 py-4">
				<Link href={parentLink}>
					<a>
						<h2 className="text-2xl text-indigo-500">{parentTitle}</h2>
					</a>
				</Link>
				<h1 className="mt-2 text-3xl sm:text-6xl">{title}</h1>
				<div className="mt-4 text-slate-500">{[subtitle]}</div>
				{children}
			</div>
		</div>
	);
}
