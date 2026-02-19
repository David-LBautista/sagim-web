import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioRol } from '../../models/usuario.model';
import { MunicipiosService } from '../../../municipios/services/municipios.service';
import { Municipio } from '../../../municipios/models/municipio.model';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { AuthService } from '../../../auth/services/auth.service';

export interface UserFilters {
  search: string;
  rol: string;
  activo: string;
  municipioId: string;
  moduloId: string;
}

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './user-filters.component.html',
  styleUrls: ['./user-filters.component.scss'],
})
export class UserFiltersComponent implements OnInit {
  private municipiosService = inject(MunicipiosService);
  private catalogosService = inject(CatalogosService);
  private authService = inject(AuthService);

  @Input() showCreateButton: boolean = true;
  @Output() filtersChanged = new EventEmitter<UserFilters>();
  @Output() createUser = new EventEmitter<void>();

  isSuperAdmin: boolean = false;
  isAdminMunicipio: boolean = false;

  filters: UserFilters = {
    search: '',
    rol: '',
    activo: '',
    municipioId: '',
    moduloId: '',
  };

  municipios: Municipio[] = [];
  modulos: Array<{ _id: string; nombre: string }> = [];

  roles: Array<{ value: string; label: string }> = [
    { value: '', label: 'Todos los roles' },
  ];

  estados = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' },
  ];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';
    this.isAdminMunicipio = currentUser?.rol === 'ADMIN_MUNICIPIO';

    if (this.isSuperAdmin) {
      this.loadMunicipios();
      this.loadRoles();
    }

    if (this.isAdminMunicipio) {
      this.loadModulos();
    }
  }

  private loadMunicipios(): void {
    this.municipiosService.getMunicipios().subscribe({
      next: (municipios) => {
        this.municipios = municipios;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      },
    });
  }

  private loadRoles(): void {
    this.catalogosService.getRoles().subscribe({
      next: (roles) => {
        const rolesOptions = roles.map((rol) => ({
          value: rol.nombre,
          label: rol.nombre,
        }));
        this.roles = [{ value: '', label: 'Todos los roles' }, ...rolesOptions];
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      },
    });
  }

  private loadModulos(): void {
    this.catalogosService.getModulos().subscribe({
      next: (modulos) => {
        this.modulos = modulos;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      },
    });
  }

  onSearchChange(value: string): void {
    this.filters.search = value;
    this.emitFilters();
  }

  onRolChange(value: string): void {
    this.filters.rol = value;
    this.emitFilters();
  }

  onEstadoChange(value: string): void {
    this.filters.activo = value;
    this.emitFilters();
  }

  onMunicipioChange(value: string): void {
    this.filters.municipioId = value;
    this.emitFilters();
  }

  onModuloChange(value: string): void {
    this.filters.moduloId = value;
    this.emitFilters();
  }

  onCreateUser(): void {
    this.createUser.emit();
  }

  private emitFilters(): void {
    this.filtersChanged.emit(this.filters);
  }
}
