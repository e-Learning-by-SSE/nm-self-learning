import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, NgModule, TemplateRef } from "@angular/core";

@Component({
	selector: "self-learning-customizable-counter",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="flex flex-col gap-8">
		<div class="grid gap-4">
			<span class="text-green-700">The count template will be displayed here:</span>
			<div class="w-fit">
				<ng-container *ngTemplateOutlet="countTemplate"></ng-container>
			</div>
		</div>

		<div class="grid gap-4">
			<span class="text-green-700">The decrease template will be displayed here:</span>
			<div class="w-fit">
				<ng-container *ngTemplateOutlet="decreaseTemplate"></ng-container>
			</div>
		</div>

		<div class="grid gap-4">
			<span class="text-green-700">The increase template will be displayed here:</span>
			<div class="w-fit">
				<ng-container *ngTemplateOutlet="increaseTemplate"></ng-container>
			</div>
		</div>
	</div>`
})
export class CustomizableCounterComponent {
	@Input() countTemplate!: TemplateRef<unknown>;
	@Input() decreaseTemplate!: TemplateRef<unknown>;
	@Input() increaseTemplate!: TemplateRef<unknown>;
}

@NgModule({
	imports: [CommonModule],
	declarations: [CustomizableCounterComponent],
	exports: [CustomizableCounterComponent]
})
export class CustomizableCounterComponentModule {}
