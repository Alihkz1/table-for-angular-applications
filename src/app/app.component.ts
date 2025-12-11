import { Component, OnInit } from '@angular/core';
import { DidarTableComponent } from './didar-table/didar-table.component';
import { CommonModule } from '@angular/common';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ACTIVITY_LIST } from './shared/mock-data/MOCK_DATA';
import { IHeader } from './didar-table/shared/model/IHeader.interface';
import { IRowEvent } from './didar-table/shared/model/IRowEvent.interface';
import { Router } from '@angular/router';
import { DealCellComponent } from './dynamic-cells/deal-cell/deal-cell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DidarTableComponent,
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
  public loading: boolean = true

  constructor(private _router: Router) { }

  ngOnInit(): void {
    this._initTableConfig();
    setTimeout(() => {
      this.loading = false
    }, 1000);
  }

  public table_onRowEvent(event: IRowEvent): void {
    console.log(event)
  }

  public onPageChange(event: { page: number, pageSize: number }): void {
    console.log('onPageChange -> ', event)
  }

   public onColumnToggle(headers: IHeader[]) {
    const sessionStorageKey = this._router.url.split(';')[0];
    const visibilityConfig = headers.map(header => ({
      title: header.title,
      key: header.key,
      visible: header.visible !== false,
      width: header.width
    }));
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(visibilityConfig));
  }


  private _initTableConfig() {
    const sessionStorageKey = this._router.url.split(';')[0];
    const sessionCols = JSON.parse(sessionStorage.getItem(sessionStorageKey) || '{}');

    const allHeaders = [
      {
        title: 'معامله',
        key: 'Deal',
        sortable: false,
        width: 100,
        dynamicCellComponent: DealCellComponent,
      },
      {
        title: 'شخص',
        key: 'Person',
        sortable: false,
        width: 100,
        dynamicCellComponent: DealCellComponent
      },
      {
        title: 'شرکت',
        key: 'Company',
        sortable: false,
        width: 100,
        dynamicCellComponent: DealCellComponent
      },
      {
        title: 'مبلغ معامله',
        key: 'Deal',
        sortable: false,
        width: 80,
      },
      {
        title: 'مبلغ پرداخت',
        key: 'Amount',
        sortable: false,
        width: 80,
      },
      {
        title: 'ارز',
        key: 'CurrencyId',
        sortable: false,
        width: 40,
      },
      {
        title: 'وضعیت پرداخت',
        key: 'IsPaid',
        sortable: false,
        width: 80,
        valueFormatter: () => 'تایید شده'
      },
      {
        title: 'تاخیر پرداخت',
        key: 'takhir',
        sortable: false,
        width: 80,
      },
      {
        title: 'موعد پرداخت',
        key: 'DueDate',
        sortable: false,
        width: 80,
      },
      {
        title: "تاریخ تایید پرداخت",
        key: 'PayedDate',
        sortable: false,
        width: 80,
      },
      {
        title: 'تایید کننده پرداخت',
        key: 'PayerId',
        sortable: false,
        width: 80,
      },
      {
        title: 'ثبت کننده پرداخت',
        key: 'CreatorId',
        sortable: false,
        width: 90,
      },
      {
        title: "تاریخ ثبت پرداخت",
        key: 'CreatedDate',
        sortable: false,
        width: 90,
      },
      {
        title: "توضیحات",
        key: 'PaymentNote',
        sortable: false,
        width: 350,
      },
    ];

    this._setHeaders(sessionCols, allHeaders)
  }

  private _setHeaders(sessionCols: any, allHeaders: any) {
    if (sessionCols && Array.isArray(sessionCols)) {
      this.headers = allHeaders.map((header: any) => {
        const savedCol = sessionCols.find((col: any) =>
          col.title === header.title && col.key === header.key
        );
        if (savedCol) {
          return {
            ...header,
            visible: savedCol.visible !== false,
            width: savedCol.width || header.width
          };
        }
        return {
          ...header,
          visible: true
        };
      });
    } else {
      this.headers = allHeaders.map((header: any) => ({
        ...header,
        visible: true
      }));
    }
  }

}
