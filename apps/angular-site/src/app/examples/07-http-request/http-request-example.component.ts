import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, NgModule } from "@angular/core";

@Component({
	selector: "self-learning-http-request-example",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="wrapper">
		<pre>{{ response$ | async | json }}</pre>
	</div>`
})
export class HttpRequestExampleComponent {
	response$ = this.http.get("http://localhost:3333/api/enrollments/potter");

	constructor(private readonly http: HttpClient) {}
}

@NgModule({
	imports: [CommonModule],
	declarations: [HttpRequestExampleComponent],
	exports: [HttpRequestExampleComponent]
})
export class HttpRequestExampleComponentModule {}
