import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import type { EChartsOption } from 'echarts';
import { ChartComponent } from '../../components/chart/chart.component';
import { fetchArrecadacao, type ArrecadacaoData } from './arrecadacao.fetch';

@Component({
  selector: 'app-arrecadacao',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './arrecadacao.component.html',
  styleUrl: './arrecadacao.component.css',
})
export class ArrecadacaoComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  // App é zoneless: HTTP async não dispara change detection sozinho.
  // markForCheck() agenda a atualização da view quando os dados chegam.
  private readonly cdr = inject(ChangeDetectorRef);
  loading = true;
  error: string | null = null;
  optionComparativo: EChartsOption = {};
  optionComposicao: EChartsOption = {};

  ngOnInit() {
    fetchArrecadacao(this.http)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (data) => {
        this.buildCharts(data);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private buildCharts(data: ArrecadacaoData) {
    const anos = data.series.map((s) => String(s.ano));
    const propria = data.series.map((s) => +(s.iptu + s.iss).toFixed(0));
    const transferencias = data.series.map((s) => +(s.fpm + s.icms + s.fundeb).toFixed(0));

    this.optionComparativo = {
      tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(1)}M` },
      legend: { data: ['Receita Própria', 'Transferências'] },
      xAxis: { type: 'category', data: anos },
      yAxis: { type: 'value', axisLabel: { formatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(0)}M` } },
      series: [
        { name: 'Receita Própria', type: 'bar', data: propria, itemStyle: { color: '#3b82f6' } },
        { name: 'Transferências', type: 'bar', data: transferencias, itemStyle: { color: '#10b981' } },
      ],
    };

    const ultimo = data.series.at(-1)!;
    this.optionComposicao = {
      tooltip: { trigger: 'item', valueFormatter: (v: unknown) => `R$ ${((v as number) / 1e6).toFixed(1)}M` },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: `Composição ${ultimo.ano}`,
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { name: 'IPTU', value: +ultimo.iptu.toFixed(0) },
            { name: 'ISS', value: +ultimo.iss.toFixed(0) },
            { name: 'FPM', value: +ultimo.fpm.toFixed(0) },
            { name: 'ICMS', value: +ultimo.icms.toFixed(0) },
            { name: 'Fundeb', value: +ultimo.fundeb.toFixed(0) },
          ],
        },
      ],
    };
  }
}
