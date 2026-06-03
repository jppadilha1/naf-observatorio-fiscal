import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { EChartsOption } from 'echarts';
import { ChartComponent } from '../../components/chart/chart.component';
import { fetchSocioeconomico, type SocioeconomicoData } from './socioeconomico.fetch';

interface Kpi {
  label: string;
  value: string;
  variacao: number;
  unidade: string;
}

@Component({
  selector: 'app-socioeconomico',
  standalone: true,
  imports: [ChartComponent, DecimalPipe],
  templateUrl: './socioeconomico.component.html',
  styleUrl: './socioeconomico.component.css',
})
export class SocioeconomicoComponent implements OnInit {
  loading = true;
  error: string | null = null;
  aviso = '';
  kpis: Kpi[] = [];
  optionEmpresas: EChartsOption = {};
  optionEmprego: EChartsOption = {};

  ngOnInit() {
    fetchSocioeconomico().subscribe({
      next: (data) => {
        this.buildKpis(data);
        this.buildCharts(data);
        this.aviso = data._meta.aviso;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  private buildKpis(data: SocioeconomicoData) {
    const rendas = data.renda;
    const empregos = data.emprego;
    const empresas = data.empresas;

    const ultRenda = rendas.at(-1)!;
    const antRenda = rendas.at(-2)!;
    const varRenda = ((ultRenda.rendaPerCapita - antRenda.rendaPerCapita) / antRenda.rendaPerCapita) * 100;

    const ultEmprego = empregos.at(-1)!;
    const antEmprego = empregos.at(-2)!;
    const varSaldo = antEmprego.saldo !== 0
      ? ((ultEmprego.saldo - antEmprego.saldo) / Math.abs(antEmprego.saldo)) * 100
      : 100;

    const ultEmpresas = empresas.at(-1)!;
    const antEmpresas = empresas.at(-2)!;
    const varEmpresas = ((ultEmpresas.ativas - antEmpresas.ativas) / antEmpresas.ativas) * 100;

    this.kpis = [
      {
        label: 'Renda per capita',
        value: `R$ ${ultRenda.rendaPerCapita.toLocaleString('pt-BR')}`,
        variacao: +varRenda.toFixed(1),
        unidade: `${ultRenda.ano}`,
      },
      {
        label: 'Saldo de empregos',
        value: `${ultEmprego.saldo >= 0 ? '+' : ''}${ultEmprego.saldo.toLocaleString('pt-BR')}`,
        variacao: +varSaldo.toFixed(1),
        unidade: `${ultEmprego.ano}`,
      },
      {
        label: 'Empresas ativas',
        value: ultEmpresas.ativas.toLocaleString('pt-BR'),
        variacao: +varEmpresas.toFixed(1),
        unidade: `${ultEmpresas.ano}`,
      },
    ];
  }

  private buildCharts(data: SocioeconomicoData) {
    const anos = data.empresas.map((e) => String(e.ano));

    this.optionEmpresas = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Ativas', 'Inativas'] },
      xAxis: { type: 'category', data: anos },
      yAxis: { type: 'value' },
      series: [
        { name: 'Ativas', type: 'bar', data: data.empresas.map((e) => e.ativas), itemStyle: { color: '#10b981' } },
        { name: 'Inativas', type: 'bar', data: data.empresas.map((e) => e.inativas), itemStyle: { color: '#f87171' } },
      ],
    };

    this.optionEmprego = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Admissões', 'Desligamentos', 'Saldo'] },
      xAxis: { type: 'category', data: data.emprego.map((e) => String(e.ano)) },
      yAxis: { type: 'value' },
      series: [
        { name: 'Admissões', type: 'bar', data: data.emprego.map((e) => e.admissoes), itemStyle: { color: '#3b82f6' } },
        { name: 'Desligamentos', type: 'bar', data: data.emprego.map((e) => e.desligamentos), itemStyle: { color: '#f59e0b' } },
        {
          name: 'Saldo',
          type: 'line',
          smooth: true,
          data: data.emprego.map((e) => e.saldo),
          itemStyle: { color: '#8b5cf6' },
        },
      ],
    };
  }
}
