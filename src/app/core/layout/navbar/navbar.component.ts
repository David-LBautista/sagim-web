import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  getMunicipioName(): string | null {
    const municipioInfo = this.authService.getMunicipioInfo();
    return municipioInfo?.nombre || null;
  }

  getMunicipioLogo(): string {
    const municipioInfo = this.authService.getMunicipioInfo();
    return municipioInfo?.logoUrl || 'assets/logo/escudo_sagim.svg';
  }

  getRolLabel(rol: string): string {
    const rolesMap: { [key: string]: string } = {
      SUPER_ADMIN: 'Super Administrador',
      ADMIN_MUNICIPIO: 'Administrador Municipal',
      OPERATIVO: 'Operativo',
      ADMIN: 'Administrador',
      OPERADOR: 'Operador',
    };
    return rolesMap[rol] || rol;
  }
}
