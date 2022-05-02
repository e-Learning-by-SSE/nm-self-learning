import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

const routes = [
	{ url: "/examples/01-hello-world", title: "01-Hello World" },
	{ url: "/examples/02-counter", title: "02-Counter" },
	{ url: "/examples/03-ui-counter", title: "03-Counter with UI Component" },
	{ url: "/examples/04-shared-counter", title: "04-Shared Counter" },
	{ url: "/examples/05-customizable-counter", title: "05-Customizable Counter" },
	{
		url: "/examples/06-customizable-counter-with-context",
		title: "06-Customizable Counter with Context"
	},
	{
		url: "/examples/07-counter-hook",
		title: "07-Counter Hook"
	},
	{
		url: "/examples/08-http-request",
		title: "07-Http Request"
	},
	{
		url: "/examples/09-http-request-caching",
		title: "08-Http Request with Caching"
	}
];

export function ExampleLayout({ children }: PropsWithChildren<unknown>) {
	const router = useRouter();

	return (
		<div className="mx-auto flex md:p-16">
			<div className="flex h-fit w-[256px] shrink-0 flex-col gap-4 rounded bg-indigo-500 py-4 text-sm font-semibold text-white">
				{routes.map(route => (
					<Link href={route.url} key={route.url}>
						<a className={`px-8 ${router.pathname === route.url && "underline"}`}>
							{route.title}
						</a>
					</Link>
				))}
			</div>
			<div className="px-16">{children}</div>
		</div>
	);
}
