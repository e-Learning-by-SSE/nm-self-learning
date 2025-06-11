import { EmailContext } from "./email-types";

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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Hallo {{userName}}!</h1>
            <p>Du hast den Kurs "<strong>{{courseName}}</strong>" schon eine Weile nicht besucht.</p>
            <p>Dein aktueller Fortschritt: {{progress}}%</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{courseUrl}}" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Jetzt weitermachen
              </a>
            </div>
            <p>Viel Erfolg beim Lernen!<br>Dein SELF-learning Team</p>
          </div>
        `,
		text: 'Hallo {{userName}}! Du hast den Kurs "{{courseName}}" schon eine Weile nicht besucht. Jetzt weitermachen: {{courseUrl}}'
	},

	// "achievement-unlocked": {
	// 	subject: "Neue Errungenschaft freigeschaltet! 🏆",
	// 	html: `
	//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
	//           <h1>🏆 Herzlichen Glückwunsch {{userName}}!</h1>
	//           <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
	//             <h2 style="color: #92400e; margin: 0;">{{achievementTitle}}</h2>
	//             <p style="color: #78350f;">{{achievementDescription}}</p>
	//             <p><strong>XP Belohnung: {{xpReward}}</strong></p>
	//           </div>
	//           <p>Weiter so! Schaue dir deine anderen Errungenschaften an und sammle weitere Punkte.</p>
	//         </div>
	//       `
	// },

	streakReminder: {
		subject: "Dein {{currentStreak}}-Tage Lernstreak ist in Gefahr! 🔥",
		html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>🔥 Nicht aufgeben, {{userName}}!</h1>
            <p>Du hast einen großartigen <strong>{{currentStreak}}-Tage Lernstreak</strong> aufgebaut.</p>
            <p>Logge dich heute ein, um ihn nicht zu verlieren!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" 
                 style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Jetzt einloggen
              </a>
            </div>
          </div>
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
