import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../features/auth/services/auth.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private authService = inject(AuthService);
  readonly wsService = inject(WebSocketService);

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
