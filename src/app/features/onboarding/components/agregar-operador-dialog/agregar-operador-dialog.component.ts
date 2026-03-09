import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuariosService } from '../../../../features/usuarios/services/usuarios.service';
import {
  UsuarioCreateDto,
  UsuarioRol,
} from '../../../../features/usuarios/models/usuario.model';
import {
  APP_MODULES,
  AppModulo,
} from '../../../../core/modules/app.modules.registry';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';

export interface AgregarOperadorDialogData {
  municipioId: string;
  modulosHabilitados: string[]; // claves de AppModulo habilitadas
}

export interface AgregarOperadorDialogResult {
  _id: string;
  nombre: string;
  email: string;
  moduloNombre?: string;
}

interface ModuloOption {
  _id: string;
  label: string;
}

@Component({
  selector: 'app-agregar-operador-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './agregar-operador-dialog.component.html',
  styleUrl: './agregar-operador-dialog.component.scss',
})
export class AgregarOperadorDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AgregarOperadorDialogComponent>);
  private data = inject<AgregarOperadorDialogData>(MAT_DIALOG_DATA);
  private usuariosService = inject(UsuariosService);
  private notification = inject(NotificationService);

  loading = signal(false);
  mostrarPassword = signal(false);
  modulos = signal<ModuloOption[]>([]);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    moduloId: ['', Validators.required],
  });

  ngOnInit(): void {
    const opts: ModuloOption[] = this.data.modulosHabilitados
      .filter((clave) => APP_MODULES[clave as AppModulo])
      .map((clave) => ({
        _id: clave,
        label: APP_MODULES[clave as AppModulo].label,
      }));
    this.modulos.set(opts);
  }

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const val = this.form.getRawValue();

    const dto: UsuarioCreateDto = {
      nombre: val.nombre!,
      email: val.email!,
      password: val.password!,
      rol: UsuarioRol.OPERADOR,
      municipioId: this.data.municipioId,
      moduloId: val.moduloId!,
      activo: true,
    };

    this.usuariosService.createUsuario(dto).subscribe({
      next: (usuario: any) => {
        this.loading.set(false);
        const resultado: AgregarOperadorDialogResult = {
          _id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          moduloNombre: usuario.moduloId?.nombre,
        };
        this.dialogRef.close(resultado);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Error al crear el operador';
        this.notification.show({ message: msg, type: NotificationType.ERROR });
      },
    });
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }
}
