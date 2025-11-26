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

  mockDataLoading: boolean;

  public ACTIVITY_DATA = ACTIVITY_LIST

  ngOnInit(): void {
    this.initHeaders();
  }

  public table_onRowEvent(event: IRowEvent): void {

  }

  initHeaders() {
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
        key: 'EligibilityToBeTrainee',
        filterable: true,
        sortable: true,
        width: 150
      },
      {
        title: 'تاریخ فعالیت',
        key: 'RnTierTitle',
        filterable: true,
        sortable: true,
        width: 250,
      },
      {
        title: 'اشخاص و افراد مرتبط',
        key: 'RnTierTitle',
        filterable: true,
        sortable: true,
        width: 250,
      },
    ];
  }
}
