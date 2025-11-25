import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { MOCK_DATA } from './shared/mock-data.json';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IHeader } from './shared/model/IHeader.interface';
import { SharedService } from './shared/service/shared.service';
import { CommonModule, DatePipe } from '@angular/common';
import { EmployeeNameCellComponent } from './dynamic-cells/employee-name-cell/employee-name-cell.component';
import { IRowEvent } from './shared/model/IRowEvent.interface';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';

export enum PROGRAMMED_TABLE_ENUM {
  SHIFT = 0,
  BLOCK = 1,
  HORUS = 2,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ScheduleTableComponent,
    CdkAccordionModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatSidenavModule
  ],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('drawer', { static: false }) drawer: any;

  public positions: any[] = [];
  public blocks: any[] = [];

  public headers: IHeader[] = [];
  private _programmedHeaders$ = new BehaviorSubject<any[]>([]);
  public get programmedHeaders(): IHeader[] { return this._programmedHeaders$.getValue() }

  expanded = true;
  dataLoading: Subscription;
  mockDataLoading: boolean;
  programmedLoading: boolean;

  selectedToggle = 1;
  positionsFormControl = new FormControl();

  private _toggle$ = new BehaviorSubject<PROGRAMMED_TABLE_ENUM>(PROGRAMMED_TABLE_ENUM.BLOCK);

  private _dataSource$ = new BehaviorSubject<any[]>([]);
  public get dataSource() { return this._dataSource$.getValue() };
  private _programmedDataSource$ = new BehaviorSubject<any[]>([]);
  public get programmedDataSource() { return this._programmedDataSource$.getValue() };

  /**
  @description
  redSplitter column resize listeners **/
  private resizing = false;
  public topDivInitialHeight = 600;
  public bottomDivInitialHeight = 400;
  private startResizeHeight: number;

  private resizingRed = false;
  private redSplitterStartWidth: number;
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: any) {
    if (event.target['classList'].contains('red-splitter')) {
      this.resizingRed = true;
      this.redSplitterStartWidth = event.clientX;
    }
    if (event.target['classList'].contains('resize')) {
      this.resizing = true;
      this.startResizeHeight = event.clientY;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.resizing) {
      this.resizing = false;
    }
    if (this.resizingRed) {
      this.resizingRed = false;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: any) {
    if (this.resizing) {
      const deltaY = event.clientY - this.startResizeHeight;
      this.topDivInitialHeight += deltaY;
      this.bottomDivInitialHeight -= deltaY;
      this.startResizeHeight = event.clientY;
    }
    if (this.resizingRed) {
      const deltaX = event.clientX - this.redSplitterStartWidth;
      const splitter: any = document.getElementsByClassName('red-splitter')[0];
      const targetWidth = splitter.clientWidth + (deltaX / 20);
      this.sharedService.setColumnWidth = targetWidth;
      splitter.style['min-width'] = `${targetWidth}px`;
      splitter.style['max-width'] = `${targetWidth}px`;
      this.cdr.detectChanges();
    }
  }


  constructor(
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
  ) { }

  public resize_onEvent(event: MouseEvent) {
    if (this.resizing) {
      const deltaY = event.clientY - this.startResizeHeight;
      this.topDivInitialHeight += deltaY;
      this.bottomDivInitialHeight -= deltaY;
      this.startResizeHeight = event.clientY;
    }
  }

  ngOnInit(): void {
    this.initHeaders();
    this.getData();
    this.redColumnWidthListener();
  }

  private redColumnWidthListener() {
    /* red splitter column */
    this.sharedService.columnWidthAsObs.subscribe((width: number) => {
      if (width) {
        const splitter: any = document.getElementsByClassName('down-column')[0];
        splitter.style['min-width'] = `${width}px`;
        splitter.style['max-width'] = `${width}px`;
      }
    });
  }

  public table_onRowEvent(event: IRowEvent): void {
    console.log(event);
    this.drawer.toggle();
  }

  public toggle_onClick(index: PROGRAMMED_TABLE_ENUM) {
    this.selectedToggle = index;
    this._toggle$.next(index);
  }

  apply_onClick() { }

  available_onClick() { }

  getData() {
    this.initMockData();
  }

  initMockData() {
    this._dataSource$.next(
      MOCK_DATA.map((el: any, i: number) => {
        return {
          ...el,
          i: i + 1,
          Schedule: JSON.parse(el.Schedule).map((s: any) => {
            return {
              ...s,
              blockList: s.blockList ? JSON.parse(s.blockList) : []
            }
          })
        }
      }),
    );
  }

  initHeaders() {
    this.initDefaultHeaders();
  }

  initDefaultHeaders() {
    this.headers = [
      {
        title: 'COL 1',
        key: 'FullName',
        dynamicCellComponent: EmployeeNameCellComponent,
        filterable: true,
        sortable: true,
        width: 250,
      },
      {
        title: 'COL 2',
        key: 'EligibilityToBeTrainee',
        filterable: true,
        sortable: true,
        width: 150
      },
      {
        title: 'COL 3',
        key: 'RnTierTitle',
        filterable: true,
        sortable: true,
        width: 250,
      },
    ];
  }
}
