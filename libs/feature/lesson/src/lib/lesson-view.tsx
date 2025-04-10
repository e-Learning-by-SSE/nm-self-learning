import { trpc } from "@self-learning/api-client";
import { LessonLayoutProps } from "@self-learning/lesson";
import { CompiledMarkdown } from "@self-learning/markdown";
import {
	findContentType,
	getContentTypeDisplayName,
	includesMediaType,
	LessonContent
} from "@self-learning/types";
import { AuthorsList, LicenseChip, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "@self-learning/local-storage";

export type LessonProps = LessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
};

export function usePreferredMediaType(lesson: LessonProps["lesson"]) {
	// Handle situations that content creator may created an empty lesson (to add content later)
	const content = lesson.content as LessonContent;
	const router = useRouter();

	let preferredMediaType = content.length > 0 ? content[0].type : "video";

	if (content.length > 0) {
		const availableMediaTypes = content.map(c => c.type);

		const { type: typeFromRoute } = router.query;
		const typeFromStorage = loadFromLocalStorage("user_preferredMediaType");

		const { isIncluded, type } = includesMediaType(
			availableMediaTypes,
			(typeFromRoute as string) ?? typeFromStorage
		);

		if (isIncluded) {
			preferredMediaType = type;
		}
	}
	return preferredMediaType;
}

export function DefaultLicenseLabel() {
	const { data, isLoading } = trpc.licenseRouter.getDefault.useQuery();
	const fallbackLicense = {
		name: "Keine Lizenz verfügbar",
		logoUrl: "",
		url: "",
		oerCompatible: false,
		licenseText:
			"*Für diese Lektion ist keine Lizenz verfügbar. Bei Nachfragen, wenden Sie sich an den Autor*"
	};
	if (!isLoading && !data) {
		console.log("No default license found");
	}
	if (isLoading) return null;
	return <LicenseLabel license={data ?? fallbackLicense} />;
}

export function LicenseLabel({
	license
}: {
	license: NonNullable<LessonProps["lesson"]["license"]>;
}) {
	return (
		<LabeledField label="Lizenz">
			<LicenseChip
				name={license.name}
				imgUrl={license.logoUrl ?? undefined}
				description={license.licenseText ?? undefined}
				url={license.url ?? undefined}
			/>
		</LabeledField>
	);
}

export function Authors({ authors }: { authors: LessonProps["lesson"]["authors"] }) {
	return (
		<>
			{authors.length > 0 && (
				<div className="mt-4">
					<AuthorsList authors={authors} />
				</div>
			)}
		</>
	);
}

export function MediaTypeSelector({
	lesson,
	course
}: {
	course?: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const lessonContent = lesson.content as LessonContent;
	// If no content is specified at this time, use video as default (and don't s´display anything)
	const preferredMediaType = usePreferredMediaType(lesson);
	const { index } = findContentType(preferredMediaType, lessonContent);
	const [selectedIndex, setSelectedIndex] = useState(index);
	const router = useRouter();

	function changeMediaType(index: number) {
		const type = lessonContent[index].type;
		saveToLocalStorage("user_preferredMediaType", type);

		let url = `/lessons/${lesson.slug}?type=${type}`;

		if (course) {
			url = `/courses/${course.slug}/${lesson.slug}?type=${type}`;
		}

		router.push(url, undefined, {
			shallow: true
		});

		setSelectedIndex(index);
	}

	useEffect(() => {
		if (selectedIndex !== index) {
			setSelectedIndex(index);
		}
	}, [index, selectedIndex, setSelectedIndex]);

	return (
		<>
			{lessonContent.length > 1 && (
				<Tabs selectedIndex={selectedIndex} onChange={changeMediaType}>
					{lessonContent.map((content, idx) => (
						<Tab key={idx}>
							<span data-testid="mediaTypeTab">
								{getContentTypeDisplayName(content.type)}
							</span>
						</Tab>
					))}
				</Tabs>
			)}
		</>
	);
}

export function SelfRegulatedPreQuestion({
	question,
	setShowDialog
}: {
	question: CompiledMarkdown;
	setShowDialog: Dispatch<SetStateAction<boolean>>;
}) {
	const [userAnswer, setUserAnswer] = useState("");

	return (
		<div>
			<h1>Aktivierungsfrage</h1>
			<MarkdownContainer className="w-full py-4">
				<MDXRemote {...question} />
			</MarkdownContainer>
			<div className="mt-8">
				<h2>Deine Antwort:</h2>
				<textarea
					className="w-full"
					placeholder="..."
					onChange={e => setUserAnswer(e.target.value)}
				/>
			</div>
			<div className="mt-2 flex justify-end gap-2">
				<button
					type="button"
					className="btn-primary"
					onClick={() => {
						setShowDialog(false);
					}}
					disabled={userAnswer.length == 0}
				>
					Antwort Speichern
				</button>
			</div>
		</div>
	);
}
