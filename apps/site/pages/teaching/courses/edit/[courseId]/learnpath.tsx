import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { SkillTable } from "libs/feature/teaching/src/lib/skills/folder-editor/folder-list-view";
import { useState } from "react";
import { useRouter } from "next/router";

export default function LearnPathEditor() {
	return (
		// TODO loe later
		//
		// outer container original setup
		// <div className="mx-auto grid max-w-[1920px] gap-8 xl:grid-cols-[500px_1fr]">
		//
		// aside original layout
		// <aside className="playlist-scroll top-[61px] w-full overflow-auto border-t border-r-gray-200  bg-orange-100 pb-8 xl:sticky
		//		xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r"
		//
		// right column
		// className="border-r-gray-200pt-8 sticky top-0 z-10  flex flex-col gap-2  bg-orange-300 pb-4
		//
		<div className="max-w-100% mx-auto grid gap-8 bg-gray-50 py-10 xl:grid-cols-[500px_1000px_500px]">
			{/** left side bar */}
			<aside className="playlist-scroll top-0 w-full overflow-auto xl:sticky xl:h-[calc(100vh-61px)]">
				<div className="flex flex-col px-4 pb-8">
					<Skills />
				</div>
			</aside>

			{/** center */}
			<main className="grid gap-4 bg-gray-50  xl:grid-rows-[500px_900px] ">
				<div className="flex flex-col border border-gray-200  bg-white  px-4 py-4">
					<LessonConfiguration />
				</div>
				<div className="bg-gray-20 flex flex-col border  border-gray-200 bg-white px-4 py-4">
					<h1 className=" text-3xl">Lernpfad-Vorschau</h1>
				</div>
			</main>

			{/** right side bar */}
			<div className="playlist-scroll top-0 w-full overflow-auto pb-8 xl:sticky xl:h-[calc(100vh-61px)]">
				<div className="flex flex-col px-4 pb-8">
					<Lessons />
				</div>
			</div>
		</div>
	);
}

function Skills() {
	const repositoryID = "1"; // TODO
	const { data: repository } = trpc.skill.getRepository.useQuery({ id: repositoryID });
	return (
		<>
			<div className="z-1 sticky top-0 flex flex-col gap-0 border-light-border pt-0">
				{/*
				<SearchField
					placeholder="Suche nach Skill"
					// onChange={e => setTitle(e.target.value)}
				/>
				 <h1 className="p-4 text-3xl"> Skills </h1> */}
				{repository && <SkillTable repository={repository} tableTitle="Skills" />}
			</div>
		</>
	);
}

function LessonConfiguration() {
	return <h1 className="text-3xl">Konfiguration</h1>;
}

function Lessons() {
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

	return (
		<>
			<div className="z-1 sticky top-0 flex flex-col gap-0 border-light-border pt-0">
				<SearchField
					placeholder="Suche nach Titel"
					onChange={e => {
						setTitle(e.target.value);
					}}
				/>
				<h1 className="p-4 text-3xl">
					Lerneinheiten
					<span className="px-2 text-2xl font-thin text-light">
						{data?.result.length} / {data?.totalCount}
					</span>
				</h1>
				<Table
					head={
						<>
							<TableHeaderColumn>Bezeichnung</TableHeaderColumn>
						</>
					}
				>
					{data?.result.map(lesson => (
						<tr key={lesson.lessonId}>
							<TableDataColumn>
								<span>{lesson.title}</span>
							</TableDataColumn>
						</tr>
					))}
				</Table>
			</div>
		</>
	);
}
