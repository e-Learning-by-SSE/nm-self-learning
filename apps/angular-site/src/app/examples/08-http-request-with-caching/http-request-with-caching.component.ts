import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from "@angular/core";
import { ApiService } from "./api.service";

@Component({
	selector: "self-learning-http-request-with-loading-indicator",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="wrapper">
		<ng-container *ngIf="requestState$ | async as requestState">
			<span>Responses will be cached for 5 seconds.</span>
			<button class="btn-primary" (click)="loadData()" [disabled]="requestState.isLoading">
				{{ requestState.isLoading ? "Loading..." : "Reload Data" }}
			</button>
			<pre *ngIf="requestState.data">{{ requestState | json }}</pre>
			<pre *ngIf="requestState.error">{{ requestState.error }}</pre>
		</ng-container>
	</div>`
})
export class HttpRequestWithCachingComponent implements OnInit {
	requestState$ = this.api.select("enrollments/potter");

	constructor(private readonly api: ApiService) {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData(): void {
		this.api.loadData("enrollments/potter");
	}
}

@NgModule({
	imports: [CommonModule],
	declarations: [HttpRequestWithCachingComponent],
	exports: [HttpRequestWithCachingComponent]
})
export class HttpRequestWithCachingComponentModule {}
