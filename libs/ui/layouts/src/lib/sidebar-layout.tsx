import { ClipboardListIcon, DocumentSearchIcon, HomeIcon } from "@heroicons/react/outline";
import { AcademicCapIcon, MenuIcon, XIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, useState } from "react";

export type SidebarLayoutProps = {
	isSidebarOpen: boolean;
};

export function SidebarLayout({ children, isSidebarOpen }: PropsWithChildren<SidebarLayoutProps>) {
	const [open, setOpen] = useState(isSidebarOpen);
	const router = useRouter();

	return (
		<div className="flex h-full w-full">
			{open ? (
				<div className="fixed top-0 left-0 z-10 flex h-full w-full flex-col overflow-hidden bg-slate-800 text-white sm:fixed sm:w-64">
					<div className="to flex justify-between border-b border-slate-700 bg-slate-900 p-4">
						<Link href="/">
							<a href="/" className="flex items-center gap-4">
								<AcademicCapIcon height="48" className="text-emerald-400" />
								<span className="text-lg font-semibold">SELF LEARNING</span>
							</a>
						</Link>
						<button
							className="absolute right-0 top-0 text-slate-900 hover:text-white"
							title="Close Sidenav"
							onClick={() => setOpen(false)}
						>
							<XIcon height="24" />
						</button>
					</div>
					<div className="sidenav scroll flex-grow overflow-auto pt-2">
						<div className="flex h-full flex-col justify-between">
							<div className="grid gap-1 px-2">
								<SidebarLink
									isActive={router.route === "/"}
									href="/"
									text="Startseite"
									icon={<HomeIcon height="24"></HomeIcon>}
								/>
								<SidebarLink
									isActive={router.route === "/courses"}
									href="/courses"
									text="Lerninhalte"
									icon={<DocumentSearchIcon height="24"></DocumentSearchIcon>}
								/>
								<SidebarLink
									isActive={router.route === "/lessons/[lessonSlug]"}
									href="/todo"
									text="Mein Lernplan"
									icon={<ClipboardListIcon height="24"></ClipboardListIcon>}
								/>
							</div>
						</div>
					</div>
					<div className="px-4 text-xs text-slate-700">
						<Link href="/_dev/design-system">dev</Link>
					</div>
					<div className="flex flex-col border-t border-slate-700 bg-slate-900">
						<div className="flex py-4">
							<UserInformation />
						</div>
					</div>
				</div>
			) : (
				// Sidebar is closed
				<button onClick={() => setOpen(true)} className="fixed top-4 left-4">
					<MenuIcon height="24" />
				</button>
			)}

			<div className={`w-full py-16 ${open && "ml-64"}`}>
				<div className="mx-auto flex w-full flex-col px-4 lg:max-w-screen-lg">
					{children}
				</div>
			</div>
		</div>
	);
}

function SidebarLink({
	href,
	text,
	icon,
	isActive
}: {
	href: string;
	text: string;
	icon: JSX.Element;
	isActive: boolean;
}) {
	return (
		<Link href={href}>
			<a
				href={href}
				className={`px flex items-center gap-4 rounded py-2 px-2 hover:bg-slate-900 ${
					isActive ? "text-white" : "text-slate-300"
				}`}
			>
				{icon}
				<span className={`text-sm ${isActive && "font-semibold"}`}>{text}</span>
			</a>
		</Link>
	);
}

function UserInformation() {
	return (
		<div className="flex items-center gap-4 px-4">
			<div className="flex aspect-square h-10 rounded-full bg-gradient-to-br from-purple-600 to-orange-500">
				<span className="m-auto">MM</span>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-sm">Max Mustermann</span>
				<span className="text-xs text-slate-400">Wirtschaftsinformatik</span>
			</div>
		</div>
	);
}
