"use client";

import { useSession } from "next-auth/react";

export default function CreatorAnalytics() {
	const { data: session } = useSession();
	const name = session?.user?.name || "Professor";

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold text-gray-900">
				Willkommen zurück, {name} – Ihre Kursanalysen sind bereit.
			</h1>
		</div>
	);
}
