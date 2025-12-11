import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IHeader } from '../shared/model/IHeader.interface';

@Component({
  standalone: true,
  selector: 'app-columns-visibility',
  imports: [CommonModule, FormsModule],
  templateUrl: './columns-visibility.component.html',
  styleUrl: './columns-visibility.component.scss',
})
export class ColumnsVisibilityComponent {
  @Input() headers: IHeader[] = [];
  @Output() columnToggled = new EventEmitter<IHeader[]>();
  @Output() onSave = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  onColumnToggle(header: IHeader, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    header.visible = checked;
    this.columnToggled.emit(this.headers);
  }
}