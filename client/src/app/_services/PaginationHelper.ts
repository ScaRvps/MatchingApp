import { map } from 'rxjs/operators';
import { HttpParams, HttpClient } from '@angular/common/http';
import { PaginatedResult } from '../_models/Pagination';

export function getPaginationHeaderParams(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());

    return params;
}

export function getPaginatedResults<T>(url: string, params: HttpParams, http: HttpClient) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return http.get<T>(url, { observe: 'response', params }).pipe(
        map(response => {
            paginatedResult.result = response.body;
            if (response.headers.get("Pagination") !== null) {
                paginatedResult.pagination = JSON.parse(response.headers.get("Pagination"));
            }
            return paginatedResult;
        })
    );
}