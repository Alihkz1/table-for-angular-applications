import { Component, EventEmitter, Input } from '@angular/core';
import { IRowEvent } from '../../shared/model/IRowEvent.interface';

@Component({
  selector: 'app-actions-cell',
  standalone: true,
  imports: [],
  templateUrl: './actions-cell.component.html',
  styleUrl: './actions-cell.component.scss'
})
export class ActionsCellComponent {
  @Input() row: any;
  @Input() onRowEvent: EventEmitter<IRowEvent>;

  onEvent(action: string) {
    this.onRowEvent.emit({
      action,
      data: this.row
    })
  }
}
