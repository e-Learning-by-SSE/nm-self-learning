import React from "react";

export function SidebarEditorLayout({
	sidebar,
	children
}: {
	children?: React.ReactNode;
	sidebar?: React.ReactNode;
}) {
	return (
		<div className="mx-auto grid max-w-[1920px] gap-8 xl:grid-cols-[500px_1fr]">
			<aside className="playlist-scroll top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:sticky xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r">
				<div className="flex flex-col px-4 pb-8">
					<div className="sticky top-0 z-10 flex flex-col gap-2 border-light-border pt-8 pb-4">
						{sidebar}
					</div>
				</div>
			</aside>

			<div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 pt-8 pb-64">
				{children}
			</div>
		</div>
	);
}
