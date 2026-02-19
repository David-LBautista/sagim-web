import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-desarrollo-economico',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './desarrollo-economico.page.html',
  styleUrls: ['./desarrollo-economico.page.scss'],
})
export class DesarrolloEconomicoPage {
  constructor() {}
}
