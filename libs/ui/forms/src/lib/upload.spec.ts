// import { tryGetMediaType } from "./upload";

// function tryGetMediaType(file: File): string | null {
// 	const [type, extension] = file.type.split("/");

// 	if (type === "image" || type === "video") {
// 		return type;
// 	} else if (extension === "pdf") {
// 		return "pdf";
// 	}

// 	return null;
// }

const MediaType = {
	image: "image",
	video: "video",
	pdf: "pdf"
} as const;

type MediaType = keyof typeof MediaType;

function tryGetMediaType(file: File): MediaType | null {
	const [type, extension] = file.type.split("/");
	const isTypeValid = MediaType[type as MediaType];
	const isExtensionValid = MediaType[extension as MediaType];

	if (isTypeValid) {
		return type as MediaType;
	} else if (isExtensionValid) {
		return extension as MediaType;
	} else {
		return null;
	}
}

describe("tryGetMediaType", () => {
	it('should return "image" for image files', () => {
		const file = new File([""], "filename", { type: "image/jpeg" });
		expect(tryGetMediaType(file)).toEqual("image");
	});

	it('should return "video" for video files', () => {
		const file = new File([""], "filename", { type: "video/mp4" });
		expect(tryGetMediaType(file)).toEqual("video");
	});

	it('should return "pdf" for pdf files', () => {
		const file = new File([""], "filename", { type: "application/pdf" });
		expect(tryGetMediaType(file)).toEqual("pdf");
	});

	it("should return null for other file types", () => {
		const file = new File([""], "filename", { type: "text/plain" });
		expect(tryGetMediaType(file)).toBeNull();
	});
});
