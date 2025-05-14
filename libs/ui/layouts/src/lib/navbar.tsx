"use client";
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition
} from "@headlessui/react";
import {
	AcademicCapIcon,
	AdjustmentsHorizontalIcon,
	ArrowRightStartOnRectangleIcon,
	Bars4Icon,
	PencilSquareIcon,
	UserIcon,
	WrenchIcon,
	XMarkIcon
} from "@heroicons/react/24/outline";
import { ChevronDownIcon, StarIcon } from "@heroicons/react/24/solid";
import { Divider } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { Fragment, useCallback, useEffect, useState } from "react";
import { redirectToLogin, redirectToLogout } from "./redirect-to-login";
import { SearchBar } from "./search-bar";

export function Navbar() {
	const session = useSession();
	const user = session.data?.user;

	return (
		<Disclosure
			as="nav"
			className="sticky top-0 z-20 w-full border-b border-b-gray-200 bg-white"
		>
			{({ open }) => (
				<>
					<div className="mx-auto px-2 lg:px-6 xl:px-8">
						<div className="relative flex h-16 items-center justify-between">
							<div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
								{/* Mobile menu button*/}
								<DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
									<span className="sr-only">Menü Öffnen</span>
									{open ? (
										<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
									) : (
										<Bars4Icon className="block h-6 w-6" aria-hidden="true" />
									)}
								</DisclosureButton>
							</div>
							<div className="flex flex-1 items-center justify-center lg:items-stretch lg:justify-start">
								<div className="flex flex-shrink-0 items-center">
									<Link href="/" className="flex items-center gap-4">
										<div className="rounded-full bg-secondary p-1">
											<AcademicCapIcon className="h-8 shrink-0 text-white" />
										</div>
										<div className="hidden w-0 flex-col lg:flex lg:w-fit">
											<span className="whitespace-nowrap text-sm text-light">
												Universität Hildesheim
											</span>
											<span className="whitespace-nowrap font-bold text-secondary">
												SELF-le@rning
											</span>
										</div>
									</Link>
								</div>
								<div className="hidden lg:ml-6 lg:block">
									{user && <NavbarNavigationLink />}
								</div>
							</div>
							{user && <SearchBar />}
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0">
								{/* Profile dropdown */}
								{!user ? (
									<button
										className="text-w rounded-lg bg-emerald-500 px-8 py-2 font-semibold text-white"
										onClick={redirectToLogin}
									>
										Login
									</button>
								) : (
									<div className="flex items-center gap-1 xl:gap-4">
										{user.role === "ADMIN" && (
											<span title="Admin">
												<StarIcon className="h-5 text-secondary" />
											</span>
										)}
										<Link href="/dashboard">
											<span className="hidden lg:inline w-0 text-sm lg:w-fit">
												{user.name}
											</span>
										</Link>
										<NavbarDropdownMenu
											avatarUrl={user.avatarUrl}
											isAuthor={user.isAuthor}
											isAdmin={user.role === "ADMIN"}
											signOut={redirectToLogout}
										/>
									</div>
								)}
							</div>
						</div>
					</div>

					<DisclosurePanel className="lg:hidden">
						<div className="space-y-1 px-2 pb-3 pt-2">
							<DisclosureButton
								as="a"
								href="subjects"
								className="block rounded-md px-3 py-2 text-base font-medium hover:text-gray-500"
							>
								Fachgebiete
							</DisclosureButton>
						</div>
					</DisclosurePanel>
				</>
			)}
		</Disclosure>
	);
}

