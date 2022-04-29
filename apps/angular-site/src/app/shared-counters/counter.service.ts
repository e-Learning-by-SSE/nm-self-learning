import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class CounterService {
	count$ = new BehaviorSubject(0);

	increase(): void {
		this.count$.next(this.count$.value + 1);
	}

	decrease(): void {
		this.count$.next(this.count$.value - 1);
	}
}
