import { useRouter } from "next/router";

export default function LessonPreview() {
	const router = useRouter();
	const { data, origin } = router.query;

	let lesson = null;
	try {
		lesson = data ? JSON.parse(data as string) : null;
	} catch (error) {
		console.error("parsing error", error);
	}
	console.log("lesson: ", lesson);

	function redirectBackToEditor() {
		let originPathname = "/";

		if (Array.isArray(origin)) {
			originPathname = origin[0];
		}

		if (typeof origin === "string") {
			originPathname = origin;
		}

		router.push(originPathname);
	}

	return (
		<>
			<div>
				<button className="btn-primary" onClick={redirectBackToEditor}>
					Zurück zum Editor
				</button>
				<p>Lesson title: {lesson?.title}</p>
			</div>
		</>
	);
}
