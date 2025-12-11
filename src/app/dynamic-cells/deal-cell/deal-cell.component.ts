import { Component, EventEmitter, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'deal-cell',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './deal-cell.component.html',
  styleUrl: './deal-cell.component.scss'
})
export class DealCellComponent {
  @Input() row: any;
  @Input() onRowEvent: EventEmitter<any>;
}
