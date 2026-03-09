import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, UserRole } from '../../models/auth.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { OnboardingService } from '../../../onboarding/services/onboarding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private onboardingService = inject(OnboardingService);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success(
            `¡Bienvenido ${response.user.nombre}! Inicio de sesión exitoso.`,
          );

          const { rol, municipioId } = response.user;
          const esAdmin =
            rol === UserRole.ADMIN || rol === UserRole.ADMIN_MUNICIPIO;

          // Solo los admins con municipio asignado pasan por el flujo de onboarding
          if (esAdmin && municipioId) {
            this.onboardingService.getState(municipioId).subscribe({
              next: (state) => {
                if (!state.onboardingCompletado) {
                  this.router.navigate(['/onboarding']);
                } else {
                  this.router.navigateByUrl(this.authService.getLandingRoute());
                }
              },
              error: () => {
                // Si el endpoint falla, no bloqueamos el acceso — navegamos normal
                this.router.navigateByUrl(this.authService.getLandingRoute());
              },
            });
          } else {
            // Cualquier otro rol: directo al landing route del módulo
            this.router.navigateByUrl(this.authService.getLandingRoute());
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);

          const errorMessage =
            error.error?.message ||
            'Error al iniciar sesión. Verifica tus credenciales.';

          this.notificationService.error(errorMessage, 5000);
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
      this.notificationService.warning(
        'Por favor, completa todos los campos correctamente.',
      );
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('email')) {
      return 'Ingrese un correo válido';
    }

    if (field?.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }

    return '';
  }
}
