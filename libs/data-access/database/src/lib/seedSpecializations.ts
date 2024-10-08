import { Prisma } from "@prisma/client";
import { createSpecialization } from "./seed-functions";
import { faker } from "@faker-js/faker";

export const specializations: Prisma.SpecializationCreateManyInput[] = [
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "wahrnehmung",
		title: "Wahrnehmung",
		subtitle:
			"Man spricht von Wahrnehmung (*perception*), wenn man sich mit der Integration und Interpretation von Reizen aus der Umwelt und dem Körperinnern beschäftigt.",
		imgUrlBanner:
			"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
		cardImgUrl:
			"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "aufmerksamkeit",
		title: "Aufmerksamkeit",
		subtitle:
			"Man spricht von Aufmerksamkeit (*attention*), wenn man sich mit der Fähigkeit, bestimmte Informationen für eine genauere Analyse auszuwählen und andere zu ignorieren, beschäftigt.",
		imgUrlBanner: "https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg",
		cardImgUrl: "https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "bewusstsein",
		title: "Bewusstsein",
		subtitle:
			"Man spricht einerseits von Bewusstsein (*consciousness*), wenn das wache Wissen um das Erleben sowie das Aufmerken auf einzelne Erlebnisse und andererseits das wache Wissen um das kontrollierte und initiierte Handeln gemeint ist. Auch die Gesamtheit der unmittelbaren Erfahrung, die sich aus der Wahrnehmung von sich selbst und der Umgebung, den eigenen Kognitionen, Vorstellungen und Gefühlen zusammensetzt wird als Bewusstsein bezeichnet. ",
		imgUrlBanner:
			"https://c.pxhere.com/photos/f5/82/head_psychology_thoughts_think_perception_face_woman_psyche-1192085.jpg!d",
		cardImgUrl:
			"https://c.pxhere.com/photos/f5/82/head_psychology_thoughts_think_perception_face_woman_psyche-1192085.jpg!d"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "lernen",
		title: "Lernen",
		subtitle:
			"Man spricht von Lernen (*learning*), wenn es sich um eine relativ permanente Veränderung des Verhaltens als Folge von vorausgehender Erfahrung handelt.",
		imgUrlBanner: "https://www.kikisweb.de/geschichten/maerchen/nuernb1.gif",
		cardImgUrl: "https://www.kikisweb.de/geschichten/maerchen/nuernb1.gif"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "gedächtnis-und-wissen",
		title: "Gedächtnis und Wissen",
		subtitle:
			"Man spricht von Gedächtnis (*memory*), wenn man sich über das dauerhafte Fortbestehen von aufgenommenen Informationen über die Zeit, die dann wieder abrufbar sind, Gedanken macht.",
		imgUrlBanner:
			"https://static.spektrum.de/fm/912/f2000x857/Memory_pixabay48118_Nemo-CC0.png",
		cardImgUrl: "https://static.spektrum.de/fm/912/f2000x857/Memory_pixabay48118_Nemo-CC0.png"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "sprache",
		title: "Sprache",
		subtitle:
			"Mit Sprache (*speech*) ist die Fähigkeit des Menschen gemeint, durch ein komplexes System von Symbolen und Regeln, miteinander zu kommunizieren.",
		imgUrlBanner:
			"https://c.pxhere.com/images/5e/d6/a2ff24ae9521a8904c5fbab3fd89-1437965.jpg!d",
		cardImgUrl: "https://c.pxhere.com/images/5e/d6/a2ff24ae9521a8904c5fbab3fd89-1437965.jpg!d"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "motivation-und-volition",
		title: "Motivation und Volition",
		subtitle:
			"Man spricht von Motivation (*motivation*), wenn man die Gesamtheit der Beweggründe (Motive), die zur Handlungsbereitschaft führen, meint. Die Umsetzung von Motiven in Handlungen nennt man Volition (*volition*).",
		imgUrlBanner:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png",
		cardImgUrl:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "denken-problemloesen-entscheiden-urteilen",
		title: "Denken, Problemlösen, Entscheiden und Urteilen",
		subtitle:
			"Man spricht von Denken (*thinking*), wenn die interpretierende und ordnungsstiftende Verarbeitung von Informationen gemeint ist. Beim Problemlösen (*problem solving*) geht es um das Auffinden eines vorher nicht bekannten Weges von einem gegebenen Anfangszustand zu einem gewünschten und mehr oder weniger genau bekannten Endzustand. Das Entscheiden (*decision making*) betrifft die menschlichen Prozesse beim Wählen zwischen Alternativen und beim Urteilen (*judgment*) geht es um das Schlussfolgern aufgrund von Erfahrung.",
		imgUrlBanner:
			"https://images.pexels.com/photos/814133/pexels-photo-814133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
		cardImgUrl:
			"https://images.pexels.com/photos/814133/pexels-photo-814133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "emotion",
		title: "Emotion",
		subtitle:
			"Man spricht von Emotionen (*emotions*), wenn es sich um ein komplexes Muster von Veränderungen handelt. Dabei umfassen dieese physiologische Erregung, Gefühle, kognitive Prozesse (Bewertungen) und Verhaltensreaktionen auf eine Situation, die als persönlich bedeutsam wahrgenommen wurde.",
		imgUrlBanner:
			"https://www.kikidan.com/wp-content/uploads/2021/02/smiley-parade-gefuehle-emotionen-300x300.png",
		cardImgUrl:
			"https://www.kikidan.com/wp-content/uploads/2021/02/smiley-parade-gefuehle-emotionen-300x300.png"
	}),
	createSpecialization({
		subjectId: "psychologie",
		specializationId: "handlung-bewegung-psychomotorik",
		title: "Handlung, Bewegung und Psychomotorik",
		subtitle:
			"Man spricht von Handlungen (*action*), wenn es um motorische Aktivitäten geht, um einen angestrebten Zielzustand zu verwirklichen.",
		imgUrlBanner:
			"https://www.spielundlern.de/wissen/wp-content/uploads/2017/04/kinder-bewegung-psychomotorik-768x235.png",
		cardImgUrl:
			"https://www.spielundlern.de/wissen/wp-content/uploads/2017/04/kinder-bewegung-psychomotorik-768x235.png"
	}),
	createSpecialization({
		subjectId: "mathematik",
		specializationId: "didaktik-der-geometrie",
		title: "Didaktik der Geometrie",
		subtitle:
			"Didaktik der Geometrie: geometrische Begriffsbildung, Figuren und Körper, Maße und Größen, Beweisen und Argumentieren im Geometrieunterricht, geometrisches Problemlösen, Konstruieren, dynamische Geometriesysteme im Mathematikunterricht, Anwendungen der Geometrie samt ihren didaktischen Theorien kennen und schulbezogen anwenden können; Lern-, Lehr- und Übungsumgebungen sowie Prüfungsanlässe mit geometrischen Bezügen beurteilen, gestalten und variieren",
		imgUrlBanner:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png",
		cardImgUrl:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png"
	}),
	createSpecialization({
		subjectId: "mathematik",
		specializationId: "didaktik-der-dlgebra",
		title: "Didaktik der Algebra",
		subtitle: "",
		imgUrlBanner:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Algebra.png",
		cardImgUrl:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Algebra.png"
	}),
	createSpecialization({
		subjectId: "mathematik",
		specializationId: "didaktik-des-funktionalen-denkens",
		title: "Didaktik des funktionalen Denkens",
		subtitle: "",
		imgUrlBanner:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_des_funktionalen_Denkens.png",
		cardImgUrl:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_des_funktionalen_Denkens.png"
	}),
	createSpecialization({
		subjectId: "mathematik",
		specializationId: "analysis",
		title: "Analysis",
		subtitle: "",
		imgUrlBanner: "https://staging.sse.uni-hildesheim.de:9006/upload/analysis/R-n.png",
		cardImgUrl: "https://staging.sse.uni-hildesheim.de:9006/upload/analysis/R-n.png"
	}),
	createSpecialization({
		subjectId: "mathematik",
		specializationId: "geometrie",
		title: "Geometrie",
		subtitle: "",
		imgUrlBanner:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Geometrie.jpg",
		cardImgUrl:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Geometrie.jpg"
	}),
	createSpecialization({
		subjectId: "mathematik",
		specializationId: "algebra",
		title: "Algebra",
		subtitle: "",
		imgUrlBanner:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Algebra.png",
		cardImgUrl:
			"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Algebra.png"
	})
];

export const softwareentwicklungDemoSpecialization: Prisma.SpecializationCreateManyInput[] = [
	{
		specializationId: "softwareentwicklung",
		subjectId: "informatik",
		slug: "softwareentwicklung",
		title: "Softwareentwicklung",
		subtitle: faker.lorem.sentences(2),
		cardImgUrl:
			"https://images.unsplash.com/photo-1580920461931-fcb03a940df5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
		imgUrlBanner:
			"https://images.unsplash.com/photo-1580920461931-fcb03a940df5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
	}
];
