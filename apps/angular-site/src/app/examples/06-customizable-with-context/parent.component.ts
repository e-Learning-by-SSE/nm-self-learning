import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, NgModule } from "@angular/core";
import { CustomizableCounterWithContextComponentModule } from "./customizable-counter.component";

@Component({
	selector: "self-learning-customizable-counter-parent",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="flex flex-col gap-8 rounded border border-indigo-600 p-4">
		<span
			>The parent component only manages the styles of individual elements. The state and
			composition is controlled by the child component, which receives TemplateRefs as input,
			which make use context variables to access data/functions.</span
		>

		<ng-template #countTemplate let-count>
			<span class="count">{{ count }}</span>
		</ng-template>

		<ng-template #decreaseTemplate let-decrease>
			<button class="btn-secondary" (click)="decrease()">Decrease</button>
		</ng-template>

		<ng-template #increaseTemplate let-increase>
			<button class="btn-primary" (click)="increase()">Increase</button>
		</ng-template>

		<self-learning-customizable-counter
			[countTemplate]="countTemplate"
			[decreaseTemplate]="decreaseTemplate"
			[increaseTemplate]="increaseTemplate"
		></self-learning-customizable-counter>
	</div> `
})
export class CustomizableCounterWithContextParentComponent {}

@NgModule({
	imports: [CommonModule, CustomizableCounterWithContextComponentModule],
	declarations: [CustomizableCounterWithContextParentComponent],
	exports: [CustomizableCounterWithContextParentComponent]
})
export class CustomizableCounterWithContextParentComponentModule {}
