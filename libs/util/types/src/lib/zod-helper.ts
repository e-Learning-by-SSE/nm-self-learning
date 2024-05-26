import { ZodNullable, ZodObject, ZodOptional, ZodTypeAny, z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NullishSchema<T extends ZodObject<any>> = {
	[K in keyof T["shape"]]: ZodOptional<ZodNullable<T["shape"][K]>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeAllFieldsNullish<T extends ZodObject<any>>(
	schema: T
): ZodObject<NullishSchema<T>> {
	const newShape: Record<string, ZodTypeAny> = {};

	for (const key in schema.shape) {
		newShape[key] = schema.shape[key].nullable().optional();
	}

	return z.object(newShape) as ZodObject<NullishSchema<T>>;
}
