import { withTranslations } from "@self-learning/api";
import { CreatorAnalytics } from "@self-learning/analysis";
import { LoadingBox } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const getServerSideProps = withTranslations(["common", "student-analytics"]);

export default function CourseAnalyticsPage() {
	const { data: session, status } = useSession();
	const { query, isReady } = useRouter();
	if (status === "loading" || !isReady) return <LoadingBox />;
	if (!session?.user.isAuthor || typeof query.courseId !== "string") return null;
	return <CreatorAnalytics courseId={query.courseId} />;
}
