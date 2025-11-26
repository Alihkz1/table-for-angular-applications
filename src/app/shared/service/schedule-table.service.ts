import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ScheduleTableService {
  private _dataSource$ = new BehaviorSubject<any[]>([])
  public get dataSource(): any[] { return this._dataSource$.getValue() }
  public set setDataSource(value: any[]) { this._dataSource$.next(value) }
  public get dataSourceObs(): Observable<any[]> { return this._dataSource$.asObservable() }
}
