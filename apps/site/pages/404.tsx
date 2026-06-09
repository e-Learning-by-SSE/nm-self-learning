import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"]);

export default function PageNotFound() {
	return <div>404</div>;
}
