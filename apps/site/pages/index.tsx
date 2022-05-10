import Link from "next/link";
import { ReactComponent as StudyingSvg } from "../svg/studying.svg";

export function LandingPage() {
	return (
		<div className="relative flex h-full flex-col gap-16">
			<div className="absolute left-4 top-4 flex flex-col text-sm text-slate-400">
				<Link href="/subjects">
					<a className="underline">Fachgebiete</a>
				</Link>
				<Link href="/lessons/a-beginners-guide-to-react-introduction">
					<a className="underline">Example Lesson</a>
				</Link>
				<Link href="/courses/the-example-course">
					<a className="underline">Example Course</a>
				</Link>
			</div>
			<div className="mx-auto flex flex-wrap gap-32 px-64">
				<div className="z-20 flex max-w-2xl shrink-0 flex-col py-48">
					<h1 className="text-8xl">SELF-le@rning</h1>
					<h2 className="mt-4 text-3xl font-light text-slate-400">
						Universität Hildesheim
					</h2>

					<span className="mt-16 text-xl text-slate-600">
						Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos, nisi. Vitae
						magnam perferendis officia, fugiat a, odit velit deleniti consequatur
						dignissimos sit esse itaque soluta ex corrupti accusantium illo numquam.
					</span>

					<button className="btn-primary mt-16 w-fit">Call to Action</button>
				</div>
				<div className="h-[728px] w-[728px] shrink-0 pt-32">
					<StudyingSvg />
				</div>
			</div>
		</div>
	);
}

export default LandingPage;
