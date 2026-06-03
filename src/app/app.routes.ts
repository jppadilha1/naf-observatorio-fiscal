import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'arrecadacao',
    loadComponent: () =>
      import('../features/arrecadacao/arrecadacao.component').then(
        (m) => m.ArrecadacaoComponent
      ),
  },
  {
    path: 'despesas',
    loadComponent: () =>
      import('../features/despesas/despesas.component').then(
        (m) => m.DespesasComponent
      ),
  },
  {
    path: 'socioeconomico',
    loadComponent: () =>
      import('../features/socioeconomico/socioeconomico.component').then(
        (m) => m.SocioeconomicoComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
