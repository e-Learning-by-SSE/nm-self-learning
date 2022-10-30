import { PropsWithChildren } from "react";

export function ItemCardGrid({ children }: PropsWithChildren<unknown>) {
	return <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
