import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, NgModule, TemplateRef } from "@angular/core";

@Component({
	selector: "self-learning-customizable-counter",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="flex flex-col gap-8">
		<div class="grid gap-4">
			<span class="text-green-700">The count template will be displayed here:</span>
			<div class="w-fit">
				<ng-container
					*ngTemplateOutlet="countTemplate; context: { $implicit: count }"
				></ng-container>
			</div>
		</div>

		<div class="grid gap-4">
			<span class="text-green-700">The decrease template will be displayed here:</span>
			<div class="w-fit">
				<ng-container
					*ngTemplateOutlet="decreaseTemplate; context: { $implicit: decrease }"
				></ng-container>
			</div>
		</div>

		<div class="grid gap-4">
			<span class="text-green-700">The increase template will be displayed here:</span>
			<div class="w-fit">
				<ng-container
					*ngTemplateOutlet="increaseTemplate; context: { $implicit: increase }"
				></ng-container>
			</div>
		</div>
	</div>`
})
export class CustomizableCounterWithContextComponent {
	@Input() countTemplate!: TemplateRef<unknown>;
	@Input() decreaseTemplate!: TemplateRef<unknown>;
	@Input() increaseTemplate!: TemplateRef<unknown>;
	count = 0;

	// Notice: We are using arrow functions instead of class functions in order to correctly bind "this".

	decrease = () => {
		this.count--;
	};

	increase = () => {
		this.count++;
	};
}

@NgModule({
	imports: [CommonModule],
	declarations: [CustomizableCounterWithContextComponent],
	exports: [CustomizableCounterWithContextComponent]
})
export class CustomizableCounterWithContextComponentModule {}
