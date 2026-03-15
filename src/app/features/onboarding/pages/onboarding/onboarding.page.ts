import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

import { OnboardingService } from '../../services/onboarding.service';
import {
  OnboardingState,
  OnboardingMunicipioInfo,
  OnboardingOperador,
} from '../../models/onboarding.model';
import { AuthService } from '../../../auth/services/auth.service';
import { MunicipiosService } from '../../../municipios/services/municipios.service';
import { TesoreriaService } from '../../../tesoreria/services/tesoreria.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { UsuarioRol } from '../../../usuarios/models/usuario.model';
import {
  ServicioCobrable,
  CategoriaServicio,
} from '../../../tesoreria/models/servicios.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';
import {
  APP_MODULES,
  AppModulo,
} from '../../../../core/modules/app.modules.registry';
import {
  AgregarOperadorDialogComponent,
  AgregarOperadorDialogData,
  AgregarOperadorDialogResult,
} from '../../components/agregar-operador-dialog/agregar-operador-dialog.component';
import { ImportarPadronDialogComponent } from '../../../municipios/components/importar-padron-dialog/importar-padron-dialog.component';

// ── Tipos internos ────────────────────────────────────────────────────────────

interface ServicioRow {
  servicio: ServicioCobrable;
  editing: boolean;
  editCosto: number;
  saving: boolean;
}

