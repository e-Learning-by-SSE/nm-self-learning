"use client";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "../tooltip/tooltips";
import { useTranslation } from "next-i18next";

const SUPPORTED_LOCALES: string[] = (process.env["NEXT_PUBLIC_ONLINE_HELP_LANGUAGES"] || "en,de")
	.split(",")
	.map(l => l.trim().toLowerCase())
	.filter(Boolean);

function normalizeLocale(locale?: string | null): string {
	if (!locale) {
		return SUPPORTED_LOCALES[0] || "de";
	}
	const normalized = locale.split("-")[0]?.toLowerCase();
	return SUPPORTED_LOCALES.includes(normalized) ? normalized : SUPPORTED_LOCALES[0] || "de";
}

function sanitizeBaseUrl(baseUrl: string) {
	return baseUrl.replace(/\/+$/, "");
}

function sanitizeRelativePath(relativePath: string) {
	return relativePath.replace(/^\/+/, "");
}

function buildHelpUrl(baseUrl: string, locale: string, relativePath: string) {
	const sanitizedBase = sanitizeBaseUrl(baseUrl);
	const sanitizedRelative = sanitizeRelativePath(relativePath);

	return `${sanitizedBase}/${locale}/${sanitizedRelative}`;
}

export type OnlineHelpLinkProps = { relativePath: string; children?: React.ReactNode };

export function OnlineHelpLink({ relativePath, children }: OnlineHelpLinkProps) {
	const baseUrl = process.env["NEXT_PUBLIC_ONLINE_HELP_BASE_URL"];
	const { i18n } = useTranslation("common");

	if (!baseUrl || !relativePath) {
		return null;
	}

	const locale = normalizeLocale(i18n.language);
	const sanitizedRelativePath = sanitizeRelativePath(relativePath);

	if (!sanitizedRelativePath) {
		return null;
	}

	const helpUrl = buildHelpUrl(baseUrl, locale, sanitizedRelativePath);

	return (
		<Tooltip content={`Hilfe`} className="inline-flex z-40">
			<a
				href={helpUrl}
				target="_blank"
				rel="noreferrer"
				aria-label={"Hilfe"}
				className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
				data-testid="online-help-link"
			>
				{children ?? <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />}
			</a>
		</Tooltip>
	);
}
