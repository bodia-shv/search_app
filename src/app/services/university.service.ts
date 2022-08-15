import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {distinct, map, take, tap} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UniversityService {

  static url = 'http://universities.hipolabs.com/';

  constructor(private http: HttpClient) {
  }

  getCountries(): Observable<any[]>{
    return this.http
      .get<any[]>(`${UniversityService.url + 'search'}`)
      .pipe(
        take(1),
        map(response => {
          const uniques = new Set();
          return response.reduce((arr, current) => {
            if (!uniques.has(current.country)) {
              arr.push(current.country);
              uniques.add(current.country);
            }
            return arr;
          }, []);
        })
      )
  }

  load(search: string): Observable<any[]>{
    const params = new HttpParams()
      .append('country', search);
    return this.http
      .get<any[]>(`${UniversityService.url + 'search'}`, {params})
      .pipe(
        take(1)
      )
  }
}
