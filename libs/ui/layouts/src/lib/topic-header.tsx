import Image from "next/image";
import { PropsWithChildren } from "react";

export function TopicHeader({
	imgUrlBanner,
	children
}: PropsWithChildren<{ imgUrlBanner: string | null }>) {
	return (
		<div className="flex flex-col">
			<div className="relative h-48 w-full">
				<Image
					className=""
					src={`http://localhost:1337${imgUrlBanner}`}
					layout="fill"
					alt=""
					objectFit="cover"
				/>
			</div>

			<div className="glass flex w-full flex-col rounded-b-lg px-8 py-4">{children}</div>
		</div>
	);
}
