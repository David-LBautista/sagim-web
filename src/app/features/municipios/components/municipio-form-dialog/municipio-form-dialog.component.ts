import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { SagimDialogComponent } from '../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { Municipio } from '../../models/municipio.model';
import {
  APP_MODULES,
  AppModulo,
} from '../../../../core/modules/app.modules.registry';
import { MunicipiosService } from '../../services/municipios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import {
  Estado,
  MunicipioCatalogo,
} from '../../../../shared/models/catalogo.model';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-municipio-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatIconModule,
    SagimDialogComponent,
  ],
  templateUrl: './municipio-form-dialog.component.html',
  styleUrls: ['./municipio-form-dialog.component.scss'],
})
export class MunicipioFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<MunicipioFormDialogComponent>);
  private municipiosService = inject(MunicipiosService);
  private notificationService = inject(NotificationService);
  private catalogosService = inject(CatalogosService);

  municipioForm: FormGroup;
  isEditMode: boolean = false;
  availableModules: Array<{ key: string; label: string }> = [];
  isSubmitting: boolean = false;
  selectedLogo: File | null = null;
  logoPreview: string | null = null;

  estados: Estado[] = [];
  municipiosCatalogo: MunicipioCatalogo[] = [];
  isLoadingMunicipios: boolean = false;

  // Autocomplete
  estadoCtrl = new FormControl<string | Estado>('');
  municipioCtrl = new FormControl<string | MunicipioCatalogo>('');
  filteredEstados!: Observable<Estado[]>;
  filteredMunicipios!: Observable<MunicipioCatalogo[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { municipio?: Municipio }) {
    this.isEditMode = !!data?.municipio;
    this.loadAvailableModules();

    const modulosGroup = this.fb.group({});
    this.availableModules.forEach((modulo) => {
      modulosGroup.addControl(
        modulo.key,
        this.fb.control(data?.municipio?.config?.modulos?.[modulo.key] ?? true),
      );
    });

    this.municipioForm = this.fb.group({
      estadoId: ['', [Validators.required]],
      municipioId: ['', [Validators.required]],
      poblacion: [{ value: null, disabled: true }],
      contactoEmail: [data?.municipio?.contactoEmail || '', [Validators.email]],
      contactoTelefono: [
        data?.municipio?.contactoTelefono || '',
        [Validators.pattern(/^\d{10}$/)],
      ],
      direccion: [data?.municipio?.direccion || ''],
      adminEmail: [
        data?.municipio?.admin?.email || '',
        this.isEditMode
          ? [Validators.email]
          : [Validators.required, Validators.email],
      ],
      adminPassword: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(8)],
      ],
      adminNombre: [
        data?.municipio?.admin?.nombre || '',
        this.isEditMode ? [] : [Validators.required],
      ],
      porcentajeContribucion: [
        data?.municipio?.porcentajeContribucion ?? 10,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      modulos: modulosGroup,
    });

    // Escuchar cambios en el estado para cargar municipios
    this.municipioForm.get('estadoId')?.valueChanges.subscribe((estadoId) => {
      if (estadoId) {
        this.loadMunicipiosPorEstado(estadoId);
      } else {
        this.municipiosCatalogo = [];
        this.municipioForm.patchValue({ municipioId: '', poblacion: null });
      }
    });

    // Escuchar cambios en el municipio para actualizar población
    this.municipioForm
      .get('municipioId')
      ?.valueChanges.subscribe((municipioId) => {
        if (municipioId) {
          const municipio = this.municipiosCatalogo.find(
            (m) => m._id === municipioId,
          );
          if (municipio) {
            this.municipioForm.patchValue({ poblacion: municipio.poblacion });
          }
        } else {
          this.municipioForm.patchValue({ poblacion: null });
        }
      });
  }

  ngOnInit(): void {
    this.loadEstados();
    this.setupAutocompletes();

    // Si es modo edición, cargar los datos del municipio
    if (this.isEditMode && this.data.municipio) {
      this.loadMunicipioDataForEdit();
    }
  }

  private loadMunicipioDataForEdit(): void {
    if (!this.data.municipio) return;

    // Si hay logo existente, mostrarlo en la preview
    if (this.data.municipio.logoUrl) {
      this.logoPreview = this.data.municipio.logoUrl;
    }

    // Esperar a que se carguen los estados
    const checkEstados = setInterval(() => {
      if (this.estados.length > 0) {
        clearInterval(checkEstados);

        // Buscar el estado usando el objeto poblado estadoId
        const estadoRef = this.data.municipio?.estadoId;
        const estado = this.estados.find(
          (e) =>
            (estadoRef?._id && e._id === estadoRef._id) ||
            (estadoRef?.nombre && e.nombre === estadoRef.nombre) ||
            e.nombre === this.data.municipio?.estado,
        );

        if (estado) {
          // Setear el estado en el autocomplete
          this.estadoCtrl.setValue(estado);
          this.municipioForm.patchValue({ estadoId: estado._id });

          // Cargar los municipios de ese estado (sin filtrar por activo para edición)
          this.catalogosService.getMunicipiosPorEstado(estado._id).subscribe({
            next: (municipios) => {
              this.municipiosCatalogo = municipios;

              // Buscar el municipio por claveInegi primero, luego por nombre
              const municipioData = this.data.municipio!;
              let municipio = this.municipiosCatalogo.find(
                (m) => m.claveInegi === municipioData.claveInegi,
              );
              if (!municipio) {
                municipio = this.municipiosCatalogo.find(
                  (m) => m.nombre === municipioData.nombre,
                );
              }

              if (municipio) {
                // Setear el municipio en el autocomplete
                this.municipioCtrl.setValue(municipio);
                this.municipioForm.patchValue({
                  municipioId: municipio._id,
                  poblacion: municipio.poblacion ?? municipioData.poblacion,
                });
              } else {
                // No está en catálogo: construir entrada sintética desde los datos del sistema
                const sintetico: MunicipioCatalogo = {
                  _id: municipioData._id,
                  nombre: municipioData.nombre,
                  claveInegi: municipioData.claveInegi,
                  poblacion: municipioData.poblacion ?? 0,
                  estadoId: estado._id,
                  activo: true,
                  createdAt: '',
                  updatedAt: '',
                };
                this.municipiosCatalogo = [
                  sintetico,
                  ...this.municipiosCatalogo,
                ];
                this.municipioCtrl.setValue(sintetico);
                this.municipioForm.patchValue({
                  municipioId: sintetico._id,
                  poblacion: municipioData.poblacion,
                });
              }

              this.isLoadingMunicipios = false;
            },
            error: (error) => {
              console.error('Error al cargar municipios para edición:', error);
              this.isLoadingMunicipios = false;
            },
          });
        }
      }
    }, 100);
  }

  private setupAutocompletes(): void {
    // Filtrado de estados
    this.filteredEstados = this.estadoCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue =
          typeof value === 'string' ? value.toLowerCase() : '';
        return this.estados.filter((estado) =>
          estado.nombre.toLowerCase().includes(filterValue),
        );
      }),
    );

    // Filtrado de municipios
    this.filteredMunicipios = this.municipioCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue =
          typeof value === 'string' ? value.toLowerCase() : '';
        return this.municipiosCatalogo.filter((municipio) =>
          municipio.nombre.toLowerCase().includes(filterValue),
        );
      }),
    );

    // Solo configurar listeners si NO estamos en modo edición
    if (!this.isEditMode) {
      // Cuando se selecciona un estado
      this.estadoCtrl.valueChanges.subscribe((value) => {
        if (value && typeof value === 'object' && '_id' in value) {
          const estado = value as Estado;
          this.municipioForm.patchValue({ estadoId: estado._id });
          this.loadMunicipiosPorEstado(estado._id);
        }
      });

      // Cuando se selecciona un municipio
      this.municipioCtrl.valueChanges.subscribe((value) => {
        if (value && typeof value === 'object' && '_id' in value) {
          const municipio = value as MunicipioCatalogo;
          this.municipioForm.patchValue({
            municipioId: municipio._id,
            poblacion: municipio.poblacion,
          });
        }
      });
    }
  }

  private loadEstados(): void {
    this.catalogosService.getEstados().subscribe({
      next: (estados) => {
        this.estados = estados.filter((e) => e.activo);
        // Actualizar el filtro de estados
        this.estadoCtrl.updateValueAndValidity();
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
        this.notificationService.error('Error al cargar estados');
      },
    });
  }

  private loadMunicipiosPorEstado(estadoId: string): void {
    this.isLoadingMunicipios = true;
    this.municipiosCatalogo = [];
    this.municipioForm.patchValue({ municipioId: '', poblacion: null });

    this.catalogosService.getMunicipiosPorEstado(estadoId).subscribe({
      next: (municipios) => {
        console.log('Municipios recibidos del backend:', municipios);
        this.municipiosCatalogo = municipios.filter((m) => m.activo);
        console.log('Municipios activos:', this.municipiosCatalogo);
        this.isLoadingMunicipios = false;
        // Actualizar el filtro de municipios
        this.municipioCtrl.setValue('');
        this.municipioCtrl.updateValueAndValidity();
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
        this.notificationService.error('Error al cargar municipios del estado');
        this.isLoadingMunicipios = false;
      },
    });
  }

  displayEstado(estado: Estado): string {
    return estado && estado.nombre ? estado.nombre : '';
  }

  displayMunicipio(municipio: MunicipioCatalogo): string {
    return municipio && municipio.nombre ? municipio.nombre : '';
  }

  private loadAvailableModules(): void {
    // Obtener todos los módulos excepto MUNICIPIOS
    this.availableModules = (Object.keys(APP_MODULES) as AppModulo[])
      .filter((key) => key !== 'MUNICIPIOS')
      .map((key) => ({
        key,
        label: APP_MODULES[key].label,
      }));
  }

  onSubmit(): void {
    // En modo edición, consideramos válido el formulario aunque estadoId y municipioId estén deshabilitados
    const isFormValid = this.isEditMode
      ? this.municipioForm.get('contactoEmail')?.valid !== false &&
        this.municipioForm.get('contactoTelefono')?.valid !== false &&
        this.municipioForm.get('direccion')?.valid !== false
      : this.municipioForm.valid;

    if (isFormValid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.municipioForm.getRawValue();

      if (this.isEditMode && this.data.municipio) {
        // Actualizar municipio existente - solo enviar config
        const municipioId =
          this.data.municipio._id || this.data.municipio.id?.toString();

        if (!municipioId) {
          console.error(
            'No se encontró ID del municipio:',
            this.data.municipio,
          );
          this.notificationService.error(
            'Error: ID del municipio no disponible',
          );
          this.isSubmitting = false;
          return;
        }

        // Construir FormData para soportar logo opcional
        const updateFd = new FormData();
        updateFd.append('contactoEmail', formValue.contactoEmail || '');
        updateFd.append('contactoTelefono', formValue.contactoTelefono || '');
        updateFd.append('direccion', formValue.direccion || '');
        updateFd.append(
          'porcentajeContribucion',
          (formValue.porcentajeContribucion ?? 10).toString(),
        );
        updateFd.append(
          'config',
          JSON.stringify({ modulos: formValue.modulos }),
        );
        if (formValue.adminNombre)
          updateFd.append('adminNombre', formValue.adminNombre);
        if (formValue.adminEmail)
          updateFd.append('adminEmail', formValue.adminEmail);
        if (formValue.adminPassword)
          updateFd.append('adminPassword', formValue.adminPassword);
        if (this.selectedLogo) updateFd.append('logo', this.selectedLogo);

        this.municipiosService
          .updateMunicipioWithFormData(municipioId, updateFd)
          .subscribe({
            next: (response) => {
              this.notificationService.success(
                'Municipio actualizado exitosamente',
              );
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Error al actualizar municipio:', error);
              this.notificationService.error('Error al actualizar municipio');
              this.isSubmitting = false;
            },
          });
      } else {
        // Crear nuevo municipio - enviar todos los datos
        const estadoSeleccionado = this.estados.find(
          (e) => e._id === formValue.estadoId,
        );
        const municipioSeleccionado = this.municipiosCatalogo.find(
          (m) => m._id === formValue.municipioId,
        );

        // Crear FormData para enviar archivo
        const formData = new FormData();

        // Agregar logo si fue seleccionado
        if (this.selectedLogo) {
          formData.append('logo', this.selectedLogo);
        }

        // Agregar campos del formulario
        formData.append('nombre', municipioSeleccionado?.nombre || '');
        formData.append('estado', estadoSeleccionado?.nombre || '');
        formData.append('claveInegi', municipioSeleccionado?.claveInegi || '');
        formData.append('poblacion', formValue.poblacion?.toString() || '0');
        formData.append('contactoEmail', formValue.contactoEmail || '');
        formData.append('contactoTelefono', formValue.contactoTelefono || '');
        formData.append('direccion', formValue.direccion || '');
        formData.append('adminEmail', formValue.adminEmail);
        formData.append('adminPassword', formValue.adminPassword);
        formData.append('adminNombre', formValue.adminNombre);
        formData.append(
          'config',
          JSON.stringify({ modulos: formValue.modulos }),
        );

        // Crear nuevo municipio
        this.municipiosService.createMunicipioWithFormData(formData).subscribe({
          next: (response) => {
            this.notificationService.success('Municipio creado exitosamente');
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error al crear municipio:', error);
            this.notificationService.error('Error al crear municipio');
            this.isSubmitting = false;
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.municipioForm);
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogo = input.files[0];

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedLogo);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.municipioForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('email')) {
      return 'Email inválido';
    }

    if (field?.hasError('pattern')) {
      if (fieldName === 'contactoTelefono') {
        return 'El teléfono debe tener 10 dígitos';
      }
    }

    if (field?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }

    if (field?.hasError('minLength')) {
      const requiredLength = field.errors?.['minLength']?.requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    return '';
  }
}
