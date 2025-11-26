import { Component, Input } from '@angular/core';
import { IHeader } from '../../shared/model/IHeader.interface';
import { CommonModule } from '@angular/common';
import { ScheduleTableService } from '../../shared/service/schedule-table.service';

export enum SORT_ENUM {
  ASC = 0,
  DESC = 1,
}

@Component({
  selector: 'schedule-table-sort-column',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-table-sort-column.component.html',
  styleUrl: './schedule-table-sort-column.component.scss'
})
export class ScheduleTableSortColumnComponent {
  @Input() header: IHeader;

  constructor(private tableService: ScheduleTableService) { }

  sortChange_onClick(mode: SORT_ENUM) {
    this.tableService.setDataSource = this.tableService.dataSource.sort((a, b) => {
      const valueA = a[this.header.key];
      const valueB = b[this.header.key];
      
      // Handle null/undefined values
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return mode === SORT_ENUM.ASC ? -1 : 1;
      if (valueB == null) return mode === SORT_ENUM.ASC ? 1 : -1;

      // Handle numbers (including Persian numbers converted to English)
      const numA = this.tryParseNumber(valueA);
      const numB = this.tryParseNumber(valueB);
      
      if (numA !== null && numB !== null) {
        return mode === SORT_ENUM.ASC ? numA - numB : numB - numA;
      }

      // Handle strings with proper locale-aware sorting
      const stringA = this.prepareForSorting(valueA);
      const stringB = this.prepareForSorting(valueB);
      
      // Use localeCompare with Persian locale for proper sorting
      const comparison = stringA.localeCompare(stringB, 'fa-IR', {
        sensitivity: 'base',
        numeric: true,
        ignorePunctuation: true
      });
      
      return mode === SORT_ENUM.ASC ? comparison : -comparison;
    });
  }

  private tryParseNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Convert Persian numbers to English
      const normalized = value
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      
      const num = parseFloat(normalized.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? null : num;
    }
    
    return null;
  }

  private prepareForSorting(value: any): string {
    if (value == null) return '';
    
    const stringValue = String(value).trim();
    
    // Convert Persian numbers to English for consistent numeric sorting
    return stringValue
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  }
}