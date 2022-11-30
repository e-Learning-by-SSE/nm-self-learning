import {
	createArticle,
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from "../seed-functions";

export const chapters = [
	{
		title: "Folgen und Reihen",
		description:
			"In diesem Kapitel werden Folgen und Reihen behandelt. Es werden verschiedene Eigenschaften untersucht, wie etwa Monotonie, Beschränktheit und Konvergenz. Dabei stellt sich heraus, dass konvergente Folgen von besonderer Bedeutung sind - sie werden die Grundlage für die gesamte nachfolgende Theorie der Analysis bilden.",
		content: [
			createLesson(
				"Folgen",
				"Konvergenz",
				"",
				[createArticle("Kursmaterial als Webseite", 20), createVideo("link zum Video", 15)],
				[
					createMultipleChoice(
						"Wahr oder falsch? Für die reelle Folge  $(a_n)_{n\\in\\mathbb N}$ sei die durch $$b_n:=\\frac{1}{2}(a_n+a_{n+1})$$ definierte Folge gegeben.\r\n\r\nWenn $(a_n)_{n\\in\\mathbb N}$ konvergiert, dann auch $(b_n)_{n\\in\\mathbb N}$.",
						[
							{
								content: "Diese Aussage ist wahr.",
								isCorrect: true
							},
							{
								content: "Diese Aussage ist falsch.",
								isCorrect: false
							}
						],
						[
							"Denken Sie an die Rechenregeln für Grenzwerte",
							"Aus den Rechenregeln für Grenzwerte folgt sofort die Konvergenz der Folge $(b_n)_{n\\in\\mathbb N}$, und zwar ebenfalls gegen $a$."
						]
					),
					createTextQuestion(
						"Man kann zeigen, dass die rekursiv durch $$a_{n+1}=\\frac{a_n}{2}+1,\\quad a_0=1$$ definierte Folge $(a_n)_{n\\in\\mathbb N}$ konvergiert. Bestimmen Sie den Grenzwert der Folge.",
						["2", "2.0", "2,0"],
						[
							"Sei $a$ der Grenzwert. Dann konvergieren $$\\lim_{n\\to\\infty} a_n=a\\quad\\text{ und }\\quad \\lim_{n\\to\\infty}a_{n+1}=a.$$ Welche Beziehung muss also für $a$ gelten?",
							"Für $a$ gilt nach den Rechenregeln für Grenzwerte die Beziehung $$a=\\frac{a}{2}+1.$$ Aus dieser Gleichung können Sie $a$ direkt bestimmen."
						]
					)
				]
			)
		]
	}
];

export const course = createCourse(
	"mathematik",
	"analysis",
	"Analysis",
	null,
	null,
	"https://staging.sse.uni-hildesheim.de:9006/upload/analysis/Mittelwertsatz.png",
	chapters
);
