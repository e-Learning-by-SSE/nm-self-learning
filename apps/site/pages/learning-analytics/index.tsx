"use client";

import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { StudentAnalytics } from "@self-learning/analysis";
import { CreatorAnalytics } from "@self-learning/analysis";
import { LoadingBox, Tab, Tabs } from "@self-learning/ui/common";
import { useEnrollments } from "@self-learning/enrollment";

export const getServerSideProps = withTranslations(["common", "student-analytics"]);

/*
----------------------------------------------------------
 Active Logic: Role-Based Learning Analytics Page
----------------------------------------------------------
*/
export default function LearningAnalyticsPage() {
	const { t } = useTranslation("student-analytics");
	const { data: session } = useSession();
	const enrollments = useEnrollments();
	const [selectedTab, setSelectedTab] = useState(0);
	const user = session?.user;

	if (!user) {
		return <LoadingBox />;
	}

	const isCreator = user.isAuthor;
	const isOnlyCreator = user.isAuthor && (enrollments?.length ?? 0) == 0;

	// Show only student analytics if the user is not a creator
	if (!isCreator && (enrollments?.length ?? 0) > 0) {
		return (
			<div className="bg-gray-50 min-h-screen">
				<StudentAnalytics />
			</div>
		);
	}

	// User is creator but also enrolled (participates as student)
	if (isCreator && (enrollments?.length ?? 0) > 0) {
		return (
			<div className="bg-gray-50 min-h-screen">
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
						<Tab>{t("Creator_Analytics")}</Tab>
						<Tab>{t("My_Learning_Analytics")}</Tab>
					</Tabs>

					{selectedTab === 0 ? <CreatorAnalytics /> : <StudentAnalytics />}
				</div>
			</div>
		);
	}

	// Show only creator analytics if the user is not only a creator
	if (isOnlyCreator) {
		return (
			<div className="bg-gray-50 min-h-screen">
				<CreatorAnalytics />
			</div>
		);
	}

	// Student, that has not started to learn
	return (
		<div className="bg-gray-50 min-h-screen">
			<h1
				id="student-analytics-title"
				data-testid="student-analytics-startup-title"
				className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center sm:text-left mt-6 mb-8 leading-snug"
			>
				{t("pageTitle_not_started", { name: user?.name || "" })}
			</h1>
		</div>
	);
}
