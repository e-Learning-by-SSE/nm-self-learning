import { AcademicCapIcon } from "@heroicons/react/outline";
import Link from "next/link";

export function Navbar() {
	<div className="h-20 bg-white">
		<div className="container mx-auto flex h-full items-center justify-between border">
			<div className="flex items-center gap-32">
				<div className="flex gap-2">
					<AcademicCapIcon className="h-12 text-indigo-600" />
					<div className="flex flex-col">
						<span className="font-light">Universität Hildesheim</span>
						<span className="font-bold">SELF-le@rning</span>
					</div>
				</div>
				<div className="flex gap-2 text-sm">
					<Link href="/courses">
						<a>Courses</a>
					</Link>
				</div>
			</div>
			<div className="flex flex-col">
				<button className="rounded-lg border border-indigo-100 px-8 py-1 font-semibold">
					Login
				</button>
			</div>
		</div>
	</div>;
}
