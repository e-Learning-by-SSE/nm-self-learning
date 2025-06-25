import Head from "next/head";

export type BaseLessonLayoutProps = {
	title: string;
	playlistArea: React.ReactNode;
	children: React.ReactNode;
};

export function BaseLessonLayout({ title, playlistArea, children }: BaseLessonLayoutProps) {
	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>

			<div className="flex flex-col bg-gray-100">
				<div className="mx-auto flex w-full max-w-[1920px] flex-col-reverse gap-8 px-4 xl:grid xl:grid-cols-[400px_1fr]">
					{playlistArea}
					<div className="w-full pt-8 pb-16">{children}</div>
				</div>
			</div>
		</>
	);
}
