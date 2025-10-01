"use client";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { useTranslation } from "next-i18next";

export function ExpandableSettingsSection({
	title,
	text,
	children
}: {
	title: string;
	text: string;
	children?: React.ReactNode;
}) {

	const { t: t_feature } = useTranslation("feature-settings");

	return (
		<section className="mt-5 rounded-lg bg-white p-3.5">
			<Disclosure>
				{({ open }) => (
					<>
						<header className="flex items-center justify-between">
							<span className="font-medium" title={title}>
								{text}
							</span>
							{children && (
								<DisclosureButton className="text-blue-500 hover:underline px-2">
									{t_feature(open ? "Show less" : "Show more")}
								</DisclosureButton>
							)}
						</header>
						<DisclosurePanel className="mt-2">{children}</DisclosurePanel>
					</>
				)}
			</Disclosure>
		</section>
	);
}
