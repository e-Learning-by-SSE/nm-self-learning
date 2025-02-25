import { Unauthorized } from "@self-learning/ui/layouts";
import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"]);

export default function UnauthorizedPage() {
	return <Unauthorized></Unauthorized>;
}
