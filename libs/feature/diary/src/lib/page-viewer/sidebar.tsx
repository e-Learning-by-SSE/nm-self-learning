import Link from "next/link";
import { ResolvedValue } from "@self-learning/types";
import { allPages } from "@self-learning/diary";

type PagesMeta = ResolvedValue<typeof allPages>;

export function Sidebar({ pages }: { pages: PagesMeta }) {
	const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
	const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

	const currentTime = new Date().getTime();

	const fromToday = pages.filter(
		page => currentTime - new Date(page.createdAt).getTime() < oneDay
	);

	const fromLastWeek = pages.filter(page => {
		const createdAtTime = new Date(page.createdAt).getTime();
		const timeDiff = currentTime - createdAtTime;
		return timeDiff >= oneDay && timeDiff < sevenDays;
	});

	const olderThanSevenDays = pages.filter(page => {
		const createdAtTime = new Date(page.createdAt).getTime();
		const timeDiff = currentTime - createdAtTime;
		return timeDiff > sevenDays;
	});

	return (
		<div className="w-64 h-full p-4 fixed">
			<h2 className="text-lg font-bold mb-4">Lerntagebuch Seiten</h2>

			{/* Scrollable container for the list */}
			<div className="max-h-full overflow-y-auto">
				{/* Category: Von Heute */}
				{fromToday.length >= 1 && (
					<div className="mb-4">
						<h3 className="block p-2 pl-4 rounded overflow-hidden">Von Heute</h3>
						{/* Vertical line for "Von Heute" */}
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-4 border-gray-300"></div>
							<ul className="pl-4">
								{fromToday.map(page => (
									<SideBarContent key={page.id} page={page} />
								))}
							</ul>
						</div>
					</div>
				)}

				{/* Category: Von dieser Woche */}
				{fromLastWeek.length >= 1 && (
					<div className="mb-4">
						<h3 className="block p-2 pl-4 rounded overflow-hidden">Von dieser Woche</h3>
						{/* Vertical line for "Von dieser Woche" */}
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-4 border-gray-300"></div>
							<ul className="pl-4">
								{fromLastWeek.map(page => (
									<SideBarContent key={page.id} page={page} />
								))}
							</ul>
						</div>
					</div>
				)}

				{/* Category: Älter als eine Woche */}
				{olderThanSevenDays.length >= 1 && (
					<div className="mb-4">
						<h3 className="block p-2 pl-4 rounded overflow-hidden">Älter als eine Woche</h3>
						{/* Vertical line for "Älter als eine Woche" */}
						<div className="relative">
							<div className="absolute top-0 left-0 h-full border-l-4 border-gray-300"></div>
							<ul className="pl-4">
								{olderThanSevenDays.map(page => (
									<SideBarContent key={page.id} page={page} />
								))}
							</ul>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function SideBarContent({ page }: { page: PagesMeta[number] }) {
	return (
		<li className="mb-2 hover:bg-gray-200 rounded">
			<Link href={"/learning-diary/page/" + page.id}>
				<div>
					<span className="block p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
						{page.course.title}
					</span>
				</div>
			</Link>
		</li>
	);
}
