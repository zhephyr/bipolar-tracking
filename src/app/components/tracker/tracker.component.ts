import { Component, OnInit } from '@angular/core';
import { CheckInService } from '../../services/check-in.service';
import { CheckIn } from '../../models/check-in.model';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-tracker',
  template: `
    <div class="tracker-container">
      <h1>Mood & Energy Tracker</h1>
      
      <div class="chart-section">
        <h2>Overall Metrics</h2>
        <div class="chart-wrapper">
          <canvas baseChart
            [type]="'line'"
            [data]="overallChartData"
            [options]="chartOptions">
          </canvas>
        </div>
      </div>

      <div class="chart-section">
        <h2>Sleep Metrics</h2>
        <div class="chart-wrapper">
          <canvas baseChart
            [type]="'line'"
            [data]="sleepChartData"
            [options]="chartOptions">
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracker-container {
      padding: 40px;
      background: #3a3a3a;
      min-height: 100vh;
      color: #e0e0e0;
    }
    
    h1 {
      font-size: 36px;
      margin-bottom: 30px;
      color: #fff;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #fff;
    }

    .chart-section {
      margin-bottom: 60px;
      background: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 12px;
    }

    .chart-wrapper {
      position: relative;
      height: 400px;
      background: rgba(255, 255, 255, 0.03);
      padding: 20px;
      border-radius: 8px;
    }
  `]
})
export class TrackerComponent implements OnInit {
  overallChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { label: 'Sleep Quality', data: [], borderColor: '#4BC0C0', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0 },
      { label: 'Energy Level', data: [], borderColor: '#FFCE56', backgroundColor: 'rgba(255, 206, 86, 0.2)', tension: 0 },
      { label: 'Mental Clarity', data: [], borderColor: '#36A2EB', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0 },
      { label: 'Sensitivity', data: [], borderColor: '#FF6384', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0 },
      { label: 'Impulsivity', data: [], borderColor: '#9966FF', backgroundColor: 'rgba(153, 102, 255, 0.2)', tension: 0 },
      { label: 'Self-Perception', data: [], borderColor: '#FF9F40', backgroundColor: 'rgba(255, 159, 64, 0.2)', tension: 0 }
    ]
  };

  sleepChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { label: 'Sleep Quality', data: [], borderColor: '#4BC0C0', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.4 },
      { label: 'Sleep Readiness', data: [], borderColor: '#8E44AD', backgroundColor: 'rgba(142, 68, 173, 0.2)', tension: 0.4 }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -3,
        max: 3,
        ticks: {
          color: '#e0e0e0',
          stepSize: 1
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#e0e0e0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#e0e0e0'
        }
      }
    }
  };

  constructor(private checkInService: CheckInService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    this.checkInService.getCheckIns(30).subscribe({
      next: (checkIns) => {
        if (!checkIns || checkIns.length === 0) return;

        // Group check-ins by date
        const dataByDate = new Map<string, Map<string, number>>();
        
        checkIns.forEach(ci => {
          const date = new Date(ci.date).toISOString().split('T')[0];
          if (!dataByDate.has(date)) {
            dataByDate.set(date, new Map());
          }
          dataByDate.get(date)!.set(ci.questionId, ci.answer);
        });

        // Sort dates and get labels
        const sortedDates = Array.from(dataByDate.keys()).sort();
        const labels = sortedDates.map(d => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        // Extract data for each metric
        const questionKeys = ['sleep_quality', 'energy_level', 'mental_clarity', 'sensitivity', 'impulsivity', 'self_perception', 'sleep_readiness'];
        const dataArrays = questionKeys.map(key => 
          sortedDates.map(date => dataByDate.get(date)?.get(key) ?? null)
        );

        // Update overall chart
        this.overallChartData = {
          labels,
          datasets: [
            { label: 'Sleep Quality', data: dataArrays[0], borderColor: '#4BC0C0', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0 },
            { label: 'Energy Level', data: dataArrays[1], borderColor: '#FFCE56', backgroundColor: 'rgba(255, 206, 86, 0.2)', tension: 0 },
            { label: 'Mental Clarity', data: dataArrays[2], borderColor: '#36A2EB', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0 },
            { label: 'Sensitivity', data: dataArrays[3], borderColor: '#FF6384', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0 },
            { label: 'Impulsivity', data: dataArrays[4], borderColor: '#9966FF', backgroundColor: 'rgba(153, 102, 255, 0.2)', tension: 0 },
            { label: 'Self-Perception', data: dataArrays[5], borderColor: '#FF9F40', backgroundColor: 'rgba(255, 159, 64, 0.2)', tension: 0 }
          ]
        };

        // Update sleep chart - shift sleep_quality by one day to align with previous day's sleep_readiness
        const shiftedSleepQuality = [null, ...dataArrays[0].slice(0, -1)];
        
        this.sleepChartData = {
          labels,
          datasets: [
            { label: 'Sleep Quality (Next Day)', data: shiftedSleepQuality, borderColor: '#4BC0C0', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.4 },
            { label: 'Sleep Readiness (Previous Night)', data: dataArrays[6], borderColor: '#8E44AD', backgroundColor: 'rgba(142, 68, 173, 0.2)', tension: 0.4 }
          ]
        };
      },
      error: (err) => console.error('Error loading chart data:', err)
    });
  }
}
