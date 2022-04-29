import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgModule } from "@angular/core";

@Component({
	selector: "self-learning-hello-world",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: "Hello World"
})
export class HelloWorldComponent {}

@NgModule({
	imports: [CommonModule],
	declarations: [HelloWorldComponent],
	exports: [HelloWorldComponent]
})
export class HelloWorldComponentModule {}
