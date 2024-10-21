import { useDiaryPageRouter } from "@self-learning/diary";
import { formatDateString, formatDateStringFull } from "@self-learning/util/common";
import { isThisMonth, isThisWeek, isToday, format, parse } from "date-fns";
import Link from "next/link";
import { PagesMeta } from "../access-learning-diary";
import { LearningDiaryEntryStatusBadge } from "../status-badge";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { ReactNode } from "react";

function categorizePagesIntoGroups(pages: PagesMeta) {
	const fromToday: PagesMeta = [];
	const fromThisWeek: PagesMeta = [];
	const fromThisMonth: PagesMeta = [];
	let fromOlderMonths: Record<string, PagesMeta> = {};

	pages.forEach(page => {
		const createdAt = page.createdAt;

		if (isToday(createdAt)) {
			fromToday.push(page);
		} else if (isThisWeek(createdAt, { weekStartsOn: 1 })) {
			fromThisWeek.push(page);
		} else if (isThisMonth(createdAt)) {
			fromThisMonth.push(page);
		}
		// Ältere Monate (nach Jahr und Monat gruppiert)
		else {
			const monthKey = formatDateString(createdAt, "yyyy MM");
			if (!fromOlderMonths[monthKey]) {
				fromOlderMonths[monthKey] = [];
			}
			fromOlderMonths[monthKey].push(page);
		}
	});

	// Sort by date
	fromOlderMonths = Object.fromEntries(
		Object.entries(fromOlderMonths)
			.sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
			.reverse()
	);
	// Convert keys: "yyyy MM" -> "MMMM yyyy"
	fromOlderMonths = Object.fromEntries(
		Object.entries(fromOlderMonths).map(([key, value]) => {
			const date = parse(key, "yyyy MM", new Date());
			const newKey = format(date, "MMMM yyyy");
			return [newKey, value];
		})
	);

	return {
		"Von Heute": fromToday,
		"Von dieser Woche": fromThisWeek,
		"Diesen Monat": fromThisMonth,
		...fromOlderMonths
	};
}

export function PageSidebarLayout({
	pages,
	selectedPageId,
	children
}: {
	pages: PagesMeta;
	selectedPageId: string;
	children: ReactNode;
}) {
	const categorizedPages = categorizePagesIntoGroups(pages);

	const renderSection = (label: string, renderPages: PagesMeta) => (
		<div className="mb-4" key={label}>
			<div className="block p-2 pl-0 rounded overflow-hidden font-semibold tracking-tight">
				{label}
			</div>
			<div className="relative">
				<div className="absolute top-0 left-0 h-full border-l-2 border-gray-300"></div>
				<ul className="pl-4">
					{renderPages.map(page => (
						<SideBarContent
							key={page.id}
							page={page}
							selected={selectedPageId === page.id}
							index={
								pages.indexOf(page) + 1
								/* access the component prop here to get an accurate index */
							}
						/>
					))}
				</ul>
			</div>
		</div>
	);

	return (
		<SidebarEditorLayout
			sidebar={
				<>
					<h2 className="text-2xl font-bold mt-4 mb-2">Lerntagebuch Seiten</h2>
					<div className="max-h-full overflow-y-auto">
						{Object.entries(categorizedPages).map(([label, pages]) => {
							if (pages.length === 0) return null; // Skip empty sections
							return renderSection(label, pages.reverse()); // Reverse to show newest first in each section
						})}
					</div>
				</>
			}
		>
			<div className="w-full">{children}</div>
		</SidebarEditorLayout>
	);
}

function SideBarContent({
	page,
	index,
	selected
}: {
	page: PagesMeta[number];
	index: number;
	selected: boolean;
}) {
	const { changePage } = useDiaryPageRouter();
	return (
		<li className={`mb-1 rounded hover:bg-gray-100 ${selected ? "bg-gray-100" : ""}`}>
			<Link href={"/learning-diary/page/" + page.id} onClick={() => changePage(page.id)}>
				<div className="flex items-center justify-between p-2 rounded break-words whitespace-normal">
					<span className="flex-grow">{`${index}: ${page.course.title}`}</span>
					<span className="ml-4">
						<LearningDiaryEntryStatusBadge {...page} className="top-2" />
					</span>
				</div>
				<span className="block p-1 rounded overflow-hidden text-ellipsis whitespace-nowrap text-sm text-light">
					Begonnen am: {formatDateStringFull(page.createdAt)}
				</span>
			</Link>
		</li>
	);
}
