"use client";
import { Menu, MenuItem, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import React, { Fragment, useState } from "react";

export function Selection({
	value,
	onChange,
	disabled,
	content
}: {
	value: React.ReactNode;
	onChange: (index: number) => void;
	disabled: boolean;
	content: React.ReactNode[];
}) {
	const [isOpen, setIsOpen] = useState(false);

	const onClick = () => {
		if (disabled) return;
		setIsOpen(!isOpen);
	};

	const onSelection = (index: number) => {
		onChange(index);
		setIsOpen(false);
	};

	return (
		<div className="relative ml-1 mr-1 inline-block xl:ml-3 xl:mr-3">
			<div
				className={`select cursor-pointer ${
					disabled ? "bg-gray-300" : "bg-white"
				} rounded-lg focus:border-secondary focus:outline-none`}
				onClick={onClick}
			>
				<div className="mx-3 flex h-5 items-center justify-between">
					{content.length > 0 ? value : "No Content Provided"}
					{!isOpen ? (
						<ChevronLeftIcon className="text-primary my-5 flex h-5 w-5" />
					) : (
						<ChevronDownIcon className="text-primary my-5 flex h-5 w-5" />
					)}
				</div>
			</div>
			<Transition
				show={isOpen}
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu
					as="div"
					className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
				>
					{content.map((item, index) => (
						<MenuItem key={index}>
							{({ focus }) => (
								<div
									className={`${
										focus ? "bg-emerald-500 text-white" : ""
									} flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2`}
									onClick={() => onSelection(index)}
								>
									{item}
								</div>
							)}
						</MenuItem>
					))}
				</Menu>
			</Transition>
		</div>
	);
}
