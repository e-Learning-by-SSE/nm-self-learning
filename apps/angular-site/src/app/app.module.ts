import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { CounterComponent } from "./examples/02-counter/counter.component";
import { CustomizableCounterParentComponent } from "./examples/05-customizable-counter/parent.component";
import { HelloWorldComponent } from "./examples/01-hello-world/hello-world.component";
import { SharedCounterComponent } from "./examples/04-shared-counters/shared-counter.component";
import { CounterParentComponent } from "./examples/03-ui-counter/parent.component";

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		RouterModule.forRoot(
			[
				{ path: "", component: HelloWorldComponent },
				{ path: "counter", component: CounterComponent },
				{ path: "counter-ui", component: CounterParentComponent },
				{ path: "shared-counter", component: SharedCounterComponent },
				{ path: "customizable-counter", component: CustomizableCounterParentComponent }
			],
			{
				initialNavigation: "enabledBlocking"
			}
		)
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
