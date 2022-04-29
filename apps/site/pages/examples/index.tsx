import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

const routes = [
	{ url: "/examples/01-hello-world", title: "Hello World" },
	{ url: "/examples/02-counter", title: "Counter" },
	{ url: "/examples/03-ui-counter", title: "Counter with UI Component" },
	{ url: "/examples/04-shared-counter", title: "Shared Counter" },
	{ url: "/examples/05-customizable-counter", title: "Customizable Counter" }
];

export function ExampleLayout({ children }: PropsWithChildren<unknown>) {
	const router = useRouter();

	console.log(router.pathname);

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-16 p-16 px-2 xl:px-0">
			<div className="flex flex-col justify-center divide-x-2 divide-indigo-300 rounded bg-indigo-500 py-4 text-sm font-semibold text-white sm:flex-row">
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
