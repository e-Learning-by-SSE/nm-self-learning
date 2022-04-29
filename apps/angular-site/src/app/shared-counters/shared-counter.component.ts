import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, NgModule } from "@angular/core";
import { CounterService } from "./counter.service";

@Component({
	selector: "self-learning-counter",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="counter">
		<span class="count">{{ counterService.count$ | async }}</span>
		<div class="actions">
			<button class="btn-secondary" (click)="counterService.decrease()">Decrease</button>
			<button class="btn-primary" (click)="counterService.increase()">Increase</button>
		</div>
	</div> `
})
export class CounterComponent {
	constructor(readonly counterService: CounterService) {}
}

@NgModule({
	imports: [CommonModule],
	declarations: [CounterComponent],
	exports: [CounterComponent]
})
export class CounterComponentModule {}

@Component({
	selector: "self-learning-shared-counter",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="wrapper">
		<span
			>The parent component only creates 4 counters, but does not manage any state or design.
			All counters are subscribed to a <span class="font-bold">CounterService</span> that
			provides methods for updating and reading the count.</span
		>

		<span class="text-slate-400"
			>Alternatively, the parent component could manage the counter state and use UI
			components to achieve synchronized state. This technique is sometimes referred to as
			"lifting state up".</span
		>

		<div class="flex flex-wrap gap-8">
			<self-learning-counter></self-learning-counter>
			<self-learning-counter></self-learning-counter>
			<self-learning-counter></self-learning-counter>
			<self-learning-counter></self-learning-counter>
		</div>
	</div>`
})
export class SharedCounterComponent {}

@NgModule({
	imports: [CommonModule, CounterComponentModule],
	declarations: [SharedCounterComponent],
	exports: [SharedCounterComponent]
})
export class SharedCounterComponentModule {}
