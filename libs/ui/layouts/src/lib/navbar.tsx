import { Menu } from "@headlessui/react";
import { AcademicCapIcon, LogoutIcon } from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { signIn, signOut, useSession } from "next-auth/react";
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
				{!session?.user ? (
					<button
						className="text-w rounded-lg bg-indigo-500 px-8 py-2 font-semibold text-white"
						onClick={() => signIn()}
					>
						Login
					</button>
				) : (
					<div className="flex items-center gap-4">
						<span className="text-sm">{session.user.name}</span>
						<NavbarDropdownMenu signOut={signOut} />
					</div>
				)}
			</div>
		</div>
	);
}

export function NavbarDropdownMenu({ signOut }: { signOut: () => void }) {
	return (
		<Menu as="div" className="relative flex">
			<Menu.Button className="flex items-center gap-1">
				<div className="gradient h-12 w-12 rounded-full"></div>
				<ChevronDownIcon className="h-6 text-gray-400" />
			</Menu.Button>
			<Menu.Items className="absolute right-0 top-14 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white text-sm shadow-lg ring-1 ring-indigo-500 ring-opacity-5 focus:outline-none">
				<Menu.Item as="div" className="p-1">
					{({ active }) => (
						<button
							onClick={signOut}
							className={`${
								active ? "bg-indigo-500 text-white" : ""
							} flex w-full items-center gap-2 rounded-md px-2 py-2`}
						>
							<LogoutIcon className="h-5" />
							<span>Logout</span>
						</button>
					)}
				</Menu.Item>
			</Menu.Items>
		</Menu>
	);
}
