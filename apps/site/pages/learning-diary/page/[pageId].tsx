import { withAuth, withTranslations } from "@self-learning/api";
import {
	allPages,
	DiaryContentForm,
	DiaryLayout,
	getAllStrategies,
	PagesMeta,
	Strategy
} from "@self-learning/diary";
import { subMilliseconds } from "date-fns";

export const getServerSideProps = withTranslations(
	["common"],
	withAuth(async (context, user) => {
		const pageId = context.params?.pageId;
		const pages = await allPages(user.name);
		const availableStrategies = await getAllStrategies();

		const pageExists = pages.some(page => page.id === pageId);
		if (!pageExists) {
			return {
				notFound: true
			};
		}

		return {
			props: {
				diaryId: pageId,
				pages,
				availableStrategies
			}
		};
	})
);

DiaryPageDetail.getLayout = DiaryLayout;

export default function DiaryPageDetail({
	diaryId,
	pages,
	availableStrategies,
}: {
	diaryId: string;
	pages: PagesMeta;
	availableStrategies: Strategy[];
}) {
	// Identify the end date of the page, required for computations / filtering of details
	const index = pages.findIndex(page => page.id === diaryId);
	let endDate = index >= 0 && index < pages.length - 1 ? pages[index + 1].createdAt : new Date();
	endDate = subMilliseconds(endDate, 1); // subtract 1 ms to avoid fetching data of the next page

	return (
			<DiaryContentForm
				key={diaryId}
				diaryId={diaryId}
				availableStrategies={availableStrategies}
				endDate={endDate}
			/>
	);
}
