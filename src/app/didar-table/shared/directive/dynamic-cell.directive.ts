import { ComponentRef, Directive, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges, ViewContainerRef } from '@angular/core';
import { IRowEvent } from '../model/IRowEvent.interface';
@Directive({
  selector: '[dynamicCell]',
  standalone: true
})
export class DynamicCellDirective implements OnChanges, OnDestroy {
  @Input() row: any;
  @Input() column: any;
  @Input() component: any;
  @Input() onRowEvent: EventEmitter<IRowEvent>;

  private componentRef: ComponentRef<any>;

  constructor(private vc: ViewContainerRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.componentRef === undefined) {
      this.componentRef = this.vc.createComponent(this.component);
    }
    if (changes['column'] && changes['column']['currentValue']) {
      this.componentRef.instance.column = this.column;
    }
    if (changes['row'] && changes['row']['currentValue']) {
      (this.componentRef.instance as any).row = this.row;
    }
    if (changes['onRowEvent'] && changes['onRowEvent']['currentValue']) {
      (this.componentRef.instance as any).onRowEvent = this.onRowEvent;
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) this.componentRef.destroy();
  }
}
