import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ActionButtonComponent } from '../action-button/action-button.component';

@Component({
  selector: 'app-sagim-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ActionButtonComponent,
  ],
  templateUrl: './sagim-dialog.component.html',
  styleUrls: ['./sagim-dialog.component.scss'],
})
export class SagimDialogComponent {
  @Input() title = '';
  @Input() submitLabel = 'Guardar';
  @Input() cancelLabel = 'Cancelar';
  @Input() isSubmitting = false;
  @Input() isLoading = false;
  @Input() submitDisabled = false;

  @Output() submitClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();

  onSubmit(): void {
    this.submitClick.emit();
  }

  onCancel(): void {
    this.cancelClick.emit();
  }
}
