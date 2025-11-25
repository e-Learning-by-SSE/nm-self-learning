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
				<div className="relative h-20 lg:h-48 w-full bg-white">
					<Image
						priority
						className="object-cover"
						src={imgUrlBanner}
						fill={true}
						alt="Banner"
					/>
				</div>
			)}

			<div className="relative mx-auto flex w-full max-w-screen-xl flex-col px-4 py-8 xl:px-0">
				<Link href={parentLink}>
					<h2 className="text-2xl text-c-primary">{parentTitle}</h2>
				</Link>
				<h1 className="mt-2 text-3xl sm:text-6xl">{title}</h1>
				<div className="mt-4 text-slate-500">{[subtitle]}</div>
				{children}
			</div>
		</div>
	);
}
