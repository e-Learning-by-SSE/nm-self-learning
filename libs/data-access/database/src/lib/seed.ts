/* eslint-disable quotes */
import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

import { mathExample } from "./math/math-example";
import { psychologyExample } from "./psychology/psychology-example";
import { createSpecialization } from "./seed-functions";
import { seedDemos } from "./demo/demo";

const prisma = new PrismaClient();

const subjects: Prisma.SubjectCreateManyInput[] = [
	{
		subjectId: "mathematik",
		slug: "mathematik",
		title: "Mathematik",
		subtitle:
			'Weiterbildungsangebote im Bereich der "Didaktik der Mathematik" sowie der "Fachmathematik"',
		cardImgUrl:
			"https://images.unsplash.com/photo-1509869175650-a1d97972541a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
		imgUrlBanner:
			"https://images.unsplash.com/photo-1635372722656-389f87a941b7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80"
	},
	{
		subjectId: "psychologie",
		slug: "psychologie",
		title: "Psychologie",
		subtitle: 'Grundlagen der "Allgemeinen Psychologie"',
		cardImgUrl:
			"https://c.pxhere.com/photos/90/ed/brain_mind_psychology_idea_hearts_love_drawing_split_personality-1370218.jpg!d",
		imgUrlBanner:
			"https://c.pxhere.com/photos/90/ed/brain_mind_psychology_idea_hearts_love_drawing_split_personality-1370218.jpg!d"
	}
];

const specializations: Prisma.SpecializationCreateManyInput[] = [
	createSpecialization(
		"psychologie",
		"wahrnehmung",
		"Wahrnehmung",
		"Man spricht von Wahrnehmung (*perception*), wenn man sich mit der Integration und Interpretation von Reizen aus der Umwelt und dem Körperinnern beschäftigt.",
		"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
		"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg"
	),
	createSpecialization(
		"psychologie",
		"aufmerksamkeit",
		"Aufmerksamkeit",
		"Man spricht von Aufmerksamkeit (*attention*), wenn man sich mit der Fähigkeit, bestimmte Informationen für eine genauere Analyse auszuwählen und andere zu ignorieren, beschäftigt.",
		"https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg",
		"https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg"
	),
	createSpecialization(
		"psychologie",
		"bewusstsein",
		"Bewusstsein",
		"Man spricht einerseits von Bewusstsein (*consciousness*), wenn das wache Wissen um das Erleben sowie das Aufmerken auf einzelne Erlebnisse und andererseits das wache Wissen um das kontrollierte und initiierte Handeln gemeint ist. Auch die Gesamtheit der unmittelbaren Erfahrung, die sich aus der Wahrnehmung von sich selbst und der Umgebung, den eigenen Kognitionen, Vorstellungen und Gefühlen zusammensetzt wird als Bewusstsein bezeichnet. ",
		"https://c.pxhere.com/photos/f5/82/head_psychology_thoughts_think_perception_face_woman_psyche-1192085.jpg!d",
		"https://c.pxhere.com/photos/f5/82/head_psychology_thoughts_think_perception_face_woman_psyche-1192085.jpg!d"
	),
	createSpecialization(
		"psychologie",
		"lernen",
		"Lernen",
		"Man spricht von Lernen (*learning*), wenn es sich um eine relativ permanente Veränderung des Verhaltens als Folge von vorausgehender Erfahrung handelt.",
		"https://www.kikisweb.de/geschichten/maerchen/nuernb1.gif",
		"https://www.kikisweb.de/geschichten/maerchen/nuernb1.gif"
	),
	createSpecialization(
		"psychologie",
		"gedächtnis-und-wissen",
		"Gedächtnis und Wissen",
		"Man spricht von Gedächtnis (*memory*), wenn man sich über das dauerhafte Fortbestehen von aufgenommenen Informationen über die Zeit, die dann wieder abrufbar sind, Gedanken macht.",
		"https://static.spektrum.de/fm/912/f2000x857/Memory_pixabay48118_Nemo-CC0.png",
		"https://static.spektrum.de/fm/912/f2000x857/Memory_pixabay48118_Nemo-CC0.png"
	),
	createSpecialization(
		"psychologie",
		"sprache",
		"Sprache",
		"Mit Sprache (*speech*) ist die Fähigkeit des Menschen gemeint, durch ein komplexes System von Symbolen und Regeln, miteinander zu kommunizieren.",
		"https://c.pxhere.com/images/5e/d6/a2ff24ae9521a8904c5fbab3fd89-1437965.jpg!d",
		"https://c.pxhere.com/images/5e/d6/a2ff24ae9521a8904c5fbab3fd89-1437965.jpg!d"
	),
	createSpecialization(
		"psychologie",
		"motivation-und-volition",
		"Motivation und Volition",
		"Man spricht von Motivation (*motivation*), wenn man die Gesamtheit der Beweggründe (Motive), die zur Handlungsbereitschaft führen, meint. Die Umsetzung von Motiven in Handlungen nennt man Volition (*volition*).",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png"
	),
	createSpecialization(
		"psychologie",
		"denken-problemloesen-entscheiden-urteilen",
		"Denken, Problemlösen, Entscheiden und Urteilen",
		"Man spricht von Denken (*thinking*), wenn die interpretierende und ordnungsstiftende Verarbeitung von Informationen gemeint ist. Beim Problemlösen (*problem solving*) geht es um das Auffinden eines vorher nicht bekannten Weges von einem gegebenen Anfangszustand zu einem gewünschten und mehr oder weniger genau bekannten Endzustand. Das Entscheiden (*decision making*) betrifft die menschlichen Prozesse beim Wählen zwischen Alternativen und beim Urteilen (*judgment*) geht es um das Schlussfolgern aufgrund von Erfahrung.",
		"https://images.pexels.com/photos/814133/pexels-photo-814133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
		"https://images.pexels.com/photos/814133/pexels-photo-814133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
	),
	createSpecialization(
		"psychologie",
		"emotion",
		"Emotion",
		"Man spricht von Emotionen (*emotions*), wenn es sich um ein komplexes Muster von Veränderungen handelt. Dabei umfassen dieese physiologische Erregung, Gefühle, kognitive Prozesse (Bewertungen) und Verhaltensreaktionen auf eine Situation, die als persönlich bedeutsam wahrgenommen wurde.",
		"https://www.kikidan.com/wp-content/uploads/2021/02/smiley-parade-gefuehle-emotionen-300x300.png",
		"https://www.kikidan.com/wp-content/uploads/2021/02/smiley-parade-gefuehle-emotionen-300x300.png"
	),
	createSpecialization(
		"psychologie",
		"handlung-bewegung-psychomotorik",
		"Handlung, Bewegung und Psychomotorik",
		"Man spricht von Handlungen (*action*), wenn es um motorische Aktivitäten geht, um einen angestrebten Zielzustand zu verwirklichen.",
		"https://www.spielundlern.de/wissen/wp-content/uploads/2017/04/kinder-bewegung-psychomotorik-768x235.png",
		"https://www.spielundlern.de/wissen/wp-content/uploads/2017/04/kinder-bewegung-psychomotorik-768x235.png"
	),
	createSpecialization(
		"mathematik",
		"didaktik-der-geometrie",
		"Didaktik der Geometrie",
		"Didaktik der Geometrie: geometrische Begriffsbildung, Figuren und Körper, Maße und Größen, Beweisen und Argumentieren im Geometrieunterricht, geometrisches Problemlösen, Konstruieren, dynamische Geometriesysteme im Mathematikunterricht, Anwendungen der Geometrie samt ihren didaktischen Theorien kennen und schulbezogen anwenden können; Lern-, Lehr- und Übungsumgebungen sowie Prüfungsanlässe mit geometrischen Bezügen beurteilen, gestalten und variieren",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png"
	),
	createSpecialization(
		"mathematik",
		"didaktik-der-dlgebra",
		"Didaktik der Algebra",
		"",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Algebra.png",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Algebra.png"
	),
	createSpecialization(
		"mathematik",
		"didaktik-des-funktionalen-denkens",
		"Didaktik des funktionalen Denkens",
		"",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_des_funktionalen_Denkens.png",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_des_funktionalen_Denkens.png"
	),
	createSpecialization(
		"mathematik",
		"analysis",
		"Analysis",
		"",
		"https://staging.sse.uni-hildesheim.de:9006/upload/analysis/R-n.png",
		"https://staging.sse.uni-hildesheim.de:9006/upload/analysis/R-n.png"
	),
	createSpecialization(
		"mathematik",
		"geometrie",
		"Geometrie",
		"",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Geometrie.jpg",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Geometrie.jpg"
	),
	createSpecialization(
		"mathematik",
		"algebra",
		"Algebra",
		"",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Algebra.png",
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Algebra.png"
	)
];

