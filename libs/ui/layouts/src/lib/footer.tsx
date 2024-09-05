import { LinkIcon } from "@heroicons/react/24/outline";
import { trpc } from "@self-learning/api-client";
import { StudentSettingsDialog } from "@self-learning/settings";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";

function FooterElement({
	href,
	target = "_blank",
	text
}: {
	href: string;
	target?: string;
	text: string;
}) {
	return (
		<Link href={href} target={target} className="text-sm font-medium hover:text-secondary">
			{text}
		</Link>
	);
}

export function Footer() {
	const { data: studentSettings, isLoading } = trpc.settings.getMySetting.useQuery();
	const [studentSettingsDialogOpen, setStudentSettingsDialogOpen] = useState(true);


	const isFirstLogin = useMemo(
		() => studentSettings === null,
		[studentSettings]
	);

	return (
		<>
			{!isLoading && isFirstLogin && studentSettingsDialogOpen && (
				<StudentSettingsDialog
					onClose={() => {
						setStudentSettingsDialogOpen(false);
					}}
					initialSettings={{
						hasLearningDiary: false,
						learningStatistics: false,
						...studentSettings
					}}
				/>
			)}
			<footer className="border-t-gray border-t bg-white px-6 py-2 text-light">
				<div
					className="mx-auto flex flex-col items-center justify-between md:flex-row"
					style={{ maxWidth: "1200px" }}
				>
					<div className="mb-2 text-center md:mb-0 md:text-left">
						<Link
							href="https://sse.uni-hildesheim.de"
							className="inline-flex items-center"
						>
							<p className="mt-1 text-sm">
								© 2023 Universität Hildesheim. Hosted by SSE
							</p>
							<LinkIcon height="18" className="ml-1 mt-1" />
						</Link>
					</div>
					<div className="flex space-x-4">
						<FooterElement
							href="https://www.uni-hildesheim.de/digital-campus-learning/self-learning/"
							text="About"
						/>
						<FooterElement
							href="https://hilnet.uni-hildesheim.de/s/self-le-at-rning-development-blog/"
							text="Blog"
						/>
						<FooterElement
							href="https://uni-hildesheim.de/datenschutz"
							text="Datenschutz"
						/>
						<FooterElement
							href="https://www.uni-hildesheim.de/impressum/"
							text="Impressum"
						/>
					</div>
				</div>
			</footer>
		</>
	);
}
