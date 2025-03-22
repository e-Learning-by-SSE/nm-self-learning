import { NextComponentType, NextPageContext } from "next";
import { DiarySidebarMobile, Sidebar } from "./page-viewer/page-sidebar";
import { PagesMeta, Strategy } from "./access-learning-diary";

interface DiaryProps {
	diaryId: string;
	pages: PagesMeta;
	availableStrategies: Strategy[];
}

export function DiaryLayout(
	Component: NextComponentType<NextPageContext, unknown, DiaryProps>,
	pageProps: DiaryProps & { isMobile: boolean }
) {
	return (
		<div className="flex flex-col">
			<div className="mx-auto flex w-full flex-col gap-8 px-4 sm:flex-col-reverse xl:grid xl:grid-cols-[400px_1fr]">
				{!pageProps.isMobile ? (
					<div className="w-full">
						<Sidebar selectedPageId={pageProps.diaryId} pages={pageProps.pages} />
					</div>
				) : (
					<DiarySidebarMobile selectedPageId={pageProps.diaryId} pages={pageProps.pages}/>
				)}
				<div className="w-full xl:pt-8 pb-16">
					<Component {...pageProps} />
				</div>
			</div>
		</div>
	);
}
