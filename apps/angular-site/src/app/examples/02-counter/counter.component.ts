import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgModule } from "@angular/core";

@Component({
	selector: "self-learning-counter",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="counter">
		<span class="count">{{ count }}</span>
		<div class="actions">
			<button class="btn-secondary" (click)="decrease()">Decrease</button>
			<button class="btn-primary" (click)="increase()">Increase</button>
		</div>
	</div>`
})
export class CounterComponent {
	count = 0;
	decrease() {
		this.count--;
	}
	increase() {
		this.count++;
	}
}

@NgModule({
	imports: [CommonModule],
	declarations: [CounterComponent],
	exports: [CounterComponent]
})
export class CounterComponentModule {}
