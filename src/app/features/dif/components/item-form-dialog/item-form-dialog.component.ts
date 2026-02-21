import { Component, inject, OnInit, Inject } from '@angular/core';
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
import { InventarioService } from '../../services/inventario.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import {
  TipoItem,
  InventarioItem,
  Programa,
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
export class ItemFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventarioService = inject(InventarioService);
  private notificationService = inject(NotificationService);
  private catalogosService = inject(CatalogosService);
  public dialogRef = inject(MatDialogRef<ItemFormDialogComponent>);

  itemForm: FormGroup;
  programas: Programa[] = [];
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;

  tiposItem: Array<{ value: string; label: string }> = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { item?: InventarioItem }) {
    this.isEditMode = !!data?.item;

    this.itemForm = this.fb.group({
      programaId: ['', Validators.required],
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
    this.loadTiposItem();

    if (this.isEditMode && this.data.item) {
      this.populateForm(this.data.item);
      this.ensureTipoEnOpciones(this.data.item.tipo);
    }
  }

  private loadProgramas(): void {
    this.isLoading = true;
    this.inventarioService.getProgramas().subscribe({
      next: (programas) => {
        this.programas = programas.filter((p) => p.activo);
        this.isLoading = false;
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
      tipo: item.tipo,
      cantidad: item.cantidad,
      concepto: item.concepto,
      fecha: new Date(item.fecha),
      comprobante: item.comprobante,
      observaciones: item.observaciones,
      valorUnitario: item.valorUnitario,
    });
  }

  private loadTiposItem(): void {
    this.catalogosService.getTiposApoyo().subscribe({
      next: (tipos) => {
        this.tiposItem = tipos
          .filter((tipo) => tipo.activo)
          .map((tipo) => ({
            value: tipo.clave,
            label: tipo.nombre,
          }));

        if (this.tiposItem.length === 0) {
          this.tiposItem = this.getTiposFallback();
        }

        if (this.data.item?.tipo) {
          this.ensureTipoEnOpciones(this.data.item.tipo);
        }
      },
      error: (error) => {
        console.error('Error al cargar catálogo de tipos de apoyo:', error);
        this.tiposItem = this.getTiposFallback();
      },
    });
  }

  private ensureTipoEnOpciones(tipo: string): void {
    const existe = this.tiposItem.some((option) => option.value === tipo);
    if (!existe) {
      this.tiposItem = [...this.tiposItem, { value: tipo, label: tipo }];
    }
  }

  private getTiposFallback(): Array<{ value: string; label: string }> {
    return [
      { value: TipoItem.DESPENSA, label: 'Despensa' },
      { value: TipoItem.MEDICAMENTO, label: 'Medicamento' },
      { value: TipoItem.ROPA, label: 'Ropa' },
      { value: TipoItem.UTENSILIO, label: 'Utensilio' },
      { value: TipoItem.MOBILIARIO, label: 'Mobiliario' },
      { value: TipoItem.EQUIPO, label: 'Equipo' },
      { value: TipoItem.OTRO, label: 'Otro' },
    ];
  }

  onSubmit(): void {
    if (this.itemForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.itemForm.value;

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
