import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { APP_MODULES, AppModulo } from '../../modules/app.modules.registry';

interface MenuItem {
  icon?: string;
  label: string;
  route?: string;
  children?: SubMenuItem[];
  isDivider?: boolean;
  isHeader?: boolean;
}

interface SubMenuItem {
  label: string;
  route: string;
  icon?: string;
}

interface MenuSection {
  header: string;
  modules: AppModulo[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems: MenuItem[] = [];

  // Definir secciones del menú
  private menuSections: MenuSection[] = [
    {
      header: 'Administración del Sistema',
      modules: ['USUARIOS', 'MUNICIPIOS'],
    },
    {
      header: 'Áreas Municipales',
      modules: [
        'PRESIDENCIA',
        'SECRETARIA_AYUNTAMIENTO',
        'COMUNICACION_SOCIAL',
        'UIPPE',
        'CONTRALORIA',
        'SEGURIDAD_PUBLICA',
        'SERVICIOS_PUBLICOS',
        'DESARROLLO_URBANO',
        'DESARROLLO_ECONOMICO',
        'DESARROLLO_SOCIAL',
        'TESORERIA',
        'DIF',
        'ORGANISMO_AGUA',
        'REPORTES',
        'CITAS',
      ],
    },
  ];

  ngOnInit(): void {
    this.loadMenuItems();
  }

  /**
   * Cargar items de menú basados en módulos del usuario
   */
  private loadMenuItems(): void {
    const modulos = this.authService.getModulos();
    const items: MenuItem[] = [];

    // Iterar por cada sección
    this.menuSections.forEach((section) => {
      // Filtrar módulos de esta sección que el usuario tenga
      const sectionModules = modulos.filter((modulo: string) =>
        section.modules.includes(modulo as AppModulo),
      );

      // Si hay módulos en esta sección, agregar header y módulos
      if (sectionModules.length > 0) {
        // Agregar header de sección
        items.push({
          label: section.header,
          isHeader: true,
        });

        // Agregar módulos de la sección
        sectionModules.forEach((modulo: string) => {
          const moduloKey = modulo as AppModulo;
          const moduloConfig = APP_MODULES[moduloKey];

          if (!moduloConfig) {
            console.warn(`Módulo ${modulo} no encontrado en APP_MODULES`);
            return;
          }

          // Módulos con submenús
          if (moduloKey === 'DIF') {
            items.push({
              icon: moduloConfig.icon,
              label: moduloConfig.label,
              children: [
                {
                  label: 'Inventario',
                  route: '/dif/inventario',
                  icon: 'inventory_2',
                },
              ],
            });
          } else {
            items.push({
              icon: moduloConfig.icon,
              label: moduloConfig.label,
              route: moduloConfig.route,
            });
          }
        });
      }
    });

    this.menuItems = items;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
