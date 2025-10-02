import { LinkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { DropdownMenu } from "@self-learning/ui/common";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

function FooterElement({
	href,
	target = "_blank",
	text
}: {
	href: string;
	target?: string;
	text: string;
}) {
	const { t, i18n } = useTranslation("platform-config");
	if (!i18n.exists(href, { ns: "platform-config" })) {
		return null;
	}
	return (
		<Link href={t(href)} target={target} className="text-sm font-medium hover:text-secondary">
			{t(text)}
		</Link>
	);
}

export function Footer() {
	const { t } = useTranslation("platform-config");
	return (
		<footer className="border-t-gray border-t bg-white px-6 py-2 text-light mt-auto">
			<div
				className="mx-auto flex flex-col items-center justify-between md:flex-row"
				style={{ maxWidth: "1200px" }}
			>
				<div className="mb-2 text-center md:mb-0 md:text-left">
					<Link href="https://sse.uni-hildesheim.de" className="inline-flex items-center">
						<p className="mt-1 text-sm">{t("COPYRIGHT_Label")}</p>
						<LinkIcon height="18" className="ml-1 mt-1" />
					</Link>
				</div>
				<div className="flex space-x-4">
					<FooterElement href="ABOUT_URL" text="ABOUT_Label" />
					<FooterElement href="BLOG_URL" text="BLOG_Label" />
					<FooterElement href="PRIVACY_NOTICE_URL" text="PRIVACY_NOTICE_Label" />
					<FooterElement href="IMPRINT_URL" text="IMPRINT_Label" />
					<LanguageSwitcher />
				</div>
			</div>
		</footer>
	);
}

function LanguageSwitcher() {
	const router = useRouter();
	const { t } = useTranslation("common");

	return (
		<DropdownMenu
			dropdownPosition="top"
			title="Sprache ändern"
			button={
				<span className="text-sm font-medium hover:text-secondary flex items-center gap-1">
					<ChevronDownIcon className="w-4 h-4" />
					{t("pickLanguage")}
				</span>
			}
		>
			<button
				className={"px-3 py-1"}
				onClick={() => {
					router.push(router.pathname, router.asPath, { locale: "de" });
				}}
			>
				{t("languageGerman")}
			</button>

			<button
				className={"px-3 py-1"}
				onClick={() => {
					router.push(router.pathname, router.asPath, { locale: "en" });
				}}
			>
				{t("languageEnglish")}
			</button>
		</DropdownMenu>
	);
}
