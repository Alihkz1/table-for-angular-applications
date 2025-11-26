import { Component, OnInit } from '@angular/core';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { IHeader } from './shared/model/IHeader.interface';
import { CommonModule } from '@angular/common';
import { IRowEvent } from './shared/model/IRowEvent.interface';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ACTIVITY_LIST } from './shared/mock-data/MOCK_DATA';
import { ActionsCellComponent } from './dynamic-cells/actions-cell/actions-cell.component';

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
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  public headers: IHeader[] = [];
  public ACTIVITY_DATA = ACTIVITY_LIST
  public mockDataLoading: boolean = true

  ngOnInit(): void {
    this._initHeaders();
    setTimeout(() => {
      this.mockDataLoading = false
    }, 1000);
  }

  public table_onRowEvent(event: IRowEvent): void {
    console.log(event)
  }

  public onPageChange(event: { page: number, pageSize: number }): void {
    console.log('onPageChange -> ', event)
  }

  private _initHeaders() {
    this.headers = [
      {
        title: 'عنوان فعالیت',
        key: 'Title',
        filterable: true,
        sortable: true,
        width: 100,
      },
      {
        title: 'مسئول انجام',
        key: 'Owner',
        filterable: true,
        sortable: true,
        width: 150,
        valueFormatter: (v) => v.DisplayName
      },
      {
        title: 'تاریخ فعالیت',
        key: 'RegisterDate',
        filterable: true,
        sortable: true,
        width: 250,
      },
      // {
      //   title: 'اشخاص و افراد مرتبط',
      //   key: '',
      //   filterable: true,
      //   sortable: true,
      //   width: 250,
      // },
      // {
      //   title: 'معامله مرتبط',
      //   key: '',
      //   filterable: true,
      //   sortable: true,
      //   width: 250,
      // },
      // {
      //   title: 'کارت مرتبط',
      //   key: '',
      //   filterable: true,
      //   sortable: true,
      //   width: 250,
      // },
      {
        title: 'عملیات',
        key: 'actions',
        dynamicCellComponent: ActionsCellComponent,
        filterable: true,
        sortable: false,
        width: 250,
      },
    ];
  }
}
