import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MunicipiosService } from '../services/municipios.service';
import { Municipio } from '../models/municipio.model';
import { MunicipioFormDialogComponent } from '../components/municipio-form-dialog/municipio-form-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-municipios',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './municipios.page.html',
  styleUrls: ['./municipios.page.scss'],
})
export class MunicipiosPage implements OnInit {
  private municipiosService = inject(MunicipiosService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'nombre',
    'estado',
    'poblacion',
    'contactoEmail',
    'contactoTelefono',
    'adminNombre',
    'adminEmail',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Municipio>([]);
  isLoading = false;

  ngOnInit(): void {
    this.loadMunicipios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMunicipios(): void {
    this.isLoading = true;
    this.municipiosService.getMunicipios().subscribe({
      next: (municipios) => {
        this.dataSource.data = municipios;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
        this.notificationService.error('Error al cargar municipios');
        this.isLoading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openMunicipioDialog(municipio?: Municipio): void {
    const dialogRef = this.dialog.open(MunicipioFormDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { municipio },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // El diálogo ya maneja la petición POST/PUT internamente
        // Solo recargamos la tabla cuando se cierra con éxito
        this.loadMunicipios();
      }
    });
  }

  createMunicipio(municipioData: any): void {
    this.municipiosService.createMunicipio(municipioData).subscribe({
      next: () => {
        this.notificationService.success('Municipio creado exitosamente');
        this.loadMunicipios();
      },
      error: (error) => {
        console.error('Error al crear municipio:', error);
        this.notificationService.error('Error al crear municipio');
      },
    });
  }

  updateMunicipio(id: string, municipioData: any): void {
    this.municipiosService.updateMunicipio(id, municipioData).subscribe({
      next: () => {
        this.notificationService.success('Municipio actualizado exitosamente');
        this.loadMunicipios();
      },
      error: (error) => {
        console.error('Error al actualizar municipio:', error);
        this.notificationService.error('Error al actualizar municipio');
      },
    });
  }

  editMunicipio(municipio: Municipio): void {
    this.openMunicipioDialog(municipio);
  }

  deleteMunicipio(municipio: Municipio): void {
    if (
      confirm(`¿Estás seguro de eliminar el municipio "${municipio.nombre}"?`)
    ) {
      const municipioId = municipio._id || municipio.id?.toString() || '';
      this.municipiosService.deleteMunicipio(municipioId).subscribe({
        next: () => {
          this.notificationService.success('Municipio eliminado exitosamente');
          this.loadMunicipios();
        },
        error: (error) => {
          console.error('Error al eliminar municipio:', error);
          this.notificationService.error('Error al eliminar municipio');
        },
      });
    }
  }
}
