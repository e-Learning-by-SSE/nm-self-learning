import { trpc } from "@self-learning/api-client";
import { License } from "@self-learning/types";
import { LoadingBox } from "@self-learning/ui/common";

// Handles loading of licenses and makes them selectable afterwards
export function LicenseEditor({ licenseId }: { licenseId?: number }) {
	const { data: licenses, isLoading } = trpc.licenseRouter.getAll.useQuery();

	if (isLoading) {
		return <LoadingBox />;
	} else {
		return <OptionalLicenseSelector licenses={licenses} licenseId={licenseId} />;
	}
}

// Checks and handles if there are no licenses available
function OptionalLicenseSelector({
	licenses,
	licenseId
}: {
	licenses?: License[];
	licenseId?: number;
}) {
	if (licenses && licenses.length > 0) {
		return <LicenseSelector licenses={licenses} licenseId={licenseId} />;
	} else {
		return <p>No Licenses available</p>;
	}
}

// Makes licenses selectable after checking if there are any
function LicenseSelector({ licenses, licenseId }: { licenses: License[]; licenseId?: number }) {
	const selectedLicense = licenseId ? licenseId : 1;
	console.log(licenses);

	return (
		<select className="textfield w-64 rounded-lg px-8" defaultValue={selectedLicense}>
			{licenses
				.filter(license => license.selectable)
				.map(license => (
					<option
						key={license.licenseId}
						value={license.name}
						className={license.oerCompatible ? "text-black" : "text-gray-400"}
					>
						{license.name}
					</option>
				))}
		</select>
	);
}
