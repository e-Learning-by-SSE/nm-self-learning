import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
	selector: "self-learning-root",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="mx-auto flex max-w-5xl flex-col gap-16 p-16 px-2 xl:px-0">
		<div
			class="flex flex-col justify-center divide-x-2 divide-indigo-300 rounded bg-indigo-500 py-4 text-sm font-semibold text-white sm:flex-row"
		>
			<a
				[routerLinkActiveOptions]="{ exact: true }"
				#helloWorld="routerLinkActive"
				routerLinkActive
				[class]="helloWorld.isActive ? 'px-8 underline' : 'px-8'"
				[routerLink]="['']"
				>Hello World</a
			>
			<a
				#simpleCounter="routerLinkActive"
				routerLinkActive
				[class]="simpleCounter.isActive ? 'px-8 underline' : 'px-8'"
				[routerLink]="['counter']"
				>Counter</a
			>
			<a
				#counterUi="routerLinkActive"
				routerLinkActive
				[class]="counterUi.isActive ? 'px-8 underline' : 'px-8'"
				[routerLink]="['counter-ui']"
				>Counter with UI Component</a
			>
			<a
				#sharedCounter="routerLinkActive"
				routerLinkActive
				[class]="sharedCounter.isActive ? 'px-8 underline' : 'px-8'"
				[routerLink]="['shared-counter']"
				>Shared Counter</a
			>
			<a
				#customizableCounter="routerLinkActive"
				routerLinkActive
				[class]="customizableCounter.isActive ? 'px-8 underline' : 'px-8'"
				[routerLink]="['customizable-counter']"
				>Customizable Counter</a
			>
		</div>
		<div>
			<router-outlet></router-outlet>
		</div>
	</div>`
})
export class AppComponent {}
