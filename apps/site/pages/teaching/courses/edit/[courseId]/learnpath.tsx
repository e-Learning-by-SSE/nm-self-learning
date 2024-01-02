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
		<div className=" bg-red-300">
			<div className="mx-auto mb-4 flex max-w-[1920px] border  border-gray-200 bg-white px-4 py-4">
				<h1 className="text-3xl">Lerneinheiten verknüpfen</h1>
			</div>
			<div className="mb-4 flex  border border-gray-200  bg-white  px-4 py-4">
				<h1 className="text-3xl">Abhängigkeitsvisualisierung</h1>
			</div>
			<div className="mx-auto  mb-4  flex max-w-[1920px] border border-gray-200  bg-white  px-4 py-4 pb-8">
				<h1 className="text-3xl">Lerneinheiten</h1>
			</div>
		</div>
	);
}
