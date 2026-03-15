import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './image-upload-button.component.html',
  styleUrl: './image-upload-button.component.scss',
})
export class ImageUploadButtonComponent {
  @Input() label = 'Seleccionar imagen';
  @Input() accept = 'image/*';
  @Output() fileChange = new EventEmitter<Event>();
}
