import { da } from "date-fns/locale";
import { useRequiredSession } from "../../../../ui/layouts/src";

export function updateSessionData(data: unknown) {
	const session = useRequiredSession();

	if (session) {
		// session.data = data;
	}
}
