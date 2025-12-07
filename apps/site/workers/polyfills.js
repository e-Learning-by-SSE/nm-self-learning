globalThis.DOMMatrix = class DOMMatrix {
	constructor() {
		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.e = 0;
		this.f = 0;
	}

	translate() {
		return this;
	}
	scale() {
		return this;
	}
	rotate() {
		return this;
	}
};

globalThis.ImageData = class ImageData {
	constructor(width, height) {
		this.width = width || 0;
		this.height = height || 0;
		this.data = new Uint8ClampedArray((width || 0) * (height || 0) * 4);
	}
};

globalThis.Path2D = class Path2D {
	constructor() {}
	moveTo() {}
	lineTo() {}
	arc() {}
	closePath() {}
};

globalThis.HTMLCanvasElement = class HTMLCanvasElement {
	constructor() {
		this.width = 0;
		this.height = 0;
	}

	getContext() {
		return {
			fillRect: () => {},
			clearRect: () => {},
			getImageData: (x, y, w, h) => new ImageData(w, h),
			putImageData: () => {},
			createImageData: (w, h) => new ImageData(w, h),
			setTransform: () => {},
			drawImage: () => {},
			save: () => {},
			restore: () => {},
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			closePath: () => {},
			stroke: () => {},
			translate: () => {},
			scale: () => {},
			rotate: () => {},
			arc: () => {},
			fill: () => {},
			measureText: () => ({ width: 0 }),
			transform: () => {},
			rect: () => {},
			clip: () => {}
		};
	}

	toDataURL() {
		return "";
	}
};

globalThis.OffscreenCanvas = class OffscreenCanvas {
	constructor(width, height) {
		this.width = width || 0;
		this.height = height || 0;
	}

	getContext() {
		return globalThis.HTMLCanvasElement.prototype.getContext.call(this);
	}

	convertToBlob() {
		return Promise.resolve(new Blob());
	}
};

if (typeof globalThis.document === "undefined") {
	globalThis.document = {
		createElement: () => new HTMLCanvasElement(),
		createElementNS: () => ({}),
		documentElement: { style: {} }
	};
}

if (typeof globalThis.window === "undefined") {
	globalThis.window = globalThis;
}

console.log("✅ Polyfills loaded successfully");
