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
      <div class="tree" aria-hidden="true">
        <svg class="bush" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="25" cy="35" rx="20" ry="15"/>
          <ellipse cx="45" cy="25" rx="25" ry="20"/>
          <ellipse cx="70" cy="30" rx="20" ry="15"/>
        </svg>
      </div>

      <form class="question-form" (submit)="onSubmit($event)">
        <h1>Daily Check-In</h1>
        <p class="question">{{ questions[current].text }}</p>

        <div class="controls">
          <label *ngFor="let v of [-3,-2,-1,0,1,2,3]">
            <input type="radio" name="answer" [value]="v" (change)="answer=v" hidden> 
            <span [class]="v > 0 ? 'positive' : v < 0 ? 'negative' : 'zero'">{{v > 0 ? '+' + v : v}}</span>
          </label>
        </div>

        <div class="nav">
          <button type="button" (click)="prev()" [disabled]="current===0">Back</button>
          <button type="button" (click)="next()">Next</button>
        </div>
        <div class="pagination">
          <span *ngFor="let q of questions; let i = index" 
                class="dot" 
                [class.active]="i === current"
                (click)="current = i; answer = null; updateLandscape()"></span>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  questions = [
    { key: 'sleep_quality', text: 'How did you sleep? Quality over quantity.' },
    { key: 'energy_level', text: 'How were your energy levels today?' },
    { key: 'mental_clarity', text: 'How was your mental clarity?' },
    { key: 'sensitivity', text: 'How sensitive were you today?' },
    { key: 'impulsivity', text: 'How in-control were you today?' },
    { key: 'self_perception', text: 'How did you feel about yourself today?' },
    { key: 'sleep_readiness', text: 'Are you ready for bed?' }
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

    const sky = this.interpolate(['#B8A59D','#FFE4C9','#B8D8E8','#B8D8F0','#A8C8E8','#C8B8E0','#4A5A68'], progress);
    const land = this.interpolate(['#8B8570','#F0E8C0','#C8DDB0','#B8D8B0','#B8D8A8','#B0C8A8','#4A5A50'], progress);
    const treeColor = this.interpolate(['#6A7A5A','#8AAA7A','#8AAA7A','#8AAA7A','#8AAA7A','#7A9A6A','#4A5A4A'], progress);
    const bushColor = this.interpolate(['#5A6A4A','#7A9A6A','#7A9A6A','#7A9A6A','#7A9A6A','#6A8A5A','#3A4A3A'], progress);

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
    

    // Set light text for question 7
    const textColor = this.current === 6 ? 'rgba(255,255,255,0.9)' : 'rgba(90,106,122,1)';
    const headingColor = this.current === 6 ? 'rgba(255,255,255,0.95)' : 'rgba(106,122,138,1)';
    
    const root = document.documentElement;
    root.style.setProperty('--sky', sky);
    root.style.setProperty('--land', land);
    root.style.setProperty('--sun-left', sunLeft);
    root.style.setProperty('--sun-top', sunTop);
    root.style.setProperty('--moon-left', moonLeft);
    root.style.setProperty('--moon-top', moonTop);
    root.style.setProperty('--stars-opacity', String(night));
    root.style.setProperty('--moon-opacity', String(moonOpacity));
    root.style.setProperty('--text-color', textColor);
    root.style.setProperty('--heading-color', headingColor);
    root.style.setProperty('--tree-color', treeColor);
    root.style.setProperty('--bush-color', bushColor);

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
