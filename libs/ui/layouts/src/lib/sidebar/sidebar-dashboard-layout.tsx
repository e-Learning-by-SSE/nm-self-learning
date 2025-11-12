"use client";
import { BookOpenIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import { Divider } from "@self-learning/ui/common";
import { usePathname } from "next/navigation";
import React from "react";
import { CenteredSection } from "../containers/centered-section";
import { SecondarySidebarLayout, SidebarLink } from "./sidebar-layout";

export function DashboardSidebarLayout({ children }: { children: React.ReactNode }) {
	return (
		<SecondarySidebarLayout
			footer={<></>}
			header={<SidebarHeader />}
			content={<SidebarLinks />}
		>
			<div className="bg-gray-50">
				<CenteredSection>{children}</CenteredSection>
			</div>
		</SecondarySidebarLayout>
	);
}

function SidebarHeader() {
	return <></>;
}

type NavItem = {
	href: string;
	label: string;
	icon: React.ForwardRefExoticComponent<any>;
};

const navItems = [
	{ href: "/dashboard/courseOverview", label: "Kursübersicht", icon: ChartBarIcon },
	{ href: "/dashboard/learning-diary", label: "Lerntagebuch", icon: ChartBarIcon },
	{ href: "/dashboard/learningGoals", label: "Lernziele", icon: ChartBarIcon },
	{ href: "/subjects", label: "Fachgebiete", icon: ChartBarIcon }
] satisfies NavItem[];

const adminNavItems = [
	{ href: "/dashboard/courseOverview", label: "Kursübersicht", icon: ChartBarIcon },
	{ href: "/dashboard/learning-diary", label: "Lerntagebuch", icon: ChartBarIcon },
	{ href: "/dashboard/learningGoals", label: "Lernziele", icon: ChartBarIcon },
	{ href: "/subjects", label: "Fachgebiete", icon: ViewColumnsIcon }
] satisfies NavItem[];

const otherNavItems = [
	{ href: "/subjects", label: "Fachgebiete", icon: BookOpenIcon }
] satisfies NavItem[];

function NavItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
	return (
		<>
			{items.map(({ href, label, icon: Icon }) => {
				const isActive = pathname === href;
				return (
					<SidebarLink
						key={href}
						href={href}
						text={label}
						icon={<Icon className="h-5 w-5" />}
						isActive={isActive}
					/>
				);
			})}
		</>
	);
}

function SidebarLinks() {
	const pathname = usePathname();

	return (
		<div className="grid gap-2 px-2 py-2">
			<NavItems items={otherNavItems} pathname={pathname} />
			{/* <div className="h-2" /> */}
			<Divider />
			<NavItems items={navItems} pathname={pathname} />
			<Divider />
			<NavItems items={adminNavItems} pathname={pathname} />
		</div>
	);
}
