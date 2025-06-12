export type CourseReminderContext = {
	userName: string;
	courseName: string;
	courseUrl: string;
	progress: number;
	lastVisitedDays: number;
};

export type StreakReminderContext = {
	userName: string;
	currentStreak: number;
	loginUrl: string;
};

export type EmailContext =
	| { type: "courseReminder"; data: CourseReminderContext }
	| { type: "streakReminderFirst"; data: StreakReminderContext }
	| { type: "streakReminderLast"; data: StreakReminderContext };

export interface TemplateVariables {
	[key: string]: string | number | boolean;
}

export interface EmailTemplateDefinition {
	subject: string;
	html: string;
	text?: string;
}

export const EMAIL_TEMPLATES: Record<
	EmailContext["type"],
	{ subject: string; html: string; text?: string }
> = {
	courseReminder: {
		subject: "Vergiss nicht: {{courseName}} wartet auf dich!",
		html: `
		<!DOCTYPE html>
		<html lang="de">
		<head>
		<meta charset="UTF-8" />
		<title>Kurs-Erinnerung: "{{courseName}}" wartet auf dich</title>
		</head>
		<body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
		<div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 24px;">
			<h2 style="color: #34495e;">Hallo {{userName}},</h2>
			<p>du hast den Kurs <strong>"{{courseName}}"</strong> vor <strong>{{lastVisitedDays}} Tagen</strong> zuletzt besucht.</p>
			<p>Wie wäre es mit einer kleinen Lerneinheit heute? Der Kurs wartet auf dich!</p>
			<p>
			<a href="{{courseUrl}}" style="display: inline-block; background: #2980b9; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
			Kurs jetzt fortsetzen
			</a>
			</p>
			<p style="color: #7f8c8d;">Bleib dran – dein zukünftiges Ich wird es dir danken!</p>
		</div>
		</body>
		</html>
        	`,
		text: `
		Hallo {{userName}},

		dein Kurs "{{courseName}}" wartet noch auf dich!

		Du hast ihn vor {{lastVisitedDays}} Tagen zuletzt besucht – wie wäre es mit einer kleinen Lerneinheit heute?

		Hier geht's direkt zum Kurs:
		{{courseUrl}}

		Bleib dran – dein zukünftiges Ich wird es dir danken!
		`
	},
	streakReminderFirst: {
		subject: "Lerne heute um deine {{currentStreak}}-Tage Lernstreak zu erhalten! 🔥",
		html: `
			<!DOCTYPE html>
			<html lang="de">
			<head>
				<meta charset="UTF-8" />
				<title>Bleib dran, {{userName}}!</title>
			</head>
			<body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
				<div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 24px;">
				<h2 style="color: #2c3e50;">Hallo {{userName}},</h2>
				<p>du bist jetzt schon <strong>{{currentStreak}} Tage</strong> in Folge aktiv – stark!</p>
				<p>Willst du deine Lernserie fortsetzen? Schon ein paar Minuten reichen, um am Ball zu bleiben 💪</p>
				<p>
					<a href="{{loginUrl}}" style="display: inline-block; background: #27ae60; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
					Jetzt weiterlernen
					</a>
				</p>
				<p style="color: #7f8c8d;">Dein Lernfortschritt zählt. Jeder Tag bringt dich weiter.</p>
				</div>
			</body>
			</html>
			`,
		text: `
			Hallo {{userName}},

			du bist jetzt schon {{currentStreak}} Tage in Folge aktiv – stark!

			Willst du deine Lernserie fortsetzen? Schon ein paar Minuten reichen, um am Ball zu bleiben 💪

			Jetzt weiterlernen: {{loginUrl}}

			Dein Lernfortschritt zählt. Jeder Tag bringt dich weiter.
		`
	},
	streakReminderLast: {
		subject: "Letzte Chance: Deine {{currentStreak}}-Tage Lernstreak steht auf der Kippe! ⏳",
		html: `
			<!DOCTYPE html>
			<html lang="de">
			<head>
				<meta charset="UTF-8" />
				<title>Achtung, deine Lernserie ist in Gefahr!</title>
			</head>
			<body style="font-family: sans-serif; background-color: #fff3f3; padding: 20px;">
				<div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 24px;">
				<h2 style="color: #c0392b;">Nicht aufhören, {{userName}}!</h2>
				<p>Du hast eine Serie von <strong>{{currentStreak}} Tagen</strong> aufgebaut – Respekt! Aber wenn du heute nicht lernst, endet sie 😢</p>
				<p>Logge dich jetzt ein und halte deine Lernserie am Leben!</p>
				<p>
					<a href="{{loginUrl}}" style="display: inline-block; background: #e74c3c; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
					Serie retten
					</a>
				</p>
				<p style="color: #7f8c8d;">Lernen kostet dich nur wenige Minuten – aber bringt dich riesige Schritte weiter.</p>
				</div>
			</body>
			</html>
		`,
		text: `
			Hallo {{userName}},

			du hast eine Serie von {{currentStreak}} Tagen aufgebaut – Respekt! Aber wenn du heute nicht lernst, endet sie 😢

			Logge dich jetzt ein und halte deine Lernserie am Leben:
			{{loginUrl}}

			Lernen kostet dich nur wenige Minuten – aber bringt dich riesige Schritte weiter.
		`
	}
} as const;

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES;

export function renderTemplate(
	templateType: EmailTemplateType,
	variables: Record<string, string | number | boolean>
): EmailTemplateDefinition {
	const template = EMAIL_TEMPLATES[templateType];

	const rendered = {
		subject: replaceVariables(template.subject, variables),
		html: replaceVariables(template.html, variables),
		text: template.text ? replaceVariables(template.text, variables) : undefined
	};

	return rendered;
}

function replaceVariables(template: string, variables: TemplateVariables): string {
	return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
		return variables[key]?.toString() || match;
	});
}
