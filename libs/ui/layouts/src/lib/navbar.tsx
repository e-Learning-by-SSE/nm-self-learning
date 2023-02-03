import { Menu } from "@headlessui/react";
import { AcademicCapIcon, LogoutIcon, UserIcon } from "@heroicons/react/outline";
import { ChevronDownIcon, StarIcon } from "@heroicons/react/solid";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { redirectToLogin } from "./redirect-to-login";
import { useRouter } from "next/router";

export function Navbar() {
	const session = useSession();
	const user = session.data?.user;
    const signOutCallbackUrl = useRouter().basePath;

	return (
		<nav className="sticky top-0 z-20 w-full border-b border-b-gray-200 bg-white">
			<div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 py-2 px-4">
				<div className="flex items-center gap-8 md:gap-32">
					<Link href="/" className="flex items-center gap-4">
						<div className="rounded-full bg-secondary p-1">
							<AcademicCapIcon className="h-8 shrink-0 text-white" />
						</div>
						<div className="hidden w-0 flex-col sm:flex sm:w-fit">
							<span className="whitespace-nowrap text-sm text-light">
								Universität Hildesheim
							</span>
							<span className="whitespace-nowrap font-bold text-secondary">
								SELF-le@rning
							</span>
						</div>
					</Link>
					<div className="hidden items-center gap-16 text-sm font-medium xl:flex">
						{user && (
							<>
								<Link href="/overview">Übersicht</Link>
								{user.role === "ADMIN" && <Link href="/admin">Adminbereich</Link>}
							</>
						)}
						<Link href="/subjects">Fachgebiete</Link>
					</div>
				</div>
				{!user ? (
					<button
						className="text-w rounded-lg bg-emerald-500 px-8 py-2 font-semibold text-white"
						onClick={redirectToLogin}
					>
						Login
					</button>
				) : (
					<div className="flex items-center gap-4">
						{user.role === "ADMIN" && (
							<span title="Admin">
								<StarIcon className="h-5 text-secondary" />
							</span>
						)}
						<span className="invisible w-0 text-sm sm:visible sm:w-fit">
							{user.name}
						</span>
						<NavbarDropdownMenu
							avatarUrl={user.avatarUrl}
							signOut={() => signOut({ callbackUrl: signOutCallbackUrl })}
						/>
					</div>
				)}
			</div>
		</nav>
	);
}

export function NavbarDropdownMenu({
	signOut,
	avatarUrl
}: {
	avatarUrl?: string | null;
	signOut: () => void;
}) {
	return (
		<Menu as="div" className="relative flex">
			<Menu.Button className="flex shrink-0 items-center gap-1">
				{avatarUrl ? (
					<img
						className="h-[42px] w-[42px] rounded-full object-cover object-top"
						alt="Avatar"
						src={avatarUrl}
						width={42}
						height={42}
					></img>
				) : (
					<div className="h-[42px] w-[42px] rounded-full bg-gray-200"></div>
				)}
				<ChevronDownIcon className="h-6 text-gray-400" />
			</Menu.Button>
			<Menu.Items className="absolute right-0 top-14 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white text-sm shadow-lg ring-1 ring-emerald-500 ring-opacity-5 focus:outline-none">
				<Menu.Item as="div" className="p-1">
					{({ active }) => (
						<Link
							href="/overview"
							className={`${
								active ? "bg-emerald-500 text-white" : ""
							} flex w-full items-center gap-2 rounded-md px-2 py-2`}
						>
							<UserIcon className="h-5" />
							<span>Übersicht</span>
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
