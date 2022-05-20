import { AcademicCapIcon } from "@heroicons/react/outline";
import { MenuIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

export function Navbar() {
	// const displayFullNavbar = useMediaQuery({
	// 	query: "(min-width: 640px)"
	// });

	return (
		<div className="h-20 border border-b-gray-200 bg-white">
			<div className="container mx-auto flex h-full items-center justify-between">
				<div className="flex items-center gap-32">
					<Link href="/">
						<a className="flex gap-2">
							<AcademicCapIcon className="h-12 text-indigo-600" />
							<div className="flex flex-col">
								<span className="font-light">Universität Hildesheim</span>
								<span className="font-bold">SELF-le@rning</span>
							</div>
						</a>
					</Link>
					<div className="flex gap-16 text-sm">
						<Link href="/profile">
							<a>Profil</a>
						</Link>
						<Link href="/subjects">
							<a>Fachgebiete</a>
						</Link>
					</div>
				</div>
				<div className="flex flex-col">
					<button className="rounded-lg border border-indigo-100 px-8 py-1 font-semibold">
						Login
					</button>
				</div>
			</div>
		</div>
	);
	// return (
	// 	<div className="flex h-12 items-center bg-white px-2 text-black">
	// 		<div className="flex gap-4">
	// 			<MenuIcon className="h-6" />
	// 			<span className="font-semibold">SELF-le@rning</span>
	// 		</div>
	// 	</div>
	// );
}