function NavbarNavigationLink() {
	const [navigation, setNavigation] = useState([{ name: "Fachgebiete", href: "/subjects" }]);
	const router = useRouter();

	const setNavigationLink = useCallback(
		(query: ParsedUrlQuery) => {
			let newNavigation: { name: string; href: string }[] = [];
			newNavigation.push({ name: "Fachgebiete", href: "/subjects" });

			if (query.subjectSlug) {
				newNavigation.push({
					name: `${query.subjectSlug}`,
					href: `/subjects/${query.subjectSlug}`
				});
				if (query.specializationSlug) {
					newNavigation.push({
						name: `${query.specializationSlug}`,
						href: `/subjects/${query.subjectSlug}/${query.specializationSlug}`
					});
				}
				localStorage.setItem("navigation", JSON.stringify(newNavigation));
			} else if (query.courseSlug) {
				newNavigation = JSON.parse(localStorage.getItem("navigation") ?? "[]");
				if (newNavigation.length < 1) {
					newNavigation.push({ name: "Fachgebiete", href: "/subjects" });
					return;
				}
				newNavigation.push({
					name: `${query.courseSlug}`,
					href: `/courses/${query.courseSlug}`
				});
			}
			setNavigation(newNavigation);
		},
		[setNavigation]
	);

	useEffect(() => {
		const query = router.query;
		setNavigationLink(query);
	}, [router.query, setNavigationLink]);

	return (
		<div className="flex h-full items-center flex-row px-1 text-sm font-medium space-x-2">
			{navigation.map((item, index) => (
				<div key={item.name + index} className="flex items-center">
					<Link
						className={`hover:text-gray-500 ${index === navigation.length - 1 ? "text-gray-700 font-semibold" : ""}`}
						key={item.name + index}
						href={item.href}
					>
						{item.name}
					</Link>
					{index < navigation.length - 1 && <span className="mx-2 text-gray-400">/</span>}
				</div>
			))}
		</div>
	);
}

export function NavbarDropdownMenu({
	signOut,
	isAuthor,
	isAdmin,
	avatarUrl
}: {
	avatarUrl?: string | null;
	isAuthor: boolean;
	isAdmin: boolean;
	signOut: () => void;
}) {
	return (
		<Menu as="div" className="relative ml-1 xl:ml-3">
			<div>
				<MenuButton className="flex items-center gap-1 rounded-full text-sm">
					<span className="sr-only">Nutzermenü Öffnen</span>
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
				</MenuButton>
			</div>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<MenuItems
					as="div"
					className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
				>
					<MenuItem as="div" className="p-1">
						{({ focus }) => (
							<Link
								href="/dashboard"
								className={`${
									focus ? "bg-emerald-500 text-white" : ""
								} flex w-full items-center gap-2 rounded-md px-2 py-2`}
							>
								<UserIcon className="h-5" />
								<span>Profil</span>
							</Link>
						)}
					</MenuItem>
					<MenuItem as="div" className="p-1">
						{({ focus }) => (
							<Link
								href="/user-settings"
								className={`${
									focus ? "bg-emerald-500 text-white" : ""
								} flex w-full items-center gap-2 rounded-md px-2 py-2`}
							>
								<AdjustmentsHorizontalIcon className="h-5" />
								<span>Einstellungen</span>
							</Link>
						)}
					</MenuItem>
					<MenuItem as="div" className="p-1">
						<Divider />
					</MenuItem>
					{isAuthor && (
						<MenuItem as="div" className="p-1">
							{({ focus }) => (
								<Link
									href="/dashboard/author"
									className={`${
										focus ? "bg-emerald-500 text-white" : ""
									} flex w-full items-center gap-2 rounded-md px-2 py-2`}
								>
									<PencilSquareIcon className="h-5" />
									<span>Autorenbereich</span>
								</Link>
							)}
						</MenuItem>
					)}

					{isAdmin && (
						<MenuItem as="div" className="p-1">
							{({ focus }) => (
								<Link
									href="/admin"
									className={`${
										focus ? "bg-emerald-500 text-white" : ""
									} flex w-full items-center gap-2 rounded-md px-2 py-2`}
								>
									<WrenchIcon className="h-5" />
									<span>Adminbereich</span>
								</Link>
							)}
						</MenuItem>
					)}
					<MenuItem as="div" className="p-1">
						{({ focus }) => (
							<button
								onClick={signOut}
								className={`${
									focus ? "bg-emerald-500 text-white" : ""
								} flex w-full items-center gap-2 rounded-md px-2 py-2`}
							>
								<ArrowRightStartOnRectangleIcon className="h-5" />
								<span>Logout</span>
							</button>
						)}
					</MenuItem>
				</MenuItems>
			</Transition>
		</Menu>
	);
}
