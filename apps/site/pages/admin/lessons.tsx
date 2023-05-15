import { PlusIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { Paginator, Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'

export default function LessonManagementPage() {
	const router = useRouter();
	const { page = 1, title = "" } = router.query;
	const [titleFilter, setTitle] = useState(title);
	const { data } = trpc.lesson.findMany.useQuery(
		{ title: titleFilter as string, page: Number(page) },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	useEffect(() => {
		// We need this effect, because router.query is empty on first render
		setTitle(title as string);
	}, [title]);

	const session = useRequiredSession();
	if (session.data?.user.role !== "ADMIN") {
		return <AdminGuard></AdminGuard>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4 ">
				<h1 className="text-5xl">Lerneinheiten</h1>

				<div className="inline-flex rounded-md shadow-sm">
					<Menu as="div" className="relative -ml-px block">
						<Menu.Button className="bg-emerald-500  hover:bg-emerald-600 disabled:bg-opacity-25 focus:z-10 rounded-md">
							<div className="relative inline-flex items-center pl-8 pr-4 text-sm font-semibold text-white py-2">
								<PlusIcon className="icon h-5" />
								<span>Lerneinheit hinzufügen</span>
							</div>
							<div className="relative inline-flex items-center px-2 text-gray-200 border-l border-gray-300 py-2">
								<span className="sr-only">Weitere Optionen</span>
								<ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
							</div>
						</Menu.Button>
						<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95"
						>
						<Menu.Items className="absolute right-0 z-10 -mr-1 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<div className="py-1">
								<Menu.Item key="regular">
									<Link
										className="block px-4 py-2 text-sm hover:bg-gray-50 "
										href='/teaching/lessons/create'
									>
										Traditionelle Lerneinheit hinzufügen
									</Link>
								</Menu.Item>
								<Menu.Item key="self-regulated">
									<Link
										className="block px-4 py-2 text-sm hover:bg-gray-50 "
										href='/teaching/lessons/create-self-regulated'
									>
										Selbstregulierte Lerneinheit hinzufügen
									</Link>
								</Menu.Item>
							</div>
						</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>

			<SearchField
				placeholder="Suche nach Titel"
				value={titleFilter}
				onChange={e => {
					setTitle(e.target.value);

                    router.query.title = e.target.value;
                    router.query.page = '1';

					router.push(router, undefined, {
						shallow: true
					});
				}}
			/>

			<Table
				head={
					<>
						<TableHeaderColumn>Titel</TableHeaderColumn>
						<TableHeaderColumn>Von</TableHeaderColumn>
						<TableHeaderColumn>Letzte Änderung</TableHeaderColumn>
					</>
				}
			>
				{data?.result.map(lesson => (
					<tr key={lesson.lessonId}>
						<TableDataColumn>
							<Link
								className="text-sm font-medium hover:text-secondary"
								href={`/teaching/lessons/edit/${lesson.lessonId}`}
							>
								{lesson.title}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-light">
								{lesson.authors.map(a => a.displayName).join(", ")}
							</span>
						</TableDataColumn>

						<TableDataColumn>
							<span
								className="text-light"
								title={new Date(lesson.updatedAt).toLocaleString()}
							>
								{formatDateAgo(lesson.updatedAt)}
							</span>
						</TableDataColumn>
					</tr>
				))}
			</Table>

			{data?.result && (
				<Paginator pagination={data} url={`/admin/lessons?title=${titleFilter}`} />
			)}
		</CenteredSection>
	);
}
