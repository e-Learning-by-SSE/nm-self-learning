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
		<div className="w-64 h-full p-4 fixed">
			<h2 className="text-lg font-bold mb-4">Lerntagebuch Seiten</h2>

			<div className="max-h-full overflow-y-auto">
				{fromToday.length >= 1 && (
					<div className="mb-4">
						<h3 className="block p-2 pl-4 rounded overflow-hidden">Von Heute</h3>
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-4 border-gray-300"></div>
							<ul className="pl-4">
								{fromToday.map(page => (
									<SideBarContent key={page.id} page={page}  currentTimeMS={currentTimeMS}/>
								))}
							</ul>
						</div>
					</div>
				)}

				{fromLastWeek.length >= 1 && (
					<div className="mb-4">
						<h3 className="block p-2 pl-4 rounded overflow-hidden">Von dieser Woche</h3>
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-4 border-gray-300"></div>
							<ul className="pl-4">
								{fromLastWeek.map(page => (
									<SideBarContent key={page.id} page={page}  currentTimeMS={currentTimeMS}/>
								))}
							</ul>
						</div>
					</div>
				)}

				{olderThanSevenDays.length >= 1 && (
					<div className="mb-4">
						<h3 className="block p-2 pl-4 rounded overflow-hidden">Älter als eine Woche</h3>
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-4 border-gray-300"></div>
							<ul className="pl-4">
								{olderThanSevenDays.map(page => (
									<SideBarContent key={page.id} page={page}  currentTimeMS={currentTimeMS}/>
								))}
							</ul>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function SideBarContent({ page, currentTimeMS }: { page: PagesMeta[number] & { index: number }, currentTimeMS: number }) {
	return (
		<li className="mb-2 hover:bg-gray-200 border border-gray-100 rounded">
			<Link href={"/learning-diary/page/" + page.id}>
				<div>
					<span className="block p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
						{"Nr. " + page.index + " " + page.course.title}
					</span>
					<span className="block p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
						{adaptiveTimeSpan(currentTimeMS - page.createdAt.getTime())}
					</span>
				</div>
			</Link>
		</li>
	);
}
