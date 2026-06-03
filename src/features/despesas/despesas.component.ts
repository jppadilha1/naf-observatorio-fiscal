import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { ChartComponent } from '../../components/chart/chart.component';
import { fetchDespesas, type DespesasData } from './despesas.fetch';

const FUNCOES_DESTAQUE = ['10', '12', '15']; // Saúde, Educação, Urbanismo

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.css',
})
export class DespesasComponent implements OnInit {
  loading = true;
  error: string | null = null;
  optionDistribuicao: EChartsOption = {};
  optionEvolucao: EChartsOption = {};

  ngOnInit() {
    fetchDespesas().subscribe({
      next: (data) => {
        this.buildCharts(data);
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  private buildCharts(data: DespesasData) {
    const ultimo = data.series.at(-1);
    if (!ultimo) return;

    // Gráfico 1: Barras horizontais — distribuição no último ano
    const sorted = [...ultimo.funcoes].sort((a, b) => b.valor - a.valor);
    const cores = sorted.map((f) =>
      FUNCOES_DESTAQUE.includes(f.funcao) ? '#3b82f6' : '#93c5fd'
    );

    this.optionDistribuicao = {
      tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(1)}M` },
      xAxis: { type: 'value', axisLabel: { formatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(0)}M` } },
      yAxis: { type: 'category', data: sorted.map((f) => f.nome) },
      series: [
        {
          type: 'bar',
          data: sorted.map((f, i) => ({ value: f.valor, itemStyle: { color: cores[i] } })),
        },
      ],
    };

    // Gráfico 2: Linhas — evolução das 3 funções principais
    const anos = data.series.map((s) => String(s.ano));
    const funcoesPrincipais = ['10', '12', '15'];
    const nomes: Record<string, string> = { '10': 'Saúde', '12': 'Educação', '15': 'Urbanismo' };
    const cores2 = ['#ef4444', '#3b82f6', '#f59e0b'];

    this.optionEvolucao = {
      tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(1)}M` },
      legend: { data: funcoesPrincipais.map((c) => nomes[c]) },
      xAxis: { type: 'category', data: anos },
      yAxis: { type: 'value', axisLabel: { formatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(0)}M` } },
      series: funcoesPrincipais.map((cod, i) => ({
        name: nomes[cod],
        type: 'line',
        smooth: true,
        itemStyle: { color: cores2[i] },
        data: data.series.map((s) => s.funcoes.find((f) => f.funcao === cod)?.valor ?? 0),
      })),
    };
  }
}
