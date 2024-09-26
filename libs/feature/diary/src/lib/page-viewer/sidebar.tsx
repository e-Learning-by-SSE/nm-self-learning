import Link from "next/link";
import { ResolvedValue } from "@self-learning/types";
import { allPages } from "@self-learning/diary";
import { adaptiveTimeSpan } from "@self-learning/util/common";

type PagesMeta = ResolvedValue<typeof allPages>;

export function Sidebar({ pages }: { pages: PagesMeta }) {
	const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
	const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

	const currentTimeMS = new Date().getTime();
	const pagesWithIndex = pages.map((page, index) => {
		return { ...page, index: pages.length - index };
	});

	const fromToday = pagesWithIndex.filter(
		page => currentTimeMS - new Date(page.createdAt).getTime() < oneDay
	);

	const fromLastWeek = pagesWithIndex.filter(page => {
		const createdAtTime = new Date(page.createdAt).getTime();
		const timeDiff = currentTimeMS - createdAtTime;
		return timeDiff >= oneDay && timeDiff < sevenDays;
	});

	const olderThanSevenDays = pagesWithIndex.filter(page => {
		const createdAtTime = new Date(page.createdAt).getTime();
		const timeDiff = currentTimeMS - createdAtTime;
		return timeDiff > sevenDays;
	});

	return (
		<aside
			className="playlist-scroll sticky top-[61px]
		w-full overflow-auto border-t border-r-gray-200
		pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r xl:pr-4"
		>
			<h2 className="text-2xl font-bold mt-4 mb-2">Lerntagebuch Seiten</h2>
			<div className="max-h-full overflow-y-auto">
				{fromToday.length >= 1 && (
					<div className="mb-4">
						<div className="block p-2 pl-0 rounded overflow-hidden font-semibold tracking-tight">
							Von Heute
						</div>
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-2 border-gray-300"></div>
							<ul className="pl-4">
								{fromToday.map(page => (
									<SideBarContent
										key={page.id}
										page={page}
										currentTimeMS={currentTimeMS}
									/>
								))}
							</ul>
						</div>
					</div>
				)}

				{fromLastWeek.length >= 1 && (
					<div className="mb-4">
						<div className="block p-2 pl-0 rounded overflow-hidden font-semibold tracking-tight">
							Von dieser Woche
						</div>
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-2 border-gray-300"></div>
							<ul className="pl-4">
								{fromLastWeek.map(page => (
									<SideBarContent
										key={page.id}
										page={page}
										currentTimeMS={currentTimeMS}
									/>
								))}
							</ul>
						</div>
					</div>
				)}

				{olderThanSevenDays.length >= 1 && (
					<div className="mb-4">
						<div className="block p-2 pl-0 rounded overflow-hidden font-semibold tracking-tight">
							Älter als eine Woche
						</div>
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-2 border-gray-300"></div>
							<ul className="pl-4">
								{olderThanSevenDays.map(page => (
									<SideBarContent
										key={page.id}
										page={page}
										currentTimeMS={currentTimeMS}
									/>
								))}
							</ul>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}

function SideBarContent({
	page,
	currentTimeMS
}: {
	page: PagesMeta[number] & { index: number };
	currentTimeMS: number;
}) {
	return (
		<li className="mb-1 hover:bg-gray-200">
			<Link href={"/learning-diary/page/" + page.id}>
				<div>
					<span className="block p-2 rounded break-words whitespace-normal">
						{page.index + ". " + page.course.title}
					</span>
					<span className="block p-1 rounded overflow-hidden text-ellipsis whitespace-nowrap text-sm text-light">
						{adaptiveTimeSpan(currentTimeMS - page.createdAt.getTime())}
					</span>
				</div>
			</Link>
		</li>
	);
}
