import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { HelloWorldComponent } from "./hello-world.component";

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		RouterModule.forRoot([{ path: "", component: HelloWorldComponent }], {
			initialNavigation: "enabledBlocking"
		})
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
