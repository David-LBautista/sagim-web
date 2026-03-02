import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Usuario, UsuarioRol } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { MunicipiosService } from '../../../municipios/services/municipios.service';
import { Municipio } from '../../../municipios/models/municipio.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
})
export class UserFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private usuariosService = inject(UsuariosService);
  private notificationService = inject(NotificationService);
  private catalogosService = inject(CatalogosService);
  private authService = inject(AuthService);

  userForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  rolDisabled: boolean = false;

  get isAdminMunicipio(): boolean {
    return this.userForm?.getRawValue()?.rol === 'ADMIN_MUNICIPIO';
  }

  municipios: Municipio[] = [];
  modulos: Array<{ _id: string; nombre: string }> = [];
  roles: Array<{ value: string; label: string }> = [];
  emailDomain: string = '@municipio.sagim.com';

  private municipiosService = inject(MunicipiosService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { usuario?: Usuario }) {
    this.isEditMode = !!data?.usuario;

    // Extraer username del email si estamos editando
    let emailUsername = '';
    if (data?.usuario?.email) {
      emailUsername = data.usuario.email.split('@')[0];
    }

    this.userForm = this.fb.group({
      nombre: [data?.usuario?.nombre || '', [Validators.required]],
      emailUsername: [
        emailUsername,
        [Validators.required, Validators.pattern(/^[a-z0-9._-]+$/)],
      ],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(8)],
      ],
      rol: [data?.usuario?.rol || '', [Validators.required]],
      municipioId: [data?.usuario?.municipioId?._id || ''],
      moduloId: [data?.usuario?.moduloId?._id || '', [Validators.required]],
      telefono: [
        data?.usuario?.telefono || '',
        [Validators.pattern(/^\d{10}$/)],
      ],
      activo: [data?.usuario?.activo ?? true],
    });

    // Actualizar el dominio del email cuando cambie el municipio
    this.userForm.get('municipioId')?.valueChanges.subscribe(() => {
      this.emailDomain = this.getEmailDomain();
    });

    // Cuando cambie el rol, ajustar validadores de moduloId
    this.userForm.get('rol')?.valueChanges.subscribe((rol) => {
      const moduloControl = this.userForm.get('moduloId');
      if (rol === 'ADMIN_MUNICIPIO') {
        moduloControl?.clearValidators();
        moduloControl?.setValue('');
      } else {
        moduloControl?.setValidators([Validators.required]);
      }
      moduloControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadMunicipios();
    this.loadModulos();
    this.loadRoles();
    // Establecer el dominio inicial si ya hay un municipio seleccionado
    if (this.userForm.get('municipioId')?.value) {
      this.emailDomain = this.getEmailDomain();
    }
    // Si al abrir ya es ADMIN_MUNICIPIO, quitar validador de módulo
    if (this.isAdminMunicipio) {
      this.userForm.get('moduloId')?.clearValidators();
      this.userForm.get('moduloId')?.updateValueAndValidity();
    }
  }

  private loadMunicipios(): void {
    this.municipiosService.getMunicipios().subscribe({
      next: (municipios) => {
        this.municipios = municipios
          .filter((m) => m.activo !== false)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-MX'));
        // Reasignar municipioId tras cargar para que mat-select encuentre el valor
        if (this.isEditMode && this.data.usuario?.municipioId) {
          this.userForm.patchValue({
            municipioId: this.data.usuario.municipioId._id,
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
        this.notificationService.error('Error al cargar municipios');
      },
    });
  }

  private loadModulos(): void {
    this.catalogosService.getModulos().subscribe({
      next: (modulos) => {
        this.modulos = modulos;
        // Reasignar moduloId tras cargar para que mat-select encuentre el valor
        if (this.isEditMode && this.data.usuario?.moduloId) {
          this.userForm.patchValue({
            moduloId: this.data.usuario.moduloId._id,
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
        this.notificationService.error('Error al cargar módulos');
      },
    });
  }

  private loadRoles(): void {
    this.catalogosService.getRoles().subscribe({
      next: (roles) => {
        const currentUser = this.authService.getCurrentUser();
        const currentUserRole = currentUser?.rol;

        // Filtrar roles según el rol del usuario actual
        let availableRoles = roles.filter((rol) => rol.activo);

        // Si es ADMIN_MUNICIPIO, solo puede crear roles inferiores
        if (currentUserRole === 'ADMIN_MUNICIPIO') {
          availableRoles = availableRoles.filter(
            (rol) =>
              rol.nombre !== 'ADMIN_MUNICIPIO' && rol.nombre !== 'SUPER_ADMIN',
          );
        }
        // Si es OPERATIVO, no puede crear usuarios
        else if (currentUserRole === 'OPERATIVO') {
          availableRoles = [];
        }

        this.roles = availableRoles.map((rol) => ({
          value: rol.nombre,
          label: this.formatRolName(rol.nombre),
        }));

        // En modo edición: si el rol actual del usuario editado no está
        // entre los disponibles (permisos insuficientes), mostrar bloqueado
        if (this.isEditMode && this.data.usuario?.rol) {
          const rolActual = this.data.usuario.rol;
          const puedeAsignar = this.roles.some((r) => r.value === rolActual);
          if (!puedeAsignar) {
            this.roles = [
              { value: rolActual, label: this.formatRolName(rolActual) },
              ...this.roles,
            ];
            this.rolDisabled = true;
            this.userForm.get('rol')?.disable();
          }
          this.userForm.patchValue({ rol: rolActual });
        }
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.error('Error al cargar roles');
      },
    });
  }

  private formatRolName(rolName: string): string {
    return rolName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getEmailDomain(): string {
    const municipioId = this.userForm.get('municipioId')?.value;
    if (!municipioId) {
      return '@municipio.sagim.com';
    }
    const municipio = this.municipios.find((m) => m._id === municipioId);
    if (!municipio) {
      return '@municipio.sagim.com';
    }
    // Convertir nombre del municipio a formato slug (minusculas, sin espacios ni acentos)
    const municipioSlug = municipio.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    return `@${municipioSlug}.sagim.com`;
  }

  onEmailKeyPress(event: KeyboardEvent): void {
    const char = event.key;
    // Permitir solo: letras minúsculas, números, punto, guion, guion bajo
    const allowedPattern = /^[a-z0-9._-]$/;
    if (!allowedPattern.test(char)) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.userForm.getRawValue(); // getRawValue incluye campos disabled

      // Construir el email completo
      const emailUsername = formValue.emailUsername;
      const emailDomain = this.getEmailDomain().substring(1); // Quitar el @
      const fullEmail = `${emailUsername}@${emailDomain}`;

      const userData = {
        nombre: formValue.nombre,
        email: fullEmail,
        password: formValue.password,
        rol: formValue.rol,
        municipioId: formValue.municipioId || undefined,
        moduloId: formValue.moduloId,
        telefono: formValue.telefono || undefined,
        activo: formValue.activo,
      };

      if (this.isEditMode && this.data.usuario) {
        // Actualizar usuario existente
        const updateData = { ...userData };
        if (!updateData.password) {
          delete updateData.password;
        }

        this.usuariosService
          .updateUsuario(this.data.usuario._id, updateData)
          .subscribe({
            next: (response) => {
              this.notificationService.success(
                'Usuario actualizado exitosamente',
              );
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Error al actualizar usuario:', error);
              this.notificationService.error('Error al actualizar usuario');
              this.isSubmitting = false;
            },
          });
      } else {
        // Crear nuevo usuario
        this.usuariosService.createUsuario(userData).subscribe({
          next: (response) => {
            this.notificationService.success('Usuario creado exitosamente');
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error al crear usuario:', error);
            this.notificationService.error('Error al crear usuario');
            this.isSubmitting = false;
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.userForm);
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
    const field = this.userForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('email')) {
      return 'Email inválido';
    }

    if (field?.hasError('pattern')) {
      if (fieldName === 'telefono') {
        return 'El teléfono debe tener 10 dígitos';
      }
      if (fieldName === 'emailUsername') {
        return 'Solo minúsculas, números, puntos, guiones';
      }
    }

    if (field?.hasError('minLength')) {
      const requiredLength = field.errors?.['minLength']?.requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    return '';
  }
}
