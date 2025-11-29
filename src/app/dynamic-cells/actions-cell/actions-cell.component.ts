import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ActionHeader {
  title: string;
  actionName: string;
  fields: string[];
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

  mouseDownEventListenerRef: any;
  public showColumnsMenu = false;

  public actionHeaders: ActionHeader[] = [
    {
      title: 'ویرایش',
      actionName: 'view_user',
      fields: ['name', 'email', 'phone']
    },
    {
      title: 'فعالیت انجام شد',
      actionName: 'view_order',
      fields: ['order_id', 'amount', 'status']
    },
    {
      title: 'حذف',
      actionName: 'view_payment',
      fields: ['payment_method', 'transaction_id']
    }
  ];
  
  constructor() {
    this.mouseDownEventListenerRef = document.addEventListener('mousedown', () => {
      if (!this.showColumnsMenu) return
      this.showColumnsMenu = false
    })
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.mouseDownEventListenerRef)
  }

  onEvent(action: string) {
    this.onRowEvent.emit({
      action,
      data: this.row
    })
  }

  toggleColumnsMenu() {
    this.showColumnsMenu = !this.showColumnsMenu;
  }

  closeColumnsMenu() {
    this.showColumnsMenu = false;
  }

}

