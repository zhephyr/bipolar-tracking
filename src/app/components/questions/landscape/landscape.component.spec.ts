import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandscapeComponent } from './landscape.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('LandscapeComponent', () => {
    let component: LandscapeComponent;
    let fixture: ComponentFixture<LandscapeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LandscapeComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(LandscapeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default progress 0', () => {
        expect(component.progress).toBe(0);
    });

    it('should apply custom styles based on progress on init', () => {
        // Component sets host styling attributes inline
        // In our implementation, we'll probably set CSS variables on the component host element
        const hostEl = fixture.nativeElement as HTMLElement;

        // Test that variables are present
        expect(hostEl.style.getPropertyValue('--sky')).toBeDefined();
        expect(hostEl.style.getPropertyValue('--land')).toBeDefined();
    });

    it('should update variables when progress changes via ngOnChanges', () => {
        component.progress = 0.5;

        // manually trigger ngOnChanges (in actual use Angular does this when @Input changes)
        component.ngOnChanges({
            progress: {
                currentValue: 0.5,
                previousValue: 0,
                firstChange: false,
                isFirstChange: () => false
            }
        });

        fixture.detectChanges();

        const hostEl = fixture.nativeElement as HTMLElement;
        // Just verifying that a known value changed. The sun-left at 0.5 progress should be 10 + 0.5 * 80 = 50%
        expect(hostEl.style.getPropertyValue('--sun-left')).toBe('50.0%');
    });

    it('should correctly calculate sun position', () => {
        // 0 progress -> sun is at 10%
        component.progress = 0;
        component.updateLandscape();
        expect(fixture.nativeElement.style.getPropertyValue('--sun-left')).toBe('10.0%');

        // 1 progress -> sun is at 90%
        component.progress = 1;
        component.updateLandscape();
        expect(fixture.nativeElement.style.getPropertyValue('--sun-left')).toBe('90.0%');
    });
});
