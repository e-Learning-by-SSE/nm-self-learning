import { ClipboardListIcon, DocumentSearchIcon, HomeIcon } from "@heroicons/react/outline";
import { AcademicCapIcon, XIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, ReactNode } from "react";

export function Sidebar({
	header,
	content,
	footer
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
}) {
	return (
		<div className="fixed top-0 left-0 z-10 flex h-full w-full flex-col overflow-hidden bg-slate-800 text-white sm:w-64">
			{header}
			<ScrollableContent>{content}</ScrollableContent>
			{footer}
		</div>
	);
}

export function DefaultSidebar({ setOpen }: { setOpen: (open: boolean) => void }) {
	return (
		<Sidebar
			header={<SidebarHeader setOpen={setOpen} />}
			content={<SidebarLinks />}
			footer={<SidebarFooter />}
		/>
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
					isActive ? "bg-slate-900 text-white" : "text-slate-300"
				}`}
			>
				{icon}
				<span className={`text-sm ${isActive && "font-semibold"}`}>{text}</span>
			</a>
		</Link>
	);
}

function SidebarHeader({ setOpen }: { setOpen: (open: boolean) => void }) {
	return (
		<div className="to flex justify-between border-b border-slate-700 bg-slate-900 p-4">
			<Link href="/">
				<a href="/" className="flex items-center gap-4">
					<AcademicCapIcon height="48" className="text-emerald-400" />
					<span className="text-lg font-semibold">SELF LEARNING</span>
				</a>
			</Link>
			<button
				className="absolute right-0 top-0 text-slate-900 hover:text-white"
				title="Close Sidebar"
				onClick={() => setOpen(false)}
			>
				<XIcon height="24" />
			</button>
		</div>
	);
}

function ScrollableContent({ children }: PropsWithChildren<unknown>) {
	return <div className="Sidebar scroll flex-grow overflow-auto">{children}</div>;
}

function SidebarLinks() {
	const router = useRouter();

	return (
		<div className="grid gap-1 px-2 py-2">
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
	);
}

function SidebarFooter() {
	return (
		<>
			<div className="px-4 text-xs text-slate-700">
				<Link href="/_dev/design-system">dev</Link>
			</div>
			<div className="flex flex-col border-t border-slate-700 bg-slate-900">
				<div className="flex py-4">
					<UserInformation />
				</div>
			</div>
		</>
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
