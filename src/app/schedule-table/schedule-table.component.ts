import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ElementRef } from '@angular/core';
import { IHeader } from '../shared/model/IHeader.interface';
import { CommonModule } from '@angular/common';
import { DynamicCellDirective } from '../shared/directive/dynamic-cell.directive';
import { IRowEvent } from '../shared/model/IRowEvent.interface';
import { ScheduleTableFilterColumnComponent } from './schedule-table-filter-column/schedule-table-filter-column.component';
import { ScheduleTableService } from '../shared/service/schedule-table.service';
import { Subject } from 'rxjs';
import { ScheduleTableSortColumnComponent } from './schedule-table-sort-column/schedule-table-sort-column.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'schedule-table',
  standalone: true,
  imports: [
    CommonModule,
    DynamicCellDirective,
    ScheduleTableFilterColumnComponent,
    ScheduleTableSortColumnComponent,
    ScrollingModule
  ],
  providers: [ScheduleTableService],
  templateUrl: './schedule-table.component.html',
  styleUrl: './schedule-table.component.scss'
})
export class ScheduleTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() headers: IHeader[] = [];
  @Input() set data(data: any[]) { this.tableService.setDataSource = data; };
  @Input() rowHeight = 50;
  @Input() loading: boolean = false;
  @Input() direction: 'rtl' | 'ltr' = 'rtl';
  @Output() onRowEvent: EventEmitter<IRowEvent> = new EventEmitter();
  @Output() columnsReordered: EventEmitter<IHeader[]> = new EventEmitter();
  @Output() rowsReordered: EventEmitter<any[]> = new EventEmitter();

  private _unSubscribe$ = new Subject<void>();

  // Column resize variables
  private resizing = false;
  private startX: number;
  private startWidth: number;
  private currentColumn: HTMLElement | null = null;

  // Column reordering variables
  public isDragging = false;
  public dragColumnIndex: number = -1;
  private dragColumn: HTMLElement | null = null;
  private dragGhost: HTMLElement | null = null;
  public dragOverIndex: number = -1;

  // Row reordering variables
  public isRowDragging = false;
  public dragRowIndex: number = -1;
  private dragRowElement: HTMLElement | null = null;
  private dragRowGhost: HTMLElement | null = null;
  public dragOverRowIndex: number = -1;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Check if resizer was clicked
    if ((event.target as Element).classList.contains('resizer')) {
      this.startColumnResize(event);
    }
    // Check if column header was clicked for dragging (but not on resizer or filter/sort elements)
    else if ((event.target as Element).closest('th') &&
      !(event.target as Element).closest('.resizer') &&
      !(event.target as Element).closest('schedule-table-filter-column') &&
      !(event.target as Element).closest('schedule-table-sort-column') &&
      !(event.target as Element).closest('.drag-handle-column')) {
      this.startColumnDrag(event);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.resizing) {
      this.resizing = false;
      this.currentColumn = null;
    }

    if (this.isDragging) {
      this.finishColumnDrag();
    }

    if (this.isRowDragging) {
      this.finishRowDrag();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.resizing && this.currentColumn) {
      this.handleColumnResize(event);
    }

    if (this.isDragging && this.dragGhost) {
      this.updateDragGhostPosition(event);
      this.updateDropTarget(event);
    }

    if (this.isRowDragging && this.dragRowGhost) {
      this.updateRowDragGhostPosition(event);
      this.updateRowDropTarget(event);
    }
  }

  constructor(
    private _cdr: ChangeDetectorRef,
    public tableService: ScheduleTableService,
    private _elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this._filterColumnsListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['direction']) {
      this._cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this._unSubscribe$.next();
    this._unSubscribe$.complete();
  }

  private _filterColumnsListener() {
    // this.tableService.columnFiltersObs.pipe(takeUntil(this._unSubscribe$)).subscribe((result) => {
    //   if (!Object.keys(result).length) {
    //     this.tableService.setDataSource = [];
    //     return;
    //   }
    //   let items: any[] = [];
    //   Object.keys(result).forEach((key, i) => {
    //     if (i === 0)
    //       items = this.tableService.realDataSource.filter((el) => el[key]?.toLowerCase().includes(result[key]));
    //     else if (i > 0)
    //       items = items.filter((el) => el[key].toLowerCase().includes(result[key]));
    //   });
    //   this.tableService.setDataSource = items;
    // });
  }

  // Column Resize Methods
  private startColumnResize(event: MouseEvent): void {
    this.resizing = true;
    this.startX = event.clientX;
    this.currentColumn = (event.target as Element).closest('th') as HTMLElement;

    if (this.currentColumn) {
      this.startWidth = this.currentColumn.offsetWidth;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private handleColumnResize(event: MouseEvent): void {
    const deltaX = event.clientX - this.startX;
    const newWidth = this.startWidth + deltaX;

    const minWidth = 50;
    const finalWidth = Math.max(minWidth, newWidth);

    if (this.currentColumn) {
      this.currentColumn.style.width = `${finalWidth}px`;
      this.currentColumn.style.minWidth = `${finalWidth}px`;

      // Update the header width in the headers array
      const columnIndex = Array.from(this.currentColumn.parentElement!.children).indexOf(this.currentColumn) - 1; // Adjust for drag handle
      if (columnIndex >= 0 && columnIndex < this.headers.length) {
        this.headers[columnIndex].width = finalWidth;
      }
    }

    event.preventDefault();
  }

  // Column Drag & Drop Methods - UPDATED FOR RTL/LTR
  private startColumnDrag(event: MouseEvent): void {
    const thElement = (event.target as Element).closest('th') as HTMLElement;
    if (!thElement) return;

    this.isDragging = true;
    this.dragColumn = thElement;
    this.dragColumnIndex = Array.from(thElement.parentElement!.children).indexOf(thElement) - 1; // Adjust for drag handle column

    this.createDragGhost(thElement, event.clientX, event.clientY);
    thElement.classList.add('column-dragging');
    event.preventDefault();
    event.stopPropagation();
  }

  private createDragGhost(originalElement: HTMLElement, clientX: number, clientY: number): void {
    this.dragGhost = originalElement.cloneNode(true) as HTMLElement;
    this.dragGhost.classList.add('drag-ghost');

    const rect = originalElement.getBoundingClientRect();
    this.dragGhost.style.position = 'fixed';
    this.dragGhost.style.left = `${rect.left}px`;
    this.dragGhost.style.top = `${rect.top}px`;
    this.dragGhost.style.width = `${rect.width}px`;
    this.dragGhost.style.height = `${rect.height}px`;
    this.dragGhost.style.zIndex = '9999';
    this.dragGhost.style.opacity = '0.9';
    this.dragGhost.style.pointerEvents = 'none';
    this.dragGhost.style.cursor = 'grabbing';
    this.dragGhost.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    this.dragGhost.style.background = '#00AF9E'; // Updated to match your theme
    this.dragGhost.style.border = '2px solid #0d8377'; // Updated to match your theme
    this.dragGhost.style.borderRadius = '4px';
    this.dragGhost.style.transform = 'rotate(2deg) scale(1.02)';
    this.dragGhost.style.transition = 'none';

    const interactiveElements = this.dragGhost.querySelectorAll('.resizer, schedule-table-filter-column, schedule-table-sort-column');
    interactiveElements.forEach(el => el.remove());

    document.body.appendChild(this.dragGhost);
    this.dragGhost.style.left = `${clientX - rect.width / 2}px`;
    this.dragGhost.style.top = `${clientY - 10}px`;
  }

  private updateDragGhostPosition(event: MouseEvent): void {
    if (!this.dragGhost) return;

    const rect = this.dragGhost.getBoundingClientRect();
    this.dragGhost.style.left = `${event.clientX - rect.width / 2}px`;
    this.dragGhost.style.top = `${event.clientY - 10}px`;
  }

  private updateDropTarget(event: MouseEvent): void {
    const thElements = this._elementRef.nativeElement.querySelectorAll('th:not(.drag-handle-column)');
    const tableRect = this._elementRef.nativeElement.getBoundingClientRect();

    if (event.clientX < tableRect.left || event.clientX > tableRect.right) {
      this.clearDropTargets();
      this.dragOverIndex = -1;
      return;
    }

    let closestIndex = -1;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    thElements.forEach((th: HTMLElement, index: number) => {
      const thRect = th.getBoundingClientRect();
      const thCenterX = thRect.left + thRect.width / 2;
      const distance = Math.abs(event.clientX - thCenterX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    this.clearDropTargets();

    if (closestIndex !== -1) {
      const targetTh = thElements[closestIndex] as HTMLElement;
      const thRect = targetTh.getBoundingClientRect();
      const thCenterX = thRect.left + thRect.width / 2;

      // Handle RTL/LTR logic for drop positioning
      if (this.direction === 'rtl') {
        // In RTL, left side becomes right side and vice versa
        if (event.clientX > thCenterX) {
          targetTh.classList.add('drag-over-left');
          this.dragOverIndex = closestIndex;
        } else {
          targetTh.classList.add('drag-over-right');
          this.dragOverIndex = closestIndex + 1;
        }
      } else {
        // LTR - normal behavior
        if (event.clientX < thCenterX) {
          targetTh.classList.add('drag-over-left');
          this.dragOverIndex = closestIndex;
        } else {
          targetTh.classList.add('drag-over-right');
          this.dragOverIndex = closestIndex + 1;
        }
      }
    }
  }

  private clearDropTargets(): void {
    const thElements = this._elementRef.nativeElement.querySelectorAll('th');
    thElements.forEach((th: HTMLElement) => {
      th.classList.remove('drag-over-left', 'drag-over-right');
    });
  }

  private finishColumnDrag(): void {
    if (this.dragColumnIndex !== this.dragOverIndex && this.dragOverIndex !== -1) {
      this.reorderColumns(this.dragColumnIndex, this.dragOverIndex);
    }
    this.cleanupColumnDrag();
    this._cdr.detectChanges();
  }

  private reorderColumns(fromIndex: number, toIndex: number): void {
    const newHeaders = [...this.headers];
    const [movedHeader] = newHeaders.splice(fromIndex, 1);
    newHeaders.splice(toIndex, 0, movedHeader);
    this.headers = newHeaders;
    this.columnsReordered.emit(this.headers);
  }

  private cleanupColumnDrag(): void {
    if (this.dragGhost) {
      document.body.removeChild(this.dragGhost);
      this.dragGhost = null;
    }
    if (this.dragColumn) {
      this.dragColumn.classList.remove('column-dragging');
      this.dragColumn = null;
    }
    this.clearDropTargets();
    this.isDragging = false;
    this.dragColumnIndex = -1;
    this.dragOverIndex = -1;
  }

  public startRowDrag(event: MouseEvent, rowIndex: number): void {
    const rowElement = (event.target as Element).closest('tr') as HTMLElement;
    if (!rowElement) return;

    this.isRowDragging = true;
    this.dragRowIndex = rowIndex;
    this.dragRowElement = rowElement;

    this.createRowDragGhost(rowElement, event.clientX, event.clientY);
    rowElement.classList.add('row-dragging');

    event.preventDefault();
    event.stopPropagation();
  }

  private createRowDragGhost(originalElement: HTMLElement, clientX: number, clientY: number): void {
    this.dragRowGhost = originalElement.cloneNode(true) as HTMLElement;
    this.dragRowGhost.classList.add('row-drag-ghost');

    const rect = originalElement.getBoundingClientRect();
    this.dragRowGhost.style.position = 'fixed';
    this.dragRowGhost.style.left = `${rect.left}px`;
    this.dragRowGhost.style.top = `${rect.top}px`;
    this.dragRowGhost.style.width = `${rect.width}px`;
    this.dragRowGhost.style.height = `${rect.height}px`;
    this.dragRowGhost.style.zIndex = '9998';
    this.dragRowGhost.style.opacity = '0.9';
    this.dragRowGhost.style.pointerEvents = 'none';
    this.dragRowGhost.style.cursor = 'grabbing';
    this.dragRowGhost.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    this.dragRowGhost.style.background = '#ffffff';
    this.dragRowGhost.style.border = '1px solid #0d8377'; // Updated to match your theme
    this.dragRowGhost.style.transition = 'none';

    // Remove any existing drag handle styling that might cause misalignment
    const dragHandle = this.dragRowGhost.querySelector('.drag-handle-cell');
    if (dragHandle) {
      (dragHandle as HTMLElement).style.background = '#f8f9fa';
    }

    document.body.appendChild(this.dragRowGhost);

    // Set initial position to match cursor - FIXED POSITIONING
    const ghostRect = this.dragRowGhost.getBoundingClientRect();
    this.dragRowGhost.style.left = `${rect.left}px`;
    this.dragRowGhost.style.top = `${clientY - 10}px`; // Offset to center on cursor
  }

  private updateRowDragGhostPosition(event: MouseEvent): void {
    if (!this.dragRowGhost) return;

    const rect = this.dragRowGhost.getBoundingClientRect();
    // Keep the same horizontal position, only update vertical
    this.dragRowGhost.style.top = `${event.clientY - 10}px`;
  }

  private updateRowDropTarget(event: MouseEvent): void {
    const rowElements = this._elementRef.nativeElement.querySelectorAll('tbody tr');
    const tableRect = this._elementRef.nativeElement.getBoundingClientRect();

    if (event.clientY < tableRect.top || event.clientY > tableRect.bottom) {
      this.clearRowDropTargets();
      this.dragOverRowIndex = -1;
      return;
    }

    let closestIndex = -1;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    rowElements.forEach((row: HTMLElement, index: number) => {
      const rowRect = row.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2;
      const distance = Math.abs(event.clientY - rowCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    this.clearRowDropTargets();

    if (closestIndex !== -1) {
      const targetRow = rowElements[closestIndex] as HTMLElement;
      const rowRect = targetRow.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2;

      if (event.clientY < rowCenterY) {
        targetRow.classList.add('drag-over-above');
        this.dragOverRowIndex = closestIndex;
      } else {
        targetRow.classList.add('drag-over-below');
        this.dragOverRowIndex = closestIndex + 1;
      }
    }
  }

  private clearRowDropTargets(): void {
    const rowElements = this._elementRef.nativeElement.querySelectorAll('tbody tr');
    rowElements.forEach((row: HTMLElement) => {
      row.classList.remove('drag-over-above', 'drag-over-below');
    });
  }

  private finishRowDrag(): void {
    if (this.dragRowIndex !== this.dragOverRowIndex && this.dragOverRowIndex !== -1) {
      this.reorderRows(this.dragRowIndex, this.dragOverRowIndex);
    }
    this.cleanupRowDrag();
    this._cdr.detectChanges();
  }

  private reorderRows(fromIndex: number, toIndex: number): void {
    const currentData = [...this.tableService.dataSource];
    const [movedRow] = currentData.splice(fromIndex, 1);
    currentData.splice(toIndex, 0, movedRow);

    this.tableService.setDataSource = currentData;
    this.rowsReordered.emit(currentData);
  }

  private cleanupRowDrag(): void {
    if (this.dragRowGhost) {
      document.body.removeChild(this.dragRowGhost);
      this.dragRowGhost = null;
    }
    if (this.dragRowElement) {
      this.dragRowElement.classList.remove('row-dragging');
      this.dragRowElement = null;
    }
    this.clearRowDropTargets();
    this.isRowDragging = false;
    this.dragRowIndex = -1;
    this.dragOverRowIndex = -1;
  }

  public scroll_onChange() {
    this._cdr.detectChanges();
  }

  public resizeColumn_onMouseDown(event: MouseEvent, index: number) {
    const resizer = event.currentTarget as HTMLElement;
    resizer.setAttribute('data-column-index', index.toString());
  }

  trackByHeader(index: number, header: IHeader): string {
    return header.key || index.toString();
  }
}