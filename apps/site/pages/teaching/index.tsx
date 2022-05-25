import { PlusIcon } from "@heroicons/react/solid";
import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";

export default function TeachingPage() {
	return (
		<>
			<CenteredSection>
				<Link href="/teaching/lessons/create">
					<a className="btn-primary w-fit">
						<PlusIcon className="h-5" />
						<span>Lerneinheit hinzufügen</span>
					</a>
				</Link>
			</CenteredSection>
		</>
	);
}
