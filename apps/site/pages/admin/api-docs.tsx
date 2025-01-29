import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { AdminGuard } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { CollapsibleBox } from "@self-learning/ui/common";

/**
 * Retrieves the OpenAPI spec from the server and renders SwaggerUI for testing.
 * Only Admins can access this page.
 * @returns
 */
export default function ApiDocs() {
	return (
		<AdminGuard>
			<div className="space-y-0 py-5 m-0 mx-auto max-w-[1460px] w-full">
				<BearerToken />
				<Swagger />
			</div>
		</AdminGuard>
	);
}

function BearerToken() {
	const { data } = trpc.admin.getAccessToken.useQuery();

	if (!data?.access_token) {
		return <></>;
	}

	return (
		<CollapsibleBox title="Bearer Token">
			<p className="font-bold">Hinweis:</p> Der Bearer Token wird nur zum Testen mit externen
			Tools benötigt, auf dieser Seite erfolgt die Authentifizierung über die Session.
			<p className="font-bold">Token:</p> <div className="break-all">{data.access_token}</div>
		</CollapsibleBox>
	);
}

function Swagger() {
	const [spec, setSpec] = useState(null);

	useEffect(() => {
		fetch("/api/openapi")
			.then(res => res.json())
			.then(setSpec);
	}, []);

	if (!spec) {
		return <div>Loading...</div>;
	}

	return <SwaggerUI spec={spec} />;
}
