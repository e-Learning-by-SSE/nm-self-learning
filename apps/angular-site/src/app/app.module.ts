import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { CounterComponent } from "./counter/counter.component";
import { CustomizableCounterParentComponent } from "./customizable-counter/parent.component";
import { HelloWorldComponent } from "./hello-world.component";
import { SharedCounterComponent } from "./shared-counters/shared-counter.component";
import { CounterParentComponent } from "./ui-counter/parent.component";

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		RouterModule.forRoot(
			[
				{ path: "", component: HelloWorldComponent },
				{ path: "counter", component: CounterComponent },
				{ path: "counter-ui", component: CounterParentComponent },
				{ path: "customizable-counter", component: CustomizableCounterParentComponent },
				{ path: "shared-counter", component: SharedCounterComponent }
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
