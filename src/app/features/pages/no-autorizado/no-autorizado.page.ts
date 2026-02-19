import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './no-autorizado.page.html',
  styleUrls: ['./no-autorizado.page.scss'],
})
export class NoAutorizadoPage {
  constructor(private router: Router) {}

  volver(): void {
    this.router.navigate(['/']);
  }
}