const license: Prisma.LicenseCreateManyInput[] = [
	// Default License -> Should come first
	{
		licenseId: 1,
		name: "CC BY 4.0",
		url: "https://creativecommons.org/licenses/by/4.0/deed.de",
		logoUrl: "https://licensebuttons.net/l/by/3.0/88x31.png",
		oerCompatible: false,
		selectable: true
	},
	{
		licenseId: 2,
		name: "CC BY SA 4.0",
		url: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
		logoUrl: "https://licensebuttons.net/l/by-sa/3.0/88x31.png",
		oerCompatible: false,
		selectable: true
	},
	{
		licenseId: 3,
		name: "CC 4.0",
		url: "https://creativecommons.org/publicdomain/zero/1.0/deed.de",
		logoUrl: "https://mirrors.creativecommons.org/presskit/icons/cc.png",
		oerCompatible: false,
		selectable: true
	},

	// Should come last
	{
		licenseId: 100,
		name: "Uni Hi Intern",
		licenseText:
			"Nur für die interne Verwendung an der Universität Hildesheim (Moodle, Selflernplattform, Handreichungen) erlaubt. Weitere Verwendung, Anpassung und Verbreitung sind nicht gestattet.",
		oerCompatible: false,
		selectable: true
	}
];

async function seed(): Promise<void> {
	const start = Date.now();

	console.log("Deleting previous records...");
	await prisma.user.deleteMany();
	await prisma.team.deleteMany();
	await prisma.course.deleteMany();
	await prisma.specialization.deleteMany();
	await prisma.subject.deleteMany();
	await prisma.enrollment.deleteMany();
	await prisma.lesson.deleteMany();
	await prisma.license.deleteMany();

	console.log("😅 Seeding...");

	await prisma.license.createMany({ data: license });
	console.log("✅ Licenses");

	if (process.env["NEXT_PUBLIC_IS_DEMO_INSTANCE"] === "true") {
		faker.seed(1);
		await seedDemos();
	}

	await prisma.subject.createMany({ data: subjects });
	console.log("✅ Subjects");
	await prisma.specialization.createMany({ data: specializations });
	console.log("✅ Specialties");

	await psychologyExample();
	await mathExample();

	console.log(`\nSeed command took ${Date.now() - start}ms`);
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
