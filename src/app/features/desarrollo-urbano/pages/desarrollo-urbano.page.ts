import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-desarrollo-urbano',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './desarrollo-urbano.page.html',
  styleUrls: ['./desarrollo-urbano.page.scss'],
})
export class DesarrolloUrbanoPage {
  constructor() {}
}
