import { BehaviorSubject } from "rxjs";

export class DidarTableService {
  private _dataSource: any[] = [];
  private _originalDataSource: any[] = [];
  
  dataSourceObs = new BehaviorSubject<any[]>(this._dataSource);

  set setDataSource(data: any[]) {
    this._dataSource = data;
    this._originalDataSource = [...data];
    this.dataSourceObs.next(this._dataSource);
  }

  get dataSource(): any[] {
    return this._dataSource;
  }

  get getOriginalDataSource(): any[] {
    return this._originalDataSource;
  }

  public updateDataSource(data: any[]): void {
    this._dataSource = data;
    this._originalDataSource = [...data];
    this.dataSourceObs.next(this._dataSource);
  }
}