import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ElementRef, AfterViewInit } from '@angular/core';
import { IHeader } from '../shared/model/IHeader.interface';
import { CommonModule } from '@angular/common';
import { DynamicCellDirective } from '../shared/directive/dynamic-cell.directive';
import { IRowEvent } from '../shared/model/IRowEvent.interface';
import { DidarTableService } from '../shared/service/didar-table.service';
import { DidarTableSortColumnComponent, SORT_ENUM } from './didar-table-sort-column/didar-table-sort-column.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ColumnsVisibilityComponent } from './columns-visibility/columns-visibility.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'didar-table',
  standalone: true,
  imports: [
    CommonModule,
    DynamicCellDirective,
    DidarTableSortColumnComponent,
    ScrollingModule,
    ColumnsVisibilityComponent,
    FormsModule
  ],
  providers: [DidarTableService],
  templateUrl: './didar-table.component.html',
  styleUrl: './didar-table.component.scss'
})
export class DidarTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() headers: IHeader[] = [];
  private originalData: any[] = [];
  @Input() set data(data: any[]) {
    this.tableService.setDataSource = data;
    this.originalData = [...data];
  };
  @Input() rowHeight = 50;
  @Input() loading: boolean = false;
  @Input() direction: 'rtl' | 'ltr' = 'rtl';
  @Input() themeColor: string = '#00AF9E';
  @Output() onRowEvent: EventEmitter<IRowEvent> = new EventEmitter();
  @Output() columnsReordered: EventEmitter<IHeader[]> = new EventEmitter();
  @Output() rowsReordered: EventEmitter<any[]> = new EventEmitter();
  @Output() pageChanged = new EventEmitter<{ page: number, pageSize: number }>();

  @Input() pageSize: number = 10;
  @Input() showPagination: boolean = true;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  private resizing = false;
  private resizingColumnIndex: number = -1;
  private startX: number = 0;
  private startWidth: number = 0;
  private currentColumn: HTMLElement | null = null;

  public isDragging = false;
  public dragColumnIndex: number = -1;
  private dragColumn: HTMLElement | null = null;
  private dragGhost: HTMLElement | null = null;
  public dragOverIndex: number = -1;

  public isRowDragging = false;
  public dragRowIndex: number = -1;
  private dragRowElement: HTMLElement | null = null;
  private dragRowGhost: HTMLElement | null = null;
  public dragOverRowIndex: number = -1;

  public currentPage: number = 1;
  public totalPages: number = 1;
  public paginatedData: any[] = [];

  public showColumnsMenu = false;
  private originalHeaders: IHeader[] = [];

  public Math = Math;

  get visibleHeaders(): IHeader[] {
    return this.headers.filter(header => header.visible !== false);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.resizing) {
      this.finishColumnResize();
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
    if (this.resizing) {
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
    public tableService: DidarTableService,
    private _elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.initializeHeadersVisibility();
    this.updatePagination();
    this.tableService.dataSourceObs.subscribe((res) => {
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  ngAfterViewInit(): void {
    this.initializeScrollPosition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['headers']) {
      this.initializeHeadersVisibility();
    }
    if (changes['direction']) {
      this._cdr.detectChanges();
      setTimeout(() => this.initializeScrollPosition(), 0);
    }
    if (changes['data'] || changes['pageSize']) {
      this.updatePagination();
      this.currentPage = 1;
    }
  }

  ngOnDestroy(): void { }

  private updatePagination(): void {
    if (!this.tableService.dataSource || !this.showPagination) {
      this.paginatedData = this.tableService.dataSource || [];
      return;
    }

    const totalItems = this.tableService.dataSource.length;
    this.totalPages = Math.ceil(totalItems / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.tableService.dataSource.slice(startIndex, endIndex);
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePagination();
      this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
      this._cdr.detectChanges();
    }
  }

  public nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  public previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  public onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.updatePagination();
    this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  get displayData(): any[] {
    return this.showPagination ? this.paginatedData : this.tableService.dataSource;
  }

  private initializeScrollPosition(): void {
    setTimeout(() => {
      const tableWrapper = this._elementRef.nativeElement.querySelector('.table-wrapper');
      if (tableWrapper) {
        if (this.direction === 'rtl') {
          tableWrapper.scrollLeft = tableWrapper.scrollWidth;
        } else {
          tableWrapper.scrollLeft = 0;
        }
      }
    }, 0);
  }

  private initializeHeadersVisibility(): void {
    this.headers.forEach(header => {
      if (header.visible === undefined) {
        header.visible = true;
      }
    });
    this.originalHeaders = JSON.parse(JSON.stringify(this.headers));
  }

  toggleColumnsMenu(): void {
    this.showColumnsMenu = !this.showColumnsMenu;
  }

  onColumnToggled(header: IHeader): void {
    this._cdr.detectChanges();
  }

  onSaveColumns(): void {
    this.originalHeaders = JSON.parse(JSON.stringify(this.headers));
    this.showColumnsMenu = false;
    this._cdr.detectChanges();
  }

  onCancelColumns(): void {
    this.headers = JSON.parse(JSON.stringify(this.originalHeaders));
    this.showColumnsMenu = false;
    this._cdr.detectChanges();
  }

  closeColumnsMenu(): void {
    this.showColumnsMenu = false;
  }

  public startColumnResize(event: MouseEvent, columnIndex: number): void {
    this.resizing = true;
    this.resizingColumnIndex = columnIndex;
    this.startX = event.clientX;

    const thElement = (event.target as Element).closest('th') as HTMLElement;
    if (!thElement) return;

    this.currentColumn = thElement;
    this.startWidth = thElement.offsetWidth;

    // Prevent text selection during resize
    event.preventDefault();
    event.stopPropagation();

    document.body.classList.add('column-resizing-active');
  }

  private handleColumnResize(event: MouseEvent): void {
    if (!this.resizing || !this.currentColumn) return;

    const deltaX = event.clientX - this.startX;
    let newWidth = this.startWidth;
    newWidth = this.startWidth + deltaX;
    const minWidth = 50;
    const maxWidth = 800;
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

    // Apply the new width
    this.currentColumn.style.width = `${finalWidth}px`;
    this.currentColumn.style.minWidth = `${finalWidth}px`;

    // Update the header configuration
    if (this.resizingColumnIndex >= 0 && this.resizingColumnIndex < this.headers.length) {
      this.headers[this.resizingColumnIndex].width = finalWidth;
    }

    // Update the start position for continuous resizing
    this.startX = event.clientX;
    this.startWidth = finalWidth;

    event.preventDefault();
  }

  private finishColumnResize(): void {
    this.resizing = false;
    this.resizingColumnIndex = -1;
    this.currentColumn = null;
    this.startX = 0;
    this.startWidth = 0;

    // Remove the resizing class
    document.body.classList.remove('column-resizing-active');
  }

  public startColumnDrag(event: MouseEvent, columnIndex: number): void {
    const thElement = (event.target as Element).closest('th') as HTMLElement;
    if (!thElement) return;

    this.isDragging = true;
    this.dragColumn = thElement;
    this.dragColumnIndex = columnIndex;

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
    this.dragGhost.style.background = '#00AF9E';
    this.dragGhost.style.border = '2px solid #0d8377';
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

      if (this.direction === 'rtl') {
        if (event.clientX > thCenterX) {
          targetTh.classList.add('drag-over-left');
          this.dragOverIndex = closestIndex;
        } else {
          targetTh.classList.add('drag-over-right');
          this.dragOverIndex = closestIndex + 1;
        }
      } else {
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
    this.dragRowGhost.style.direction = this.direction;
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
    this.dragRowGhost.style.border = '1px solid #0d8377';
    this.dragRowGhost.style.transition = 'none';

    const dragHandle = this.dragRowGhost.querySelector('.drag-handle-cell');
    if (dragHandle) {
      (dragHandle as HTMLElement).style.background = '#f8f9fa';
    }

    document.body.appendChild(this.dragRowGhost);

    const ghostRect = this.dragRowGhost.getBoundingClientRect();
    this.dragRowGhost.style.left = `${rect.left}px`;
    this.dragRowGhost.style.top = `${clientY - 10}px`;
  }

  private updateRowDragGhostPosition(event: MouseEvent): void {
    if (!this.dragRowGhost) return;

    const rect = this.dragRowGhost.getBoundingClientRect();
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

  trackByHeader(index: number, header: IHeader): string {
    return header.key || index.toString();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  public sortCurrentPage(header: IHeader, mode: SORT_ENUM): void {
    if (!this.displayData || this.displayData.length === 0) {
      return;
    }

    const sortedPageData = [...this.displayData].sort((a, b) => {
      const valueA = a[header.key];
      const valueB = b[header.key];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return mode === SORT_ENUM.ASC ? -1 : 1;
      if (valueB == null) return mode === SORT_ENUM.ASC ? 1 : -1;

      const numA = this.tryParseNumber(valueA);
      const numB = this.tryParseNumber(valueB);

      if (numA !== null && numB !== null) {
        return mode === SORT_ENUM.ASC ? numA - numB : numB - numA;
      }

      const stringA = this.prepareForSorting(valueA);
      const stringB = this.prepareForSorting(valueB);

      const comparison = stringA.localeCompare(stringB, 'fa-IR', {
        sensitivity: 'base',
        numeric: true,
        ignorePunctuation: true
      });

      return mode === SORT_ENUM.ASC ? comparison : -comparison;
    });

    this.paginatedData = sortedPageData;
  }

  private tryParseNumber(value: any): number | null {
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
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

    return stringValue
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  }
}