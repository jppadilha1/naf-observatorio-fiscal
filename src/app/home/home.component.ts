import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly dashboards = [
    {
      title: 'Arrecadação e Repasses',
      description:
        'Evolução da receita própria (IPTU, ISS) e das transferências constitucionais (FPM, ICMS, Fundeb) ao longo dos anos.',
      icon: '💰',
      route: '/arrecadacao',
      color: 'card-blue',
    },
    {
      title: 'Despesas por Função',
      description:
        'Como o município investe seu orçamento: Saúde, Educação, Urbanismo e demais funções orçamentárias.',
      icon: '📊',
      route: '/despesas',
      color: 'card-green',
    },
    {
      title: 'Indicadores Socioeconômicos',
      description:
        'Renda per capita, emprego formal e dinâmica empresarial do município de Varginha.',
      icon: '🏙️',
      route: '/socioeconomico',
      color: 'card-amber',
    },
  ];
}
