import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  systemStatus = {
    status: 'operational',
    label: 'Operativo',
    color: '#6FAE3B', // Verde SAGIM
  };

  footerLinks = [
    { label: 'Estado del Sistema', url: '#', external: false },
    { label: 'Términos de Uso', url: '#', external: false },
    { label: 'Privacidad', url: '#', external: false },
    { label: 'Documentación', url: '#', external: false },
    { label: 'Soporte', url: '#', external: false },
  ];
}
