import { Component, Input, OnChanges, SimpleChanges, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-landscape',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './landscape.component.html',
    styleUrls: ['./landscape.component.css'],
})
export class LandscapeComponent implements OnInit, OnChanges {
    @Input() progress: number = 0; // 0 to 1

    constructor(private el: ElementRef) { }

    ngOnInit() {
        this.updateLandscape();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['progress']) {
            this.updateLandscape();
        }
    }

    updateLandscape(): void {
        const progress = this.progress;

        // Sun Path: expands from -10% to 110% to ensure it fully sets below the horizon
        const sunLeftNum = -10 + progress * 120;
        const sunLeft = sunLeftNum.toFixed(1) + '%';
        const sunTop = (75 - Math.sin(Math.PI * progress) * 55).toFixed(1) + '%';

        // Moon Path: starts rising at progress 0.3 and arcs up to the peak (left 50%)
        const moonProgress = Math.max(0, (progress - 0.3) / 0.7);
        // Map moon progress 0->1 to position 10% -> 50%
        const moonLeftNum = 10 + moonProgress * 40;
        const moonLeft = moonLeftNum.toFixed(1) + '%';
        // Map moon top to an arc that peaks when moonProgress is 1
        // We use Math.sin(Math.PI/2 * moonProgress) so it only travels 90 degrees of the sine wave
        const moonTop = (75 - Math.sin((Math.PI / 2) * moonProgress) * 55).toFixed(1) + '%';
        const moonOpacity = progress > 0.2 ? 1 : 0;

        // Dynamic lighting/shadow variables based on dominant light source
        let litXNum = 50;
        let shadowXNum = 0;
        if (progress < 0.6) {
            litXNum = Math.max(0, Math.min(100, sunLeftNum));
            shadowXNum = (50 - sunLeftNum) * 0.4; // Sun left = shadow right
        } else {
            litXNum = Math.max(0, Math.min(100, moonLeftNum));
            shadowXNum = (50 - moonLeftNum) * 0.3; // Softer shadow for moon
        }

        const sky = this.interpolate(['#2A1D3A', '#DE7A52', '#83B6E8', '#5CA3E6', '#E48855', '#4A2B42', '#0A0F1A'], progress);
        const land = this.interpolate(['#1A251A', '#5A6B5A', '#71B954', '#5C9A44', '#4A7A3A', '#1E2A1E', '#0A100A'], progress);
        const treeColor = this.interpolate(['#1E2C1A', '#4C6440', '#5c8449', '#5c8449', '#4C6440', '#1E2C1A', '#0F180F'], progress);
        const bushColor = this.interpolate(['#182314', '#3C5430', '#4c6e3b', '#4c6e3b', '#3C5430', '#182314', '#0A120A'], progress);

        const questionBg = this.interpolate(['#1E2428', '#FFF0E0', '#f4efdf', '#f4efdf', '#FFF0E0', '#221D28', '#0E1114'], progress);
        const textColor = this.interpolate(['#E0E5EA', '#5A6A7A', '#3b4249', '#3b4249', '#5A6A7A', '#D0D5DA', '#EAEFF4'], progress);
        const headingColor = this.interpolate(['#F0F5FA', '#4A5A6A', '#2b3238', '#2b3238', '#4A5A6A', '#DCE1E6', '#F4F9FE'], progress);

        const parseRgb = (s: string) => {
            const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 0, g: 0, b: 0 };
        };

        const mix = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) => {
            return { r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) };
        };

        const toRgbString = (c: { r: number; g: number; b: number }) => `rgb(${c.r}, ${c.g}, ${c.b})`;

        const skyRgb = parseRgb(sky);
        const landRgb = parseRgb(land);

        let skyHorizonMix = 0.08;
        let landHorizonMix = 0.20;
        let landFrontMix = 0.12;

        // We can roughly estimate the middle questions via progress
        if (progress > 0.1 && progress < 0.9) {
            skyHorizonMix = 0.22;
            landHorizonMix = 0.36;
            landFrontMix = 0.22;
        }

        const skyTop = toRgbString(mix(skyRgb, { r: 255, g: 255, b: 255 }, 0.06));
        const skyBottom = toRgbString(mix(skyRgb, { r: 0, g: 0, b: 0 }, 0.12));
        const skyHorizon = toRgbString(mix(skyRgb, { r: 0, g: 0, b: 0 }, skyHorizonMix));

        const landHorizon = toRgbString(mix(landRgb, { r: 255, g: 255, b: 255 }, landHorizonMix));
        const landFront = toRgbString(mix(landRgb, { r: 0, g: 0, b: 0 }, landFrontMix));

        const night = Math.max(0, (progress - 0.7) / 0.3);

        // Apply to the component host instead of documentElement so it doesn't leak
        const root = this.el.nativeElement;

        root.style.setProperty('--sky', sky);
        root.style.setProperty('--land', land);
        root.style.setProperty('--sun-left', sunLeft);
        root.style.setProperty('--sun-top', sunTop);
        root.style.setProperty('--moon-left', moonLeft);
        root.style.setProperty('--moon-top', moonTop);
        root.style.setProperty('--stars-opacity', String(night));
        root.style.setProperty('--moon-opacity', String(moonOpacity));
        root.style.setProperty('--lit-x', litXNum.toFixed(1) + '%');
        root.style.setProperty('--shadow-x', shadowXNum.toFixed(1) + 'px');

        // We map text, bg colors via custom properties so they can be inherited by the parent
        // However, it's safer to apply text colors to document element to style the body/form properly,
        // or we will wrap the QuestionsComponent to inherit these text colors from the root component
        // We append them to the host, and the parent can read them from `--sky`, `--question-bg` etc. if we place them at :root

        // For now we set them on documentElement to preserve original behavior, but ideally we should only scope to host
        const docRoot = document.documentElement;
        docRoot.style.setProperty('--text-color', textColor);
        docRoot.style.setProperty('--heading-color', headingColor);
        docRoot.style.setProperty('--question-bg', questionBg);
        docRoot.style.setProperty('--tree-color', treeColor);
        docRoot.style.setProperty('--bush-color', bushColor);

        docRoot.style.setProperty('--sky-top', skyTop);
        docRoot.style.setProperty('--sky-bottom', skyBottom);
        docRoot.style.setProperty('--sky-horizon', skyHorizon);
        docRoot.style.setProperty('--land-horizon', landHorizon);
        docRoot.style.setProperty('--land-front', landFront);
    }

    private interpolate(stages: string[], t: number): string {
        const n = stages.length;
        const s = Math.min(Math.max(t * (n - 1), 0), n - 1);
        const i = Math.floor(s);
        const f = s - i;
        const a = this.hexToRgb(stages[i]);
        const b = this.hexToRgb(stages[Math.min(i + 1, n - 1)]);
        const r = Math.round(a.r + (b.r - a.r) * f);
        const g = Math.round(a.g + (b.g - a.g) * f);
        const bl = Math.round(a.b + (b.b - a.b) * f);
        return `rgb(${r}, ${g}, ${bl})`;
    }

    private hexToRgb(hex: string) {
        const c = hex.replace('#', '');
        const v = parseInt(c, 16);
        return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
    }
}
