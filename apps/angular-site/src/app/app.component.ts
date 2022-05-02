import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
	selector: "self-learning-root",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="mx-auto flex md:p-16">
		<div
			class="flex h-fit w-[256px] shrink-0 flex-col gap-4 rounded bg-indigo-500 py-4 text-sm font-semibold text-white"
		>
			<a
				*ngFor="let route of routes"
				[routerLinkActiveOptions]="{ exact: true }"
				#link="routerLinkActive"
				routerLinkActive
				[class]="link.isActive ? 'px-8 underline' : 'px-8'"
				[routerLink]="[route.url]"
				>{{ route.title }}</a
			>
		</div>
		<div class="px-16">
			<router-outlet></router-outlet>
		</div>
	</div>`
})
export class AppComponent {
	routes = [
		{ url: "", title: "01-Hello World" },
		{ url: "counter", title: "02-Counter" },
		{ url: "counter-ui", title: "03-Counter with UI Component" },
		{ url: "shared-counter", title: "04-Shared Counter" },
		{ url: "customizable-counter", title: "05-Customizable Counter" },
		{ url: "customizable-counter-with-context", title: "06-Customizable Counter with Context" },
		{ url: "http-request", title: "07-HTTP-Request" },
		{ url: "http-request-with-caching", title: "08-HTTP-Request-Caching" }
	] as const;
}
