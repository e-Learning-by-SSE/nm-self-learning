import {
	DropdownDialog,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { SkillTable } from "libs/feature/teaching/src/lib/skills/folder-editor/folder-list-view";
import { Fragment, useState } from "react";
import { useRouter } from "next/router";
import { Combobox } from "@headlessui/react";

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
				{/* <DropdownMenu open={true} /> */}
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

function DropdownMenu({ open }: { open: boolean }) {
	// State to track whether the dropdown is open or closed
	const [isOpen, setIsOpen] = useState(false);

	// Toggle the dropdown state
	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	// Function to handle item selection
	const handleItemClick = (item: string) => {
		console.log(`Selected item: ${item}`);
		// Additional logic can be added here based on the selected item
		// For example, you can close the dropdown after selecting an item
		setIsOpen(false);
	};

	const testData = [
		{ slug: "jjj", displayName: "1", username: "username1" },
		{ slug: "jjj", displayName: "2", username: "username2" }
	];

	function handleClose() {
		console.log("handle Close triggered");
	}

	return (
		<DropdownDialog.Dialog open={open} onClose={handleClose}>
			<Combobox value={null}>
				{/**
				 <DropdownDialog.SearchInput
					filter={filter}
					setFilter={setFilter}
					placeholder="Suche nach Autor"
				/>
				 */}

				<DropdownDialog.Options>
					{testData.map(author => (
						<Combobox.Option value={author} key={author.slug} as={Fragment}>
							{() => (
								<button
									type="button"
									data-testid="author-option"
									className={`flex items-center gap-4 rounded px-4 py-2 `}
								>
									<div className="flex flex-col">
										<span className="text-sm font-medium">
											{author.displayName}
										</span>
										<span className={`text-start text-xs `}>
											{author.username}
										</span>
									</div>
								</button>
							)}
						</Combobox.Option>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
		/*
		<ul className="dropdown">
			{submenus.map((submenu, index) => (
				<li key={index} className="menu-items bg-white text-base">
					<p>{submenu.title}</p>
				</li>
			))}
		</ul>
		<div className="dropdown">
			<button
				className="w-min-300 m-2 border border-gray-300 bg-white py-1 px-1"
				onClick={toggleDropdown}
			>
				Filter nach
			</button>

			{isOpen && (
				<div className="dropdown-content">
					<div onClick={() => handleItemClick("Item 1")}>Item 1</div>
					<div onClick={() => handleItemClick("Item 2")}>Item 2</div>
					<div onClick={() => handleItemClick("Item 3")}>Item 3</div>
				</div>
			)}
		</div>
		*/
	);
}
