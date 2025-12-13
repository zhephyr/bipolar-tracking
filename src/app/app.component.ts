import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="landscape">
      <div class="sky" aria-hidden="true"></div>
      <div class="sun-track" aria-hidden="true">
        <div class="sun" aria-hidden="true"></div>
      </div>
      <div class="moon" aria-hidden="true"></div>
      <div class="stars" aria-hidden="true"></div>
      <div class="land"><div class="tree" aria-hidden="true"></div></div>

      <form class="question-form" (submit)="onSubmit($event)">
        <h1>Bipolar Tracking — Daily Check</h1>
        <p class="question">{{ questions[current].text }}</p>

        <div class="controls">
          <label *ngFor="let v of [1,2,3,4,5]"><input type="radio" name="answer" [value]="v" (change)="answer=v"> {{v}}</label>
        </div>

        <div class="nav">
          <button type="button" (click)="prev()" [disabled]="current===0">Back</button>
          <button type="button" (click)="next()">Next</button>
        </div>
        <p class="progress">Question {{ current + 1 }} / {{ questions.length }}</p>
      </form>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  questions = [
    { key: 'wake', text: 'What time did you wake up?' },
    { key: 'sleep_quality', text: 'How was your sleep quality?' },
    { key: 'meals', text: 'Did you eat regular meals today?' },
    { key: 'activity', text: 'How active were you today?' },
    { key: 'mood', text: 'How would you rate your mood today?' },
    { key: 'sleep_plan', text: 'Do you have a sleep plan for tonight?' }
  ];

  current = 0;
  answer: number | null = null;

  ngOnInit(): void { this.updateLandscape(); }

  next(): void { if (this.current < this.questions.length - 1) { this.current++; this.answer=null; this.updateLandscape(); } }
  prev(): void { if (this.current > 0) { this.current--; this.answer=null; this.updateLandscape(); } }
  onSubmit(e: Event): void { e.preventDefault(); this.next(); }

  updateLandscape(): void {
    const progress = this.questions.length > 1 ? this.current / (this.questions.length - 1) : 0;
    const sunLeft = (10 + progress * 80).toFixed(1) + '%';
      const sunTop = ( (60 - Math.sin(Math.PI * progress) * 35) ).toFixed(1) + '%';
    const sky = this.interpolate(['#5C3D2E','#FFD8A8','#87CEEB','#6EC1FF','#B19CD9','#0B2447'], progress);
    const land = this.interpolate(['#3D3A28','#E6E2AF','#9BCB3C','#7BB241','#6FA34F','#2B3A25'], progress);
    const night = Math.max(0, (progress - 0.7) / 0.3);
    const root = document.documentElement;
    root.style.setProperty('--sky', sky);
    root.style.setProperty('--land', land);
    root.style.setProperty('--sun-left', sunLeft);
    root.style.setProperty('--sun-top', sunTop);
    root.style.setProperty('--stars-opacity', String(night));
    root.style.setProperty('--moon-opacity', String(night));
  }

  interpolate(stages: string[], t: number): string {
    const n = stages.length; const s = Math.min(Math.max(t*(n-1),0), n-1); const i = Math.floor(s); const f = s - i;
    const a = this.hexToRgb(stages[i]); const b = this.hexToRgb(stages[Math.min(i+1,n-1)]);
    const r = Math.round(a.r + (b.r-a.r)*f); const g = Math.round(a.g + (b.g-a.g)*f); const bl = Math.round(a.b + (b.b-a.b)*f);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  hexToRgb(hex: string) { const c = hex.replace('#',''); const v = parseInt(c,16); return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 }; }
}
