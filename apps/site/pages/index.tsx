import Image from "next/image";
import Link from "next/link";

// import { ReactComponent as StudyingSvg } from "../svg/studying.svg";

export function LandingPage() {
	return (
		<div className="relative flex h-full flex-col gap-16 px-4">
			<div className="absolute left-4 top-4 flex flex-col text-sm text-slate-400">
				<Link href="/subjects" className="underline">
					Fachgebiete
				</Link>
				<Link
					href="/courses/the-beginners-guide-to-react/start-a-new-react-project"
					className="underline"
				>
					Example Lesson
				</Link>
				<Link href="/courses/the-beginners-guide-to-react" className="underline">
					Example Course
				</Link>
				<Link href="/teaching" className="underline">
					Teaching
				</Link>
				<Link href="/admin" className="underline">
					Admin
				</Link>
			</div>

			<div className="container mx-auto grid items-center py-24 lg:grid-cols-2 lg:py-48">
				<div className="flex max-w-2xl shrink-0 flex-col">
					<h1 className="text-5xl lg:text-8xl">SELF-le@rning</h1>
					<h2 className="mt-4 text-2xl font-light text-slate-400 lg:text-3xl">
						Universität Hildesheim
					</h2>

					<span className="mt-16 text-lg text-slate-600 md:text-xl">
						Willkommen auf der Selbstlernplattform der{" "}
						<Link
							href={"https://www.uni-hildesheim.de/"}
							target="_blank"
							className="font-medium hover:text-secondary"
						>
							Universität Hildesheim
						</Link>
						. Auf der Plattform werden dir studiengangbezogene Lerninhalte in
						individualisierten und flexiblen Lernpfaden, bestehend aus kleinen
						Lerneinheiten, präsentiert. Diese kannst du in deinem eigenen Tempo lernen
						und wiederholen. Während du einen Lernpfad durchläufst, erhältst du Feedback
						zu deinem Lernfortschritt und Hinweise, wie du Lernstrategien anwenden
						kannst, um dein Lernen zu verbessern. Unsere Mission ist, dass du durch die
						Plattform lernst, selbstgesteuert und nachhaltig zu lernen.
					</span>

					<button className="mt-16 w-fit rounded-lg bg-secondary px-12 py-3 text-xl font-semibold text-white">
						Call to Action
					</button>
				</div>

				<div className="pt-16 md:pt-0">
					{/* <StudyingSvg /> */}
					<Image
						priority
						className="shrink-0 rounded-lg bg-white object-cover"
						src="/logo-selflearning.png"
						width="293"
						height="3200"
						alt=""
					></Image>
				</div>
			</div>
		</div>
	);
}

export default LandingPage;
