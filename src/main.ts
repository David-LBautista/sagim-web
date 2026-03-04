import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// ── Configuración global de dayjs ────────────────────────────────────────────
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
// ─────────────────────────────────────────────────────────────────────────────

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
