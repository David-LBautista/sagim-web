import { Component, inject, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { InventarioService } from '../../services/inventario.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  InventarioItem,
  Programa,
  TipoInventario,
} from '../../models/inventario.model';

@Component({
  selector: 'app-item-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './item-form-dialog.component.html',
  styleUrls: ['./item-form-dialog.component.scss'],
})
export class ItemFormDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private inventarioService = inject(InventarioService);
  private notificationService = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<ItemFormDialogComponent>);
  private destroy$ = new Subject<void>();

  itemForm: FormGroup;
  programas: Programa[] = [];
  tiposApoyoDisponibles: string[] = [];
  readonly TipoInventario = TipoInventario;
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { item?: InventarioItem }) {
    this.isEditMode = !!data?.item;

    this.itemForm = this.fb.group({
      programaId: ['', Validators.required],
      tipoInventario: [TipoInventario.FISICO, Validators.required],
      tipo: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      concepto: ['', [Validators.required, Validators.maxLength(200)]],
      fecha: [new Date(), Validators.required],
      comprobante: ['', [Validators.required, Validators.maxLength(100)]],
      observaciones: ['', Validators.maxLength(500)],
      valorUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadProgramas();

    this.itemForm
      .get('tipoInventario')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((tipo: TipoInventario) => {
        this.applyTipoInventarioRules(tipo);
      });

    this.itemForm
      .get('programaId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((programaId: string) => {
        const programa = this.programas.find((p) => p._id === programaId);
        this.tiposApoyoDisponibles = programa?.tiposApoyo ?? [];
        this.itemForm.get('tipo')!.setValue('');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyTipoInventarioRules(tipo: TipoInventario): void {
    const valorUnitarioCtrl = this.itemForm.get('valorUnitario')!;
    const cantidadCtrl = this.itemForm.get('cantidad')!;
    if (tipo === TipoInventario.MONETARIO) {
      valorUnitarioCtrl.setValue(1);
      valorUnitarioCtrl.disable();
      cantidadCtrl.setValidators([Validators.required, Validators.min(0)]);
    } else {
      valorUnitarioCtrl.enable();
      cantidadCtrl.setValidators([Validators.required, Validators.min(1)]);
    }
    cantidadCtrl.updateValueAndValidity();
  }

  private loadProgramas(): void {
    this.isLoading = true;
    this.inventarioService.getProgramas().subscribe({
      next: (programas) => {
        this.programas = programas.filter((p) => p.activo);
        this.isLoading = false;

        if (this.isEditMode && this.data.item) {
          this.populateForm(this.data.item);
          const programa = this.programas.find(
            (p) => p._id === this.data.item!.programaId._id,
          );
          this.tiposApoyoDisponibles = programa?.tiposApoyo ?? [];
          this.applyTipoInventarioRules(
            this.data.item.tipoInventario ?? TipoInventario.FISICO,
          );
        }
      },
      error: (error) => {
        console.error('Error al cargar programas:', error);
        this.notificationService.error('Error al cargar programas');
        this.isLoading = false;
      },
    });
  }

  private populateForm(item: InventarioItem): void {
    this.itemForm.patchValue({
      programaId: item.programaId._id,
      tipoInventario: item.tipoInventario ?? TipoInventario.FISICO,
      tipo: item.tipo,
      cantidad: item.cantidad,
      concepto: item.concepto,
      fecha: new Date(item.fecha),
      comprobante: item.comprobante,
      observaciones: item.observaciones,
      valorUnitario: item.valorUnitario,
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.itemForm.getRawValue();

    // Convertir fecha a formato ISO string
    const itemData = {
      ...formValue,
      fecha: formValue.fecha.toISOString().split('T')[0],
    };

    if (this.isEditMode && this.data.item) {
      this.updateItem(itemData);
    } else {
      this.createItem(itemData);
    }
  }

  private createItem(itemData: any): void {
    this.inventarioService.createItem(itemData).subscribe({
      next: (response) => {
        this.notificationService.success('Artículo agregado exitosamente');
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al crear artículo:', error);
        this.notificationService.error('Error al agregar el artículo');
        this.isSubmitting = false;
      },
    });
  }

  private updateItem(itemData: any): void {
    this.inventarioService.updateItem(this.data.item!._id, itemData).subscribe({
      next: (response) => {
        this.notificationService.success('Artículo actualizado exitosamente');
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al actualizar artículo:', error);
        this.notificationService.error('Error al actualizar el artículo');
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get valorTotal(): number {
    const cantidad = this.itemForm.get('cantidad')?.value || 0;
    const valorUnitario = this.itemForm.get('valorUnitario')?.value || 0;
    return cantidad * valorUnitario;
  }
}
