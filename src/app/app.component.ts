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
      <div class="clouds" aria-hidden="true">
        <svg class="cloud cloud-1" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="25" cy="35" rx="20" ry="15"/>
          <ellipse cx="45" cy="25" rx="25" ry="20"/>
          <ellipse cx="70" cy="30" rx="20" ry="15"/>
        </svg>
        <svg class="cloud cloud-2" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="25" cy="35" rx="20" ry="15"/>
          <ellipse cx="45" cy="25" rx="25" ry="20"/>
          <ellipse cx="70" cy="30" rx="20" ry="15"/>
        </svg>
        <svg class="cloud cloud-3" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="25" cy="35" rx="20" ry="15"/>
          <ellipse cx="45" cy="25" rx="25" ry="20"/>
          <ellipse cx="70" cy="30" rx="20" ry="15"/>
        </svg>
      </div>
      <div class="land"></div>
      <div class="tree" aria-hidden="true"></div>

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
    { key: 'evening', text: 'How did you spend your evening?' },
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

    // Moon follows the same arc but lags 4 questions behind, making it invisible when behind the land
    const moonProgress = (this.current - 4) / (this.questions.length - 1);
    const moonLeft = (10 + moonProgress * 80).toFixed(1) + '%';
    const moonTop = ( (60 - Math.sin(Math.PI * moonProgress) * 35) ).toFixed(1) + '%';
    const moonOpacity = moonProgress >= 0 && moonProgress <= 1 ? 1 : 0;

    const sky = this.interpolate(['#5C3D2E','#FFD8A8','#87CEEB','#6EC1FF','#87CEEB','#B19CD9','#0B2447'], progress);
    const land = this.interpolate(['#3D3A28','#E6E2AF','#9BCB3C','#7BB241','#9BCB3C','#6FA34F','#2B3A25'], progress);

    // parse rgb string "rgb(r, g, b)" -> {r,g,b}
    const parseRgb = (s: string) => {
      const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 0, g: 0, b: 0 };
    };
    const mix = (a: {r:number;g:number; b:number}, b: {r:number;g:number; b:number}, t: number) => {
      return { r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) };
    };
    const toRgbString = (c: {r:number;g:number;b:number}) => `rgb(${c.r}, ${c.g}, ${c.b})`;

    const skyRgb = parseRgb(sky);
    const landRgb = parseRgb(land);

    // Base mixes
    let skyHorizonMix = 0.08;
    let landHorizonMix = 0.20;
    let landFrontMix = 0.12;

    // Increase horizon contrast for questions 2..6 (1-based questions 2-6 => indices 1..5)
    if (this.current >= 1 && this.current <= 5) {
      skyHorizonMix = 0.22; // darker horizon
      landHorizonMix = 0.36; // brighter horizon highlight
      landFrontMix = 0.22; // deepen front shading
    }

    const skyTop = toRgbString(mix(skyRgb, { r:255, g:255, b:255 }, 0.06));
    const skyBottom = toRgbString(mix(skyRgb, { r:0, g:0, b:0 }, 0.12));
    const skyHorizon = toRgbString(mix(skyRgb, { r:0, g:0, b:0 }, skyHorizonMix));

    const landHorizon = toRgbString(mix(landRgb, { r:255, g:255, b:255 }, landHorizonMix));
    const landFront = toRgbString(mix(landRgb, { r:0, g:0, b:0 }, landFrontMix));

    const night = Math.max(0, (progress - 0.7) / 0.3);
    const root = document.documentElement;
    root.style.setProperty('--sky', sky);
    root.style.setProperty('--land', land);
    root.style.setProperty('--sun-left', sunLeft);
    root.style.setProperty('--sun-top', sunTop);
    root.style.setProperty('--moon-left', moonLeft);
    root.style.setProperty('--moon-top', moonTop);
    root.style.setProperty('--stars-opacity', String(night));
    root.style.setProperty('--moon-opacity', String(moonOpacity));

    // override gradient stop variables to increase depth when needed
    root.style.setProperty('--sky-top', skyTop);
    root.style.setProperty('--sky-bottom', skyBottom);
    root.style.setProperty('--sky-horizon', skyHorizon);
    root.style.setProperty('--land-horizon', landHorizon);
    root.style.setProperty('--land-front', landFront);
  }

  interpolate(stages: string[], t: number): string {
    const n = stages.length; const s = Math.min(Math.max(t*(n-1),0), n-1); const i = Math.floor(s); const f = s - i;
    const a = this.hexToRgb(stages[i]); const b = this.hexToRgb(stages[Math.min(i+1,n-1)]);
    const r = Math.round(a.r + (b.r-a.r)*f); const g = Math.round(a.g + (b.g-a.g)*f); const bl = Math.round(a.b + (b.b-a.b)*f);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  hexToRgb(hex: string) { const c = hex.replace('#',''); const v = parseInt(c,16); return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 }; }
}
