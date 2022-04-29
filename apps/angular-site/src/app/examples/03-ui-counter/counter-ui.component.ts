import { CommonModule } from "@angular/common";
import {
	Component,
	ChangeDetectionStrategy,
	Input,
	Output,
	EventEmitter,
	NgModule
} from "@angular/core";

/**
 * Receives the `count` as input and notifies its parent via the `decreased` and `increased`
 * event bindings, when the count has been changed.
 */
@Component({
	selector: "self-learning-counter-ui",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="counter">
		<span class="count">{{ count }}</span>
		<div class="actions">
			<button class="btn-secondary" (click)="decreased.next()">Decrease</button>
			<button class="btn-primary" (click)="increased.next()">Increase</button>
		</div>
	</div> `
})
export class CounterUiComponent {
	@Input() count!: number;
	@Output() decreased = new EventEmitter<void>();
	@Output() increased = new EventEmitter<void>();
}

@NgModule({
	imports: [CommonModule],
	declarations: [CounterUiComponent],
	exports: [CounterUiComponent]
})
export class CounterUiComponentModule {}
