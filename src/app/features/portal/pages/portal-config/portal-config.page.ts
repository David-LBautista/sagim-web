import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ImageUploadButtonComponent } from '../../../../shared/components/image-upload-button/image-upload-button.component';
import { PortalConfigService } from '../../services/portal-config.service';
import {
  PortalFooterColumna,
  PortalFooterLink,
  PortalNumeroEmergencia,
} from '../../../../public/municipios/portal-publico.models';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-portal-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    ActionButtonComponent,
    ImageUploadButtonComponent,
  ],
  templateUrl: './portal-config.page.html',
  styleUrl: './portal-config.page.scss',
})
export class PortalConfigPage implements OnInit {
  private svc = inject(PortalConfigService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  cargando = signal(true);
  guardandoGeneral = signal(false);
  guardandoApariencia = signal(false);
  guardandoRedes = signal(false);
  guardandoFooter = signal(false);
  subiendoBanner = signal(false);
  bannerPreview = signal<string | null>(null);
  bannerFile: File | null = null;

  generalForm!: FormGroup;
  aparienciaForm!: FormGroup;
  redesForm!: FormGroup;
  footerForm!: FormGroup;

  ngOnInit(): void {
    this.svc.getConfiguracion().subscribe({
      next: (data) => {
        this.buildForms(data);
        this.cargando.set(false);
      },
      error: () => {
        this.buildForms(null);
        this.cargando.set(false);
      },
    });
  }

  private buildForms(data: any): void {
    const g = data?.general ?? {};
    const a = data?.apariencia ?? {};
    const r = data?.redesSociales ?? {};
    const f = data?.footer ?? {};

    this.generalForm = this.fb.group({
      subtitulo: [g.subtitulo ?? ''],
      mensajeBienvenida: [g.mensajeBienvenida ?? ''],
      mostrarCitas: [g.mostrarCitas ?? true],
      mostrarReportes: [g.mostrarReportes ?? true],
      mostrarTransparencia: [g.mostrarTransparencia ?? true],
      enMantenimiento: [g.enMantenimiento ?? false],
      mensajeMantenimiento: [g.mensajeMantenimiento ?? ''],
    });

    this.aparienciaForm = this.fb.group({
      colorPrimario: [a.colorPrimario ?? '#0f2a44'],
      colorSecundario: [a.colorSecundario ?? '#1f6fae'],
      bannerUrl: [a.bannerUrl ?? ''],
      bannerAlt: [a.bannerAlt ?? ''],
    });

    if (a.bannerUrl) this.bannerPreview.set(a.bannerUrl);

    this.redesForm = this.fb.group({
      facebook: [r.facebook ?? ''],
      twitter: [r.twitter ?? ''],
      instagram: [r.instagram ?? ''],
      youtube: [r.youtube ?? ''],
      sitioWeb: [r.sitioWeb ?? ''],
    });

    this.footerForm = this.fb.group({
      direccion: [f.direccion ?? ''],
      correo: [f.correo ?? '', Validators.email],
      telefono: [f.telefono ?? ''],
      textoLegal: [f.textoLegal ?? ''],
      columnas: this.fb.array(
        (f.columnas ?? []).map((c: PortalFooterColumna) =>
          this.buildColumnaGroup(c),
        ),
      ),
      numerosEmergencia: this.fb.array(
        (f.numerosEmergencia ?? []).map((n: PortalNumeroEmergencia) =>
          this.buildNumeroGroup(n),
        ),
      ),
    });
  }

  private buildColumnaGroup(c?: Partial<PortalFooterColumna>): FormGroup {
    return this.fb.group({
      titulo: [c?.titulo ?? ''],
      links: this.fb.array(
        (c?.links ?? []).map((l: PortalFooterLink) => this.buildLinkGroup(l)),
      ),
    });
  }

  private buildLinkGroup(l?: Partial<PortalFooterLink>): FormGroup {
    return this.fb.group({
      texto: [l?.texto ?? ''],
      url: [l?.url ?? '', Validators.pattern(/^https?:\/\//i)],
      externo: [l?.externo ?? false],
    });
  }

  private buildNumeroGroup(n?: Partial<PortalNumeroEmergencia>): FormGroup {
    return this.fb.group({
      numero: [n?.numero ?? ''],
      servicio: [n?.servicio ?? ''],
    });
  }

  get columnas(): FormArray {
    return this.footerForm.get('columnas') as FormArray;
  }
  get numerosEmergencia(): FormArray {
    return this.footerForm.get('numerosEmergencia') as FormArray;
  }
  linksOf(i: number): FormArray {
    return this.columnas.at(i).get('links') as FormArray;
  }

  addColumna(): void {
    if (this.columnas.length >= 3) return;
    this.columnas.push(this.buildColumnaGroup());
  }
  removeColumna(i: number): void {
    this.columnas.removeAt(i);
  }
  addLink(ci: number): void {
    this.linksOf(ci).push(this.buildLinkGroup());
  }
  removeLink(ci: number, li: number): void {
    this.linksOf(ci).removeAt(li);
  }
  addNumero(): void {
    this.numerosEmergencia.push(this.buildNumeroGroup());
  }

  get enMantenimiento() {
    return this.generalForm?.get('enMantenimiento')?.value as boolean;
  }
  removeNumero(i: number): void {
    this.numerosEmergencia.removeAt(i);
  }

  onBannerSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.snack.open('El archivo no puede superar 5 MB', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.bannerFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.bannerPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadBanner(): void {
    if (!this.bannerFile) return;
    this.subiendoBanner.set(true);
    this.svc.uploadBanner(this.bannerFile).subscribe({
      next: (res) => {
        this.aparienciaForm.patchValue({ bannerUrl: res.bannerUrl });
        this.bannerFile = null;
        this.subiendoBanner.set(false);
        this.snack.open('Banner actualizado', 'OK', { duration: 2500 });
      },
      error: () => {
        this.subiendoBanner.set(false);
        this.snack.open('Error al subir el banner', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  guardarGeneral(): void {
    if (this.generalForm.invalid) return;
    this.guardandoGeneral.set(true);
    this.svc.patchGeneral(this.generalForm.value).subscribe({
      next: () => {
        this.guardandoGeneral.set(false);
        this.snack.open('Configuración general guardada', 'OK', {
          duration: 2500,
        });
      },
      error: () => {
        this.guardandoGeneral.set(false);
        this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardarApariencia(): void {
    if (this.aparienciaForm.invalid) return;
    this.guardandoApariencia.set(true);
    const { bannerUrl, ...rest } = this.aparienciaForm.value;
    this.svc.patchApariencia(rest).subscribe({
      next: () => {
        this.guardandoApariencia.set(false);
        this.snack.open('Apariencia guardada', 'OK', { duration: 2500 });
      },
      error: () => {
        this.guardandoApariencia.set(false);
        this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardarRedes(): void {
    if (this.redesForm.invalid) return;
    this.guardandoRedes.set(true);
    this.svc.patchRedesSociales(this.redesForm.value).subscribe({
      next: () => {
        this.guardandoRedes.set(false);
        this.snack.open('Redes sociales guardadas', 'OK', { duration: 2500 });
      },
      error: () => {
        this.guardandoRedes.set(false);
        this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardarFooter(): void {
    if (this.footerForm.invalid) return;
    this.guardandoFooter.set(true);
    this.svc.patchFooter(this.footerForm.value).subscribe({
      next: () => {
        this.guardandoFooter.set(false);
        this.snack.open('Footer guardado', 'OK', { duration: 2500 });
      },
      error: () => {
        this.guardandoFooter.set(false);
        this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  verPortal(): void {
    const slug = environment.production
      ? window.location.hostname.split('.')[0]
      : 'la-perla';
    window.open(`${environment.frontendUrl}/public/${slug}`, '_blank');
  }
}
