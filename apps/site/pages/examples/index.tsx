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
	}
];

export function ExampleLayout({ children }: PropsWithChildren<unknown>) {
	const router = useRouter();

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-16 p-16 px-2 xl:px-0">
			<div className="flex flex-col justify-center divide-indigo-300 rounded bg-indigo-500 py-4 text-sm font-semibold text-white sm:flex-row sm:divide-x-2">
				{routes.map(route => (
					<Link href={route.url} key={route.url}>
						<a className={`px-8 ${router.pathname === route.url && "underline"}`}>
							{route.title}
						</a>
					</Link>
				))}
			</div>
			<div>{children}</div>
		</div>
	);
}
