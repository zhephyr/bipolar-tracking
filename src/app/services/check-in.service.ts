import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { CheckIn } from '../models/check-in.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private apiUrl = 'http://localhost:5222/api/checkins';

  constructor(private http: HttpClient) {}

  getCheckIns(days: number = 30): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(`${this.apiUrl}?days=${days}`);
  }

  saveCheckIn(checkIn: CheckIn): Observable<CheckIn> {
    return this.http.post<CheckIn>(this.apiUrl, checkIn);
  }

  saveMultipleCheckIns(checkIns: CheckIn[]): Observable<CheckIn[]> {
    return forkJoin(checkIns.map(ci => this.saveCheckIn(ci)));
  }
}
