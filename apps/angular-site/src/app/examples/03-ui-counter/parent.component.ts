import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, NgModule } from "@angular/core";
import { CounterUiComponentModule } from "./counter-ui.component";

@Component({
	selector: "self-learning-counter-parent",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="grid gap-8 rounded border border-indigo-600 p-4">
		<span
			>This parent component manages the state. The UI-component below will only display it
			and notify it when buttons were clicked.</span
		>

		<self-learning-counter-ui
			[count]="count"
			(decreased)="decrease()"
			(increased)="increase()"
		></self-learning-counter-ui>
	</div>`
})
export class CounterParentComponent {
	count = 0;
	decrease() {
		this.count--;
	}
	increase() {
		this.count++;
	}
}

@NgModule({
	imports: [CommonModule, CounterUiComponentModule],
	declarations: [CounterParentComponent],
	exports: [CounterParentComponent]
})
export class CounterParentComponentModule {}
