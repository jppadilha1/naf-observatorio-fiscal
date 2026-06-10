import { Component, Input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption, ECharts } from 'echarts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  @Input() option: EChartsOption = {};
  @Input() loading = false;
  @Input() error: string | null = null;

  // Com render condicional (@if/@else), o container pode ter largura/altura 0
  // no instante em que o ECharts inicializa (layout ainda não aconteceu) — daí
  // o aviso "Can't get DOM width or height" e o canvas em branco. Um resize
  // após o próximo tick, já com o layout pronto, corrige o tamanho.
  onChartInit(chart: ECharts): void {
    setTimeout(() => {
      if (!chart.isDisposed()) {
        chart.resize();
      }
    });
  }
}
