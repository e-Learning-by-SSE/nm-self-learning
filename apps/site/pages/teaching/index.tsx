import { PlusIcon } from "@heroicons/react/solid";
import { CenteredSection } from "@self-learning/ui/layouts";
import Link from "next/link";

export default function TeachingPage() {
	return (
		<CenteredSection>
			<div className="flex flex-col gap-8">
				<Link href="/teaching/lessons/create">
					<a className="btn-primary w-fit">
						<PlusIcon className="h-5" />
						<span>Lerneinheit hinzufügen</span>
					</a>
				</Link>

				<Link href="/teaching/lessons/edit/die-neue-lerneinheit">
					<a className="btn-primary w-fit">
						<PlusIcon className="h-5" />
						<span>Lerneinheit editieren</span>
					</a>
				</Link>

				<Link href="/teaching/courses/create">
					<a className="btn-primary w-fit">
						<PlusIcon className="h-5" />
						<span>Kurs hinzufügen</span>
					</a>
				</Link>
			</div>
		</CenteredSection>
	);
}
