import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ActionHeader {
  title: string;
  actionName: string;
}

@Component({
  selector: 'app-actions-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-cell.component.html',
  styleUrl: './actions-cell.component.scss'
})
export class ActionsCellComponent implements OnDestroy {
  @Input() row: any;
  @Input() onRowEvent: EventEmitter<any>;
  @Input() headers: ActionHeader[] = [];

  private mouseDownEventListener: (event: MouseEvent) => void;
  public showColumnsMenu = false;

  public actionHeaders: ActionHeader[] = [
    {
      title: 'ویرایش',
      actionName: 'view_user',
    },
    {
      title: 'فعالیت انجام شد',
      actionName: 'view_order',
    },
    {
      title: 'حذف',
      actionName: 'view_payment',
    }
  ];

  constructor() {
    this.mouseDownEventListener = this.handleDocumentClick.bind(this);
    document.addEventListener('mousedown', this.mouseDownEventListener);
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (!this.showColumnsMenu) return;

    const menuElement = document.querySelector('.actions-menu');
    const triggerElement = document.querySelector('.actions-trigger');

    if (menuElement &&
      !menuElement.contains(event.target as Node) &&
      !triggerElement?.contains(event.target as Node)) {
      this.showColumnsMenu = false;
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.mouseDownEventListener);
  }

  onEvent(action: string) {
    this.onRowEvent.emit({
      action,
      data: this.row
    });
    this.showColumnsMenu = false;
  }

  toggleColumnsMenu(event: Event) {
    event.stopPropagation(); 
    this.showColumnsMenu = !this.showColumnsMenu;
  }

  closeColumnsMenu() {
    this.showColumnsMenu = false;
  }
}