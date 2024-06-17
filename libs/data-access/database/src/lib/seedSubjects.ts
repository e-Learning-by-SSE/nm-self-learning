import {Prisma} from "@prisma/client";

export const subjects: Prisma.SubjectCreateManyInput[] = [
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

export const demoSubjects: Prisma.SubjectCreateManyInput[] = [
	{
		subjectId: "informatik",
		slug: "informatik",
		title: "Informatik",
		subtitle:
			"IT-Grundlagen für die Studiengänge Angewandte Informatik (B.Sc./M.Sc.), Informationsmanagement und Informationstechnologie (IMIT, B.Sc./M.Sc.), Wirtschaftsinformatik (B.Sc./M.Sc.), Data Analytics (M.Sc.) und IT-Nebenfachstudierende",
		cardImgUrl:
			"https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
		imgUrlBanner:
			"https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
	}
];
