import Link from "next/link";

/**
 * Component to quickly view and test the design system.
 */
export default function DesignSystem() {
	return (
		<div className="min-h-screen w-full px-32 py-16">
			<div className="mb-16 flex items-center gap-8">
				<h1 className="text-4xl">Design System</h1>
				<Link href="/">
					<a className="text-sky-500">Go Back</a>
				</Link>
			</div>

			<div className="flex flex-wrap gap-8">
				<div className="flex h-fit w-fit flex-col gap-8 rounded border border-slate-300 p-8">
					<span className="mb-4 text-xl font-bold">Headings</span>
					<h1 className="text-6xl">Heading 1</h1>
					<h2 className="text-4xl">Heading 2</h2>
					<h3 className="text-2xl">Heading 3</h3>
				</div>

				<div className="grid h-fit w-fit max-w-prose gap-8 rounded border border-slate-300 p-8">
					<span className="mb-4 text-xl font-bold">Text</span>
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

				<div className="flex h-fit w-fit flex-col gap-8 rounded border border-slate-300 p-8">
					<span className="mb-4 text-xl font-bold">Buttons</span>
					<button className="rounded bg-slate-800 px-8 py-2 font-semibold text-white">
						Primary
					</button>
					<button className="rounded bg-emerald-500 px-8 py-2 font-semibold text-white">
						Secondary
					</button>
					<button className="rounded border border-slate-800 px-8 py-2 font-semibold">
						Outline
					</button>
				</div>

				<div className="flex h-fit w-fit flex-col gap-8 rounded border border-slate-300 p-8">
					<span className="mb-4 text-xl font-bold">Gradients</span>
					<div className="h-64 w-64 bg-gradient-to-br from-slate-200 to-emerald-50"></div>
				</div>
			</div>
		</div>
	);
}