interface CategoriaGroup {
  nombre: string;
  servicios: ServicioRow[];
  expanded: boolean;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    ActionButtonComponent,
  ],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
})
export class OnboardingPage implements OnInit {
  private onboardingService = inject(OnboardingService);
  private authService = inject(AuthService);
  private municipiosService = inject(MunicipiosService);
  private tesoreriaService = inject(TesoreriaService);
  private usuariosService = inject(UsuariosService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // ── Estado general ────────────────────────────────────────────────────────
  cargando = signal(true);
  state = signal<OnboardingState | null>(null);
  paso = signal(1); // 1-4 + 5 = final

  municipioId = computed(
    () => this.authService.getCurrentUser()?.municipioId ?? '',
  );

  // ── Paso 1: Datos municipio ───────────────────────────────────────────────
  editandoDatos = signal(false);
  guardandoDatos = signal(false);
  datosContinuando = signal(false);
  datosConfirmado = signal(false);
  datosForm!: FormGroup;

  // ── Paso 2: Catálogo ──────────────────────────────────────────────────────
  cargandoServicios = signal(false);
  catalogoGrupos = signal<CategoriaGroup[]>([]);
  serviciosContinuando = signal(false);
  serviciosConfirmado = signal(false);
  // ── Paso 3: Equipo ────────────────────────────────────────────────────────
  cargandoOperadores = signal(false);
  operadores = signal<OnboardingOperador[]>([]);
  equipoContinuando = signal(false);
  equipoConfirmado = signal(false);

  // ── Paso 4: Padrón ────────────────────────────────────────────────────────
  padronContinuando = signal(false);

  // ── Paso final ────────────────────────────────────────────────────────────
  finalizando = signal(false);

  // ── Módulos habilitados legibles ─────────────────────────────────────────
  modulosHabilitadosLabels = computed(() => {
    const muni = this.state()?.municipio;
    if (!muni?.config?.modulos) return [];
    return Object.entries(muni.config.modulos)
      .filter(([, v]) => v)
      .map(([k]) => APP_MODULES[k as AppModulo]?.label ?? k);
  });

  ngOnInit(): void {
    this.datosForm = this.fb.group({
      contactoEmail: ['', Validators.email],
      contactoTelefono: [''],
      direccion: [''],
      porcentajeContribucion: [null, [Validators.min(0), Validators.max(100)]],
    });
    this.cargarEstado();
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  private cargarEstado(): void {
    const id = this.municipioId();
    if (!id) return;
    this.cargando.set(true);
    this.onboardingService.getState(id).subscribe({
      next: (st) => {
        this.state.set(st);
        const pasoRetomar = st.onboardingCompletado ? 5 : (st.pasoActual ?? 1);
        this.paso.set(pasoRetomar);
        this.cargando.set(false);
        // pre-cargar datos según paso
        if (pasoRetomar === 2) this.cargarCatalogo();
        if (pasoRetomar === 3) this.cargarOperadores();
        if (pasoRetomar === 5) {
          /* nada */
        }
      },
      error: () => {
        this.cargando.set(false);
        this.notification.show({
          message: 'Error al cargar el estado de configuración',
          type: NotificationType.ERROR,
        });
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  stepState(step: number): 'completed' | 'current' | 'pending' {
    const p = this.paso();
    if (step < p) return 'completed';
    if (step === p) return 'current';
    return 'pending';
  }

  // ── Paso 1 ────────────────────────────────────────────────────────────────

  onEditarDatos(): void {
    const muni = this.state()?.municipio;
    this.datosForm.patchValue({
      contactoEmail: muni?.contactoEmail ?? '',
      contactoTelefono: muni?.contactoTelefono ?? '',
      direccion: muni?.direccion ?? '',
      porcentajeContribucion: muni?.porcentajeContribucion ?? null,
    });
    this.editandoDatos.set(true);
  }

  onCancelarDatos(): void {
    this.editandoDatos.set(false);
  }

  onGuardarDatos(): void {
    if (this.datosForm.invalid) {
      this.datosForm.markAllAsTouched();
      return;
    }
    this.guardandoDatos.set(true);
    const val = this.datosForm.getRawValue();
    this.municipiosService
      .updateMunicipio(this.municipioId(), {
        contactoEmail: val.contactoEmail || undefined,
        contactoTelefono: val.contactoTelefono || undefined,
        direccion: val.direccion || undefined,
        porcentajeContribucion: val.porcentajeContribucion ?? undefined,
      })
      .subscribe({
        next: (muni) => {
          this.guardandoDatos.set(false);
          this.editandoDatos.set(false);
          // actualizar state local
          this.state.update((s) =>
            s
              ? {
                  ...s,
                  municipio: {
                    ...s.municipio,
                    contactoEmail: muni.contactoEmail,
                    contactoTelefono: muni.contactoTelefono,
                    direccion: muni.direccion,
                    porcentajeContribucion: muni.porcentajeContribucion,
                  },
                }
              : s,
          );
          this.notification.show({
            message: 'Información actualizada',
            type: NotificationType.SUCCESS,
          });
        },
        error: () => {
          this.guardandoDatos.set(false);
          this.notification.show({
            message: 'Error al guardar',
            type: NotificationType.ERROR,
          });
        },
      });
  }

  onContinuarDatos(): void {
    this.datosContinuando.set(true);
    this.onboardingService.avanzarDatos(this.municipioId()).subscribe({
      next: (st) => {
        this.state.set(st);
        this.datosContinuando.set(false);
        this.paso.set(2);
        this.cargarCatalogo();
      },
      error: () => {
        this.datosContinuando.set(false);
        this.notification.show({
          message: 'Error al avanzar',
          type: NotificationType.ERROR,
        });
      },
    });
  }

  // ── Paso 2 ────────────────────────────────────────────────────────────────

  private cargarCatalogo(): void {
    this.cargandoServicios.set(true);
    this.tesoreriaService.getServicios({}).subscribe({
      next: (lista) => {
        const grupos = this.agruparPorCategoria(lista);
        this.catalogoGrupos.set(grupos);
        this.cargandoServicios.set(false);
      },
      error: () => {
        this.cargandoServicios.set(false);
        this.notification.show({
          message: 'Error al cargar el catálogo',
          type: NotificationType.ERROR,
        });
      },
    });
  }

  private agruparPorCategoria(servicios: ServicioCobrable[]): CategoriaGroup[] {
    const map = new Map<string, ServicioCobrable[]>();
    for (const s of servicios) {
      const cat = s.categoria ?? 'Otros';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    let i = 0;
    const grupos: CategoriaGroup[] = [];
    map.forEach((svcs, nombre) => {
      grupos.push({
        nombre,
        expanded: i < 2, // primeras 2 categorías abiertas
        servicios: svcs.map((s) => ({
          servicio: s,
          editing: false,
          editCosto: s.costo,
          saving: false,
        })),
      });
      i++;
    });
    return grupos;
  }

  toggleCategoria(grupo: CategoriaGroup): void {
    grupo.expanded = !grupo.expanded;
  }

  onEditarPrecio(row: ServicioRow): void {
    row.editCosto = row.servicio.costo;
    row.editing = true;
    // enfocar input en un tick
    setTimeout(() => {
      const el = document.getElementById(`costo-${row.servicio.clave}`);
      (el as HTMLInputElement)?.focus();
      (el as HTMLInputElement)?.select();
    }, 50);
  }

  onCancelarPrecio(row: ServicioRow): void {
    row.editing = false;
    row.editCosto = row.servicio.costo;
  }

  onGuardarPrecio(row: ServicioRow): void {
    if (row.editCosto === row.servicio.costo) {
      row.editing = false;
      return;
    }
    row.saving = true;
    this.tesoreriaService
      .patchOverride(row.servicio.clave, { costo: row.editCosto })
      .subscribe({
        next: (updated) => {
          row.servicio = { ...row.servicio, costo: updated.costo };
          row.editing = false;
          row.saving = false;
        },
        error: () => {
          row.saving = false;
          this.notification.show({
            message: 'Error al actualizar precio',
            type: NotificationType.ERROR,
          });
        },
      });
  }

  onKeydown(event: KeyboardEvent, row: ServicioRow): void {
    if (event.key === 'Enter') this.onGuardarPrecio(row);
    if (event.key === 'Escape') this.onCancelarPrecio(row);
  }

  onContinuarServicios(): void {
    this.serviciosContinuando.set(true);
    this.onboardingService.avanzarServicios(this.municipioId()).subscribe({
      next: (st) => {
        this.state.set(st);
        this.serviciosContinuando.set(false);
        this.paso.set(3);
        this.cargarOperadores();
      },
      error: () => {
        this.serviciosContinuando.set(false);
        this.notification.show({
          message: 'Error al avanzar',
          type: NotificationType.ERROR,
        });
      },
    });
  }

  // ── Paso 3 ────────────────────────────────────────────────────────────────

  private cargarOperadores(): void {
    this.cargandoOperadores.set(true);
    const emailActual = this.authService.getCurrentUser()?.email;
    this.usuariosService.getUsuarios({ activo: true }).subscribe({
      next: (lista) => {
        // Excluir al usuario admin logueado (quien hace el onboarding)
        // y mostrar únicamente los usuarios con rol OPERADOR u OPERATIVO
        const operadores = lista
          .filter(
            (u) => u.email !== emailActual && u.rol === UsuarioRol.OPERADOR,
          )
          .map((u) => ({
            _id: u._id,
            nombre: u.nombre,
            email: u.email,
            rol: u.rol,
            activo: u.activo,
            moduloId: u.moduloId,
          }));
        this.operadores.set(operadores);
        this.cargandoOperadores.set(false);
      },
      error: () => {
        this.cargandoOperadores.set(false);
      },
    });
  }

  onAgregarOperador(): void {
    const muni = this.state()?.municipio;
    if (!muni) return;

    const modulosHabilitados = muni.config?.modulos
      ? Object.entries(muni.config.modulos)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [];

    const data: AgregarOperadorDialogData = {
      municipioId: this.municipioId(),
      modulosHabilitados,
    };

    const ref = this.dialog.open<
      AgregarOperadorDialogComponent,
      AgregarOperadorDialogData,
      AgregarOperadorDialogResult | null
    >(AgregarOperadorDialogComponent, {
      width: '460px',
      maxWidth: '95vw',
      disableClose: true,
      data,
    });

    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.operadores.update((ops) => [
          ...ops,
          {
            _id: resultado._id,
            nombre: resultado.nombre,
            email: resultado.email,
            rol: 'OPERADOR',
            activo: true,
            moduloId: resultado.moduloNombre
              ? { _id: '', nombre: resultado.moduloNombre }
              : undefined,
          },
        ]);
        // actualizar count en state
        this.state.update((s) =>
          s ? { ...s, operadoresCount: (s.operadoresCount ?? 0) + 1 } : s,
        );
        this.notification.show({
          message: 'Operador registrado',
          type: NotificationType.SUCCESS,
        });
      }
    });
  }

  onContinuarEquipo(): void {
    this.equipoContinuando.set(true);
    this.onboardingService.avanzarEquipo(this.municipioId()).subscribe({
      next: (st) => {
        this.state.set(st);
        this.equipoContinuando.set(false);
        this.paso.set(4);
      },
      error: (err) => {
        this.equipoContinuando.set(false);
        const msg =
          (err as any)?.error?.message ??
          'Se necesita al menos un operador activo';
        this.notification.show({ message: msg, type: NotificationType.ERROR });
      },
    });
  }

  // ── Paso 4 ────────────────────────────────────────────────────────────────

  abrirImportarPadron(): void {
    this.dialog.open(ImportarPadronDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
    });
  }

  onSaltarPadron(): void {
    this.padronContinuando.set(true);
    this.onboardingService
      .avanzarPadron(this.municipioId(), { saltado: true })
      .subscribe({
        next: (st) => {
          this.state.set(st);
          this.padronContinuando.set(false);
          this.paso.set(5);
        },
        error: () => {
          this.padronContinuando.set(false);
          this.notification.show({
            message: 'Error al avanzar',
            type: NotificationType.ERROR,
          });
        },
      });
  }

  // ── Paso final ────────────────────────────────────────────────────────────

  onIrAlSistema(): void {
    this.finalizando.set(true);
    this.onboardingService.completar(this.municipioId()).subscribe({
      next: () => {
        this.finalizando.set(false);
        this.router.navigate(['/presidencia']);
      },
      error: () => {
        this.finalizando.set(false);
        this.notification.show({
          message: 'Error al finalizar la configuración',
          type: NotificationType.ERROR,
        });
      },
    });
  }
}
