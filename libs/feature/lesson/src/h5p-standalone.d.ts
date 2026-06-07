declare module "h5p-standalone" {
	interface H5PStandaloneOptions {
		h5pJsonPath: string;
		frameJs: string;
		frameCss: string;
		xAPIObjectIRI?: string;
	}

	export class H5P {
		constructor(element: HTMLElement, options: H5PStandaloneOptions);
	}
}