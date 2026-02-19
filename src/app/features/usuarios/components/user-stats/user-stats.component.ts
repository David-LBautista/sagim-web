import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface UserStat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss'],
})
export class UserStatsComponent {
  @Input() totalUsuarios: number = 0;
  @Input() usuariosActivos: number = 0;
  @Input() usuariosInactivos: number = 0;
  @Input() municipiosConUsuarios: number = 0;
  @Input() showMunicipiosCard: boolean = false;

  get stats(): UserStat[] {
    const baseStats: UserStat[] = [
      {
        label: 'Total de Usuarios',
        value: this.totalUsuarios,
        icon: 'people',
        color: 'primary',
      },
      {
        label: 'Usuarios Activos',
        value: this.usuariosActivos,
        icon: 'check_circle',
        color: 'success',
      },
      {
        label: 'Usuarios Inactivos',
        value: this.usuariosInactivos,
        icon: 'cancel',
        color: 'danger',
      },
    ];

    if (this.showMunicipiosCard) {
      baseStats.push({
        label: 'Municipios con Usuarios',
        value: this.municipiosConUsuarios,
        icon: 'location_city',
        color: 'secondary',
      });
    }

    return baseStats;
  }
}
