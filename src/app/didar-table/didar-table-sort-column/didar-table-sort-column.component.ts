import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IHeader } from '../shared/model/IHeader.interface';
import { DidarTableService } from '../shared/service/didar-table.service';

export enum SORT_ENUM {
  ASC = 0,
  DESC = 1,
}

interface SortColumnInterface {
  key: string,
  mode: SORT_ENUM
}

@Component({
  selector: 'didar-table-sort-column',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './didar-table-sort-column.component.html',
  styleUrl: './didar-table-sort-column.component.scss'
})
export class DidarTableSortColumnComponent {
  @Input() header: IHeader;
  @Input() currentPageData: any[] = [];
  @Output() sortChange: EventEmitter<SortColumnInterface> = new EventEmitter()

  constructor(private tableService: DidarTableService) { }

  public sortChange_onClick(mode: SORT_ENUM) {
    const emitModel: SortColumnInterface = {
      key: this.header.key,
      mode
    }
    this.sortChange.emit(emitModel)
    // if (!this.currentPageData || this.currentPageData.length === 0) {
    //   return;
    // }

    // // Sort only the current page data
    // const sortedPageData = [...this.currentPageData].sort((a, b) => {
    //   const valueA = a[this.header.key];
    //   const valueB = b[this.header.key];

    //   // Handle null/undefined values
    //   if (valueA == null && valueB == null) return 0;
    //   if (valueA == null) return mode === SORT_ENUM.ASC ? -1 : 1;
    //   if (valueB == null) return mode === SORT_ENUM.ASC ? 1 : -1;

    //   // Handle numbers (including Persian numbers converted to English)
    //   const numA = this.tryParseNumber(valueA);
    //   const numB = this.tryParseNumber(valueB);

    //   if (numA !== null && numB !== null) {
    //     return mode === SORT_ENUM.ASC ? numA - numB : numB - numA;
    //   }

    //   // Handle strings with proper locale-aware sorting
    //   const stringA = this.prepareForSorting(valueA);
    //   const stringB = this.prepareForSorting(valueB);

    //   // Use localeCompare with Persian locale for proper sorting
    //   const comparison = stringA.localeCompare(stringB, 'fa-IR', {
    //     sensitivity: 'base',
    //     numeric: true,
    //     ignorePunctuation: true
    //   });

    //   return mode === SORT_ENUM.ASC ? comparison : -comparison;
    // });

    // Update only the current page in the displayed data
    // We need to update the main data source to reflect this change
    // this.updateDataSourceWithSortedPage(sortedPageData);
  }

  // private updateDataSourceWithSortedPage(sortedPageData: any[]): void {
  //   const currentDataSource = [...this.tableService.dataSource];
  //   const startIndex = (this.getCurrentPage() - 1) * this.getPageSize();

  //   // Replace only the current page items in the data source
  //   sortedPageData.forEach((sortedItem, index) => {
  //     const dataSourceIndex = startIndex + index;
  //     if (dataSourceIndex < currentDataSource.length) {
  //       currentDataSource[dataSourceIndex] = sortedItem;
  //     }
  //   });

  //   this.tableService.setDataSource = currentDataSource;
  // }

  // // Helper methods to get current page and page size (you might need to pass these as inputs)
  // private getCurrentPage(): number {
  //   // You'll need to get this from the parent component
  //   // For now, return 1 as default
  //   return 1;
  // }

  // private getPageSize(): number {
  //   // You'll need to get this from the parent component  
  //   // For now, return 10 as default
  //   return 10;
  // }

  // private tryParseNumber(value: any): number | null {
  //   if (typeof value === 'number') return value;

  //   if (typeof value === 'string') {
  //     const normalized = value
  //       .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
  //       .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  //     const num = parseFloat(normalized.replace(/[^\d.-]/g, ''));
  //     return isNaN(num) ? null : num;
  //   }

  //   return null;
  // }

  // private prepareForSorting(value: any): string {
  //   if (value == null) return '';

  //   const stringValue = String(value).trim();

  //   return stringValue
  //     .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
  //     .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  // }
}