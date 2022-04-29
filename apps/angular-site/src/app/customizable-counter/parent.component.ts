import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, NgModule } from "@angular/core";
import { CustomizableCounterComponentModule } from "./customizable-counter.component";

@Component({
	selector: "self-learning-customizable-counter-parent",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="flex flex-col gap-8 rounded border border-indigo-600 p-4">
		<span
			>The parent manages the state styles of individual elements. The composition is
			controlled by the child component, which receives TemplateRefs as input.</span
		>

		<ng-template #countTemplate>
			<span class="count">{{ count }}</span>
		</ng-template>

		<ng-template #decreaseTemplate>
			<button class="btn-secondary" (click)="decrease()">Decrease</button>
		</ng-template>

		<ng-template #increaseTemplate>
			<button class="btn-primary" (click)="increase()">Increase</button>
		</ng-template>

		<self-learning-customizable-counter
			[countTemplate]="countTemplate"
			[decreaseTemplate]="decreaseTemplate"
			[increaseTemplate]="increaseTemplate"
		></self-learning-customizable-counter>
	</div> `
})
export class CustomizableCounterParentComponent {
	count = 0;
	decrease() {
		this.count--;
	}
	increase() {
		this.count++;
	}
}

@NgModule({
	imports: [CommonModule, CustomizableCounterComponentModule],
	declarations: [CustomizableCounterParentComponent],
	exports: [CustomizableCounterParentComponent]
})
export class CustomizableCounterParentComponentModule {}
