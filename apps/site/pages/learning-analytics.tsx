"use client";

import { withTranslations } from "@self-learning/api";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { StudentAnalytics } from "@self-learning/analysis";
import { CreatorAnalytics } from "@self-learning/analysis";
import { Tab, Tabs } from "@self-learning/ui/common";

export const getServerSideProps = withTranslations(["common", "student-analytics"]);

/*
----------------------------------------------------------
 Active Logic: Role-Based Learning Analytics Page
----------------------------------------------------------
*/
export default function LearningAnalyticsPage() {
	const { data: session } = useSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const user = session?.user;

	if (!user) {
		return <p className="p-6">Loading...</p>;
	}

	const showCreatorAnalytics = user.role === "ADMIN" || user.isAuthor;

	// Show only student analytics if the user is not a creator
	if (!showCreatorAnalytics) {
		return (
			<div className="bg-gray-50 min-h-screen">
				<StudentAnalytics />
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
				<Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
					<Tab>Creator Analytics</Tab>
					<Tab>My Learning Analytics</Tab>
				</Tabs>

				{selectedTab === 0 ? <CreatorAnalytics /> : <StudentAnalytics />}
			</div>
		</div>
	);
}
