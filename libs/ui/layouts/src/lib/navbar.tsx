import { Menu } from "@headlessui/react";
import { AcademicCapIcon, LogoutIcon, UserIcon } from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
	const { data: session } = useSession();

	return (
		<nav className="sticky top-0 z-20 w-full border-b border-b-gray-200 bg-white">
			<div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 py-2 px-4">
				<div className="flex items-center gap-8 md:gap-32">
					<Link href="/">
						<a className="flex items-center gap-4">
							<div className="rounded-full bg-secondary p-1">
								<AcademicCapIcon className="h-8 shrink-0 text-white" />
							</div>
							<div className="hidden w-0 flex-col sm:flex sm:w-fit">
								<span className="text-sm text-light">Universität Hildesheim</span>
								<span className="font-bold text-secondary">SELF-le@rning</span>
							</div>
						</a>
					</Link>
					<div className="invisible flex w-0 items-center gap-16 text-sm font-medium lg:visible lg:w-fit">
						{session?.user && (
							<>
								{/* <Link href="/learning-diary">
									<a>Lerntagebuch</a>
								</Link> */}
								<Link href="/profile">
									<a>Profil</a>
								</Link>
							</>
						)}
						<Link href="/subjects">
							<a>Fachgebiete</a>
						</Link>
					</div>
				</div>
				{!session?.user ? (
					<button
						className="text-w rounded-lg bg-emerald-500 px-8 py-2 font-semibold text-white"
						onClick={() => signIn()}
					>
						Login
					</button>
				) : (
					<div className="flex items-center gap-4">
						<span className="invisible w-0 text-sm sm:visible sm:w-fit">
							{session.user.name}
						</span>
						<NavbarDropdownMenu signOut={() => signOut({ callbackUrl: "/" })} />
					</div>
				)}
			</div>
		</nav>
	);
}

export function NavbarDropdownMenu({ signOut }: { signOut: () => void }) {
	return (
		<Menu as="div" className="relative flex">
			<Menu.Button className="flex shrink-0 items-center gap-1 ">
				<Image
					className="rounded-full object-top"
					src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&q=80"
					objectFit="cover"
					width={42}
					height={42}
				></Image>
				<ChevronDownIcon className="h-6 text-gray-400" />
			</Menu.Button>
			<Menu.Items className="absolute right-0 top-14 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white text-sm shadow-lg ring-1 ring-emerald-500 ring-opacity-5 focus:outline-none">
				<Menu.Item as="div" className="p-1">
					{({ active }) => (
						<Link href="/profile">
							<a
								className={`${
									active ? "bg-emerald-500 text-white" : ""
								} flex w-full items-center gap-2 rounded-md px-2 py-2`}
							>
								<UserIcon className="h-5" />
								<span>Mein Profil</span>
							</a>
						</Link>
					)}
				</Menu.Item>
				<Menu.Item as="div" className="p-1">
					{({ active }) => (
						<button
							onClick={signOut}
							className={`${
								active ? "bg-emerald-500 text-white" : ""
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
