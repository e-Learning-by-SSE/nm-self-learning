import { NextComponentType, NextPageContext } from "next";
import { DiarySidebarMobile, Sidebar } from "./page-viewer/page-sidebar";
import { PagesMeta, Strategy } from "./access-learning-diary";
import { PageChanger } from "./page-viewer/page-changer";

interface DiaryProps {
	diaryId: string;
	pages: PagesMeta;
	availableStrategies: Strategy[];
}

export function DiaryLayout(
	Component: NextComponentType<NextPageContext, unknown, DiaryProps>,
	pageProps: DiaryProps
) {
	return (
		<div className="flex flex-col bg-gray-50">
			<div className="mx-auto flex w-full flex-col gap-8 px-4 sm:flex-col-reverse xl:grid xl:grid-cols-[400px_1fr]">
				<div className="hidden xl:block">
					<div className="w-full">
						<Sidebar selectedPageId={pageProps.diaryId} pages={pageProps.pages} />
					</div>
				</div>
				<div className="xl:hidden">
					<DiarySidebarMobile
						selectedPageId={pageProps.diaryId}
						pages={pageProps.pages}
					/>
				</div>
				<div className="w-full xl:pt-8 lg:w-2/3 pb-16 mx-auto">
					<div className="hidden xl:block">
						<div className="flex mb-4 mt-4 justify-center">
							<PageChanger
								key={pageProps.diaryId}
								pages={pageProps.pages}
								currentPageId={pageProps.diaryId}
							/>
						</div>
					</div>

					<div className="flex justify-center">
						<Component {...pageProps} />
					</div>
				</div>
			</div>
		</div>
	);
}
