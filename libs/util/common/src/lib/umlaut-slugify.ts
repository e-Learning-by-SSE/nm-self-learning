import slugify from "slugify";

type SlugifyOptions = NonNullable<Parameters<typeof slugify>[1]>;

// TODO: add support for uppercase umlauts if needed
function umlautSlugify(text: string, options?: SlugifyOptions) {
	const umlautMap: { [key: string]: string } = {
		ä: "ae",
		ö: "oe",
		ü: "ue",
		Ä: "Ae",
		Ö: "Oe",
		Ü: "Ue",
		ß: "ss"
	};
	const replaced = text.replace(/[äöüÄÖÜß]/g, match => umlautMap[match]);
	return slugify(replaced, options);
}

export { umlautSlugify as slugify };
