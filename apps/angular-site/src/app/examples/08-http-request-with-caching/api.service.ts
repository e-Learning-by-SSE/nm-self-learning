import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";

type ApiResponseCache = {
	[Url: string]: {
		data: unknown;
		error?: unknown;
		isLoading: boolean;
		_ttlInMs: number;
		_timestamp: number;
	};
};

@Injectable({ providedIn: "root" })
export class ApiService {
	private readonly cache$ = new BehaviorSubject<ApiResponseCache>({});

	constructor(private readonly http: HttpClient) {}

	select<EndPoint extends string>(apiEndPoint: EndPoint): Observable<ApiResponseCache[EndPoint]> {
		return this.cache$.asObservable().pipe(
			map(cache => cache[apiEndPoint]),
			distinctUntilChanged()
		);
	}

	loadData(apiEndPoint: string): void {
		console.log(`[ApiService]: Request for "${apiEndPoint}" ...`);

		if (this.cache$.value[apiEndPoint]) {
			const { _timestamp, _ttlInMs, isLoading } = this.cache$.value[apiEndPoint];
			const currentTime = new Date().getTime();

			if (isLoading || _ttlInMs > currentTime - _timestamp) {
				console.log(`[ApiService]: Request for "${apiEndPoint}" was already cached.`);
				return;
			}
		}

		this.cache$.next({
			...this.cache$.value,
			[apiEndPoint]: {
				...(this.cache$.value[apiEndPoint] || {}), // Keep old values while its loading
				isLoading: true
			}
		});

		// Simulate 2 second delay
		setTimeout(() => {
			this.http.get(`http://localhost:3333/api/${apiEndPoint}`).subscribe({
				next: data => {
					console.log(`[ApiService]: Request for "${apiEndPoint}" was saved.`);
					this.cache$.next({
						...this.cache$.value,
						[apiEndPoint]: {
							data,
							isLoading: false,
							_timestamp: new Date().getTime(),
							_ttlInMs: 5_000 // 5 seconds
						}
					});
				},
				error: _error => {
					console.log(`[ApiService]: Request for "${apiEndPoint}" has failed.`);
					this.cache$.next({
						...this.cache$.value,
						[apiEndPoint]: {
							data: null,
							error: "Something went wrong.",
							isLoading: false,
							_timestamp: new Date().getTime(),
							_ttlInMs: 0
						}
					});
				}
			});
		}, 2_000);
	}
}
