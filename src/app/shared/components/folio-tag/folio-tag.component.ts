import { Component, input } from '@angular/core';

@Component({
  selector: 'app-folio-tag',
  standalone: true,
  template: `<span class="folio-tag">{{ folio() }}</span>`,
  styleUrls: ['./folio-tag.component.scss'],
})
export class FolioTagComponent {
  folio = input.required<string>();
}
