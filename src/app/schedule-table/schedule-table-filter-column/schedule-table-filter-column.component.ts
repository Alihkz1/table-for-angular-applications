import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { IHeader } from '../../shared/model/IHeader.interface';

@Component({
  selector: 'schedule-table-filter-column',
  standalone: true,
  imports: [NgbModule, ReactiveFormsModule],
  templateUrl: './schedule-table-filter-column.component.html',
  styleUrl: './schedule-table-filter-column.component.scss'
})
export class ScheduleTableFilterColumnComponent {
  // @Input() header: IHeader;
  // @ViewChild('popover') popover: NgbPopover;

  // formControl = new FormControl('');

  // constructor(private tableService: ScheduleTableService) { }

  // saveFilter_onClick() {
  //   const formValue = this.formControl.value?.toLowerCase();
  //   if (!formValue?.length) {
  //     this.popover.close();
  //     return;
  //   }
  //   const columnFilters = this.tableService.columnFilters;
  //   columnFilters[this.header.key] = formValue;
  //   this.tableService.setColumnFilters = columnFilters;
  //   this.popover.close();
  // }

  // handleKeyPress(event: KeyboardEvent) {
  //   if (event.code === 'Enter') this.saveFilter_onClick();
  // }

  // clearFilter_onClick() {
  //   this.formControl.reset();
  //   this.popover.close();
  //   const columnFilters = this.tableService.columnFilters;
  //   delete columnFilters[this.header.key];
  //   this.tableService.setColumnFilters = columnFilters;
  // }
}
