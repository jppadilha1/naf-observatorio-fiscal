import { Component, Input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

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
}
