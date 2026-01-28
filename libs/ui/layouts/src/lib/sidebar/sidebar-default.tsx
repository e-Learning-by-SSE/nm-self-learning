import {
	ClipboardDocumentListIcon,
	DocumentMagnifyingGlassIcon,
	HomeIcon
} from "@heroicons/react/24/outline";
import { AcademicCapIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SidebarLink } from "./sidebar-layout";

export function DefaultSidebar({ setOpen }: { setOpen: (open: boolean) => void }) {
	return {
		header: <SidebarHeader setOpen={setOpen} />,
		content: <SidebarLinks />,
		footer: <SidebarFooter />
	};
}

function SidebarHeader({ setOpen }: { setOpen: (open: boolean) => void }) {
	return (
		<div className="to flex justify-between border-b border-c-border p-4">
			<Link href="/" className="flex items-center gap-4">
				<AcademicCapIcon height="48" className="text-c-primary" />
				<span className="text-lg font-semibold">SELF LEARNING</span>
			</Link>
			<button
				className="absolute right-0 top-0 text-slate-90"
				title="Close Sidebar"
				onClick={() => setOpen(false)}
			>
				<XMarkIcon height="24" />
			</button>
		</div>
	);
}

function SidebarLinks() {
	const router = useRouter();

	return (
		<div className="grid gap-2 px-2 py-2">
			<SidebarLink
				isActive={router.route === "/"}
				href="/"
				text="Startseite"
				icon={<HomeIcon height="24" />}
			/>
			<SidebarLink
				isActive={router.route === "/courses"}
				href="/courses"
				text="Lerninhalte"
				icon={<DocumentMagnifyingGlassIcon height="24" />}
			/>
			<SidebarLink
				isActive={router.route === "/lessons/[lessonSlug]"}
				href="/todo"
				text="Mein Lernplan"
				icon={<ClipboardDocumentListIcon height="24" />}
			/>
		</div>
	);
}

function SidebarFooter() {
	const session = useSession();

	return (
		<div className="flex flex-col border-t border-c-border">
			<div className="flex py-4">
				{session.data?.user?.name && <UserInformation name={session.data.user.name} />}
			</div>
		</div>
	);
}

function UserInformation({ name }: { name: string }) {
	return (
		<div className="flex items-center gap-4 px-4">
			<div className="flex aspect-square h-10 rounded-full bg-gradient-to-br from-purple-600 to-orange-500">
				<span className="m-auto text-white">
					{name[0]}
					{name[1]}
				</span>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-sm font-medium">{name}</span>
				<span className="text-xs text-slate-400">Wirtschaftsinformatik</span>
			</div>
		</div>
	);
}
