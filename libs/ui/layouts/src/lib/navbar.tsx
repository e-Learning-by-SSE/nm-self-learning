import { useSession, signIn, signOut } from "next-auth/react";
import { AcademicCapIcon } from "@heroicons/react/outline";
import Link from "next/link";

export function Navbar() {
	const { data: session } = useSession();

	return (
		<div className="h-20 border-b border-b-gray-200 bg-white">
			<div className="container mx-auto flex h-full items-center justify-between gap-4 px-4">
				<div className="flex items-center gap-8 md:gap-32">
					<Link href="/">
						<a className="flex items-center gap-2">
							<AcademicCapIcon className="h-12 shrink-0 text-indigo-600" />
							<div className="invisible flex w-0 flex-col md:visible md:w-fit">
								<span className="font-light">Universität Hildesheim</span>
								<span className="font-bold">SELF-le@rning</span>
							</div>
						</a>
					</Link>
					<div className="flex gap-16 text-sm">
						{session?.user && (
							<Link href="/profile">
								<a>Profil ({session.user.name})</a>
							</Link>
						)}
						<Link href="/subjects">
							<a>Fachgebiete</a>
						</Link>
					</div>
				</div>
				<div className="flex flex-col">
					{!session?.user ? (
						<button
							className="rounded-lg border border-indigo-100 px-8 py-1 font-semibold"
							onClick={() => signIn()}
						>
							Login
						</button>
					) : (
						<button
							className="rounded-lg border border-indigo-100 px-8 py-1 font-semibold"
							onClick={() => signOut()}
						>
							Logout
						</button>
					)}
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
