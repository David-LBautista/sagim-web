import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApoyosService } from '../../services/apoyos.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type { Programa } from '../../models/apoyos.model';
import type { Beneficiario } from '../../models/beneficiarios.model';

@Component({
  selector: 'app-apoyo-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './apoyo-form-dialog.component.html',
  styleUrls: ['./apoyo-form-dialog.component.scss'],
})
export class ApoyoFormDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ApoyoFormDialogComponent>);
  private apoyosService = inject(ApoyosService);
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  tiposApoyoDisponibles: string[] = [];

  form: FormGroup = this.fb.group({
    beneficiarioSearch: ['', Validators.required],
    beneficiarioId: ['', Validators.required],
    programaId: ['', Validators.required],
    tipo: ['', Validators.required],
    fecha: [new Date(), Validators.required],
    monto: [{ value: null, disabled: true }],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    observaciones: [''],
  });

  isSubmitting = false;
  programas: Programa[] = [];
  esApoyoEconomico = false;
  beneficiariosSugeridos: Beneficiario[] = [];
  beneficiarioSeleccionado: Beneficiario | null = null;
  isSearchingBeneficiario = false;

  ngOnInit(): void {
    this.loadProgramas();

    this.form
      .get('programaId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((programaId: string) => {
        const programa = this.programas.find((p) => p._id === programaId);
        this.tiposApoyoDisponibles = programa?.tiposApoyo ?? [];
        this.form.get('tipo')!.setValue('');

        const normalize = (s: string) =>
          s
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const clave = (programa?.clave ?? '').toLowerCase();
        const nombre = normalize(programa?.nombre ?? '');
        this.esApoyoEconomico =
          clave.includes('econom') || nombre.includes('econom');

        const montoCtrl = this.form.get('monto')!;
        const cantidadCtrl = this.form.get('cantidad')!;
        if (this.esApoyoEconomico) {
          montoCtrl.enable();
          cantidadCtrl.disable();
          cantidadCtrl.setValue(1);
        } else {
          montoCtrl.disable();
          montoCtrl.setValue(null);
          cantidadCtrl.enable();
          cantidadCtrl.setValue(1);
        }
      });

    this.form
      .get('beneficiarioSearch')!
      .valueChanges.pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((value) => {
        if (typeof value === 'string' && value.trim().length >= 2) {
          this.buscarBeneficiarios(value.trim());
        } else {
          this.beneficiariosSugeridos = [];
        }
        // Si el usuario edita el campo manualmente, resetear la selección
        if (typeof value === 'string') {
          this.beneficiarioSeleccionado = null;
          this.form.get('beneficiarioId')!.setValue('');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProgramas(): void {
    this.apoyosService.getProgramas().subscribe({
      next: (data) => {
        console.log('[ApoyoForm] programas recibidos:', data);
        this.programas = data.filter((p) => p.activo !== false);
        console.log('[ApoyoForm] programas filtrados:', this.programas);
      },
      error: (err) => {
        console.error('[ApoyoForm] error al cargar programas:', err);
        this.notificationService.error('Error al cargar programas');
      },
    });
  }

  private buscarBeneficiarios(query: string): void {
    this.isSearchingBeneficiario = true;
    this.beneficiariosService
      .getBeneficiarios({ search: query, limit: 10 })
      .subscribe({
        next: (res) => {
          this.beneficiariosSugeridos = res.data;
          this.isSearchingBeneficiario = false;
        },
        error: () => {
          this.isSearchingBeneficiario = false;
        },
      });
  }

  onSeleccionarBeneficiario(beneficiario: Beneficiario): void {
    this.beneficiarioSeleccionado = beneficiario;
    this.form.patchValue({
      beneficiarioId: beneficiario._id,
      beneficiarioSearch: beneficiario,
    });
    this.beneficiariosSugeridos = [];
  }

  displayBeneficiario(b: Beneficiario | string): string {
    if (!b || typeof b === 'string') return '';
    return `${b.nombre} ${b.apellidoPaterno} ${b.apellidoMaterno ?? ''} — ${b.curp}`.trim();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const v = this.form.getRawValue();
    const payload = {
      beneficiarioId: v.beneficiarioId,
      programaId: v.programaId,
      tipo: v.tipo,
      fecha: this.toDateString(v.fecha),
      monto: v.monto != null && v.monto !== '' ? Number(v.monto) : 0,
      cantidad: Number(v.cantidad),
      observaciones: v.observaciones || undefined,
    };
    this.apoyosService.createApoyo(payload).subscribe({
      next: (response) => {
        this.notificationService.success('Apoyo registrado exitosamente');
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error('Error al crear apoyo:', err);
        this.notificationService.error('Error al registrar apoyo');
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private toDateString(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
