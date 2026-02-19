import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { UsuariosService } from '../services/usuarios.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Usuario } from '../models/usuario.model';
import {
  UserFiltersComponent,
  UserFilters,
} from '../components/user-filters/user-filters.component';
import { UserTableComponent } from '../components/user-table/user-table.component';
import { UserFormDialogComponent } from '../components/user-form-dialog/user-form-dialog.component';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    UserFiltersComponent,
    UserTableComponent,
  ],
  templateUrl: './users-dashboard.page.html',
  styleUrls: ['./users-dashboard.page.scss'],
})
export class UsersDashboardPage implements OnInit {
  private usuariosService = inject(UsuariosService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  isLoading: boolean = false;
  isSuperAdmin: boolean = false;

  // Métricas útiles
  usuariosBloqueados: number = 0;
  usuariosSinRol: number = 0;
  usuariosInactivos30Dias: number = 0;

  ngOnInit(): void {
    this.checkUserRole();
    this.loadUsuarios();
  }

  private checkUserRole(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';
  }

  loadUsuarios(): void {
    this.isLoading = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.filteredUsuarios = usuarios;
        this.calculateMetrics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.error('Error al cargar usuarios');
        this.isLoading = false;
      },
    });
  }

  onFiltersChanged(filters: UserFilters): void {
    this.filteredUsuarios = this.usuarios.filter((usuario) => {
      // Filtro de búsqueda
      const matchSearch =
        !filters.search ||
        usuario.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        usuario.email.toLowerCase().includes(filters.search.toLowerCase());

      // Filtro de rol
      const matchRol = !filters.rol || usuario.rol === filters.rol;

      // Filtro de estado
      const matchEstado =
        !filters.activo || usuario.activo === (filters.activo === 'true');

      // Filtro de municipio
      const matchMunicipio =
        !filters.municipioId ||
        usuario.municipioId?._id === filters.municipioId;

      // Filtro de módulo
      const matchModulo =
        !filters.moduloId || usuario.moduloId?._id === filters.moduloId;

      return (
        matchSearch && matchRol && matchEstado && matchMunicipio && matchModulo
      );
    });

    this.calculateMetrics();
  }

  onCreateUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsuarios();
      }
    });
  }

  onEditUser(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { usuario },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsuarios();
      }
    });
  }

  onToggleUserStatus(usuario: Usuario): void {
    console.log('Toggle status called for user:', usuario);
    const newStatus = !usuario.activo;
    console.log(
      'Calling updateUsuario with id:',
      usuario._id,
      'newStatus:',
      newStatus,
    );
    this.usuariosService
      .updateUsuario(usuario._id, { activo: newStatus })
      .subscribe({
        next: () => {
          console.log('Usuario actualizado exitosamente');
          this.notificationService.success(
            `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
          );
          this.loadUsuarios();
        },
        error: (error) => {
          console.error('Error al cambiar estado del usuario:', error);
          this.notificationService.error('Error al cambiar estado del usuario');
        },
      });
  }

  onDeleteUser(usuario: Usuario): void {
    console.log('Delete user called for user:', usuario);
    console.log('Calling deleteUsuario with id:', usuario._id);
    this.usuariosService.deleteUsuario(usuario._id).subscribe({
      next: () => {
        console.log('Usuario eliminado exitosamente');
        this.notificationService.success('Usuario eliminado exitosamente');
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.notificationService.error('Error al eliminar usuario');
      },
    });
  }

  hasAlerts(): boolean {
    return (
      this.usuariosBloqueados > 0 ||
      this.usuariosSinRol > 0 ||
      this.usuariosInactivos30Dias > 0
    );
  }

  private calculateMetrics(): void {
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);

    // Usuarios bloqueados (no activos)
    this.usuariosBloqueados = this.filteredUsuarios.filter(
      (u) => !u.activo,
    ).length;

    // Usuarios sin rol
    this.usuariosSinRol = this.filteredUsuarios.filter((u) => !u.rol).length;

    // Usuarios sin acceso en 30+ días
    this.usuariosInactivos30Dias = this.filteredUsuarios.filter((u) => {
      if (!u.ultimoAcceso) return true;
      const ultimoAcceso = new Date(u.ultimoAcceso);
      return ultimoAcceso < hace30Dias;
    }).length;
  }
}
