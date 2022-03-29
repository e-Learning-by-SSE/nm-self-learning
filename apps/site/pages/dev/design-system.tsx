import Link from "next/link";

/**
 * Component to quickly view and test the design system.
 */
export default function DesignSystem() {
	return (
		<div className="min-h-screen w-full px-32 py-16">
			<div className="flex gap-8 mb-16 items-center">
				<h1 className="text-4xl">Design System</h1>
				<Link href="/">
					<a className="text-sky-500">Go Back</a>
				</Link>
			</div>

			<div className="flex gap-8 flex-wrap">
				<div className="flex flex-col gap-8 p-8 border border-slate-300 w-fit h-fit rounded">
					<span className="font-bold text-xl mb-4">Headings</span>
					<h1 className="text-6xl">Heading 1</h1>
					<h2 className="text-4xl">Heading 2</h2>
					<h3 className="text-2xl">Heading 3</h3>
				</div>

				<div className="grid gap-8 p-8 border max-w-prose border-slate-300 w-fit h-fit rounded">
					<span className="font-bold text-xl mb-4">Text</span>
					<p className="text-xs">
						<span className="font-bold">text-xs:</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
					<p className="text-sm">
						<span className="font-bold">text-sm:</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
					<p className="text-md">
						<span className="font-bold">text-md:</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
					<p className="">
						(<span className="font-bold">default):</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
					<p className="text-base">
						<span className="font-bold">text-base:</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
					<p className="text-lg">
						<span className="font-bold">text-lg:</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
					<p className="text-xl">
						<span className="font-bold">text-xl:</span> Lorem, ipsum dolor sit amet
						consectetur adipisicing elit. Natus, ipsa excepturi. Minima sunt consequatur
						provident alias atque, saepe molestias corrupti illo labore officia nisi
						voluptatem laudantium eius, odio expedita? Officiis.
					</p>
				</div>
			</div>
		</div>
	);
}
