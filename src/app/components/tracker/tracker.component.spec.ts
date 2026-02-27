import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TrackerComponent } from './tracker.component';

describe('TrackerComponent', () => {
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // Standalone component goes in imports
            imports: [TrackerComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideCharts(withDefaultRegisterables())
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    it('should create the component', () => {
        const fixture = TestBed.createComponent(TrackerComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should have initial chart data with empty labels', () => {
        const fixture = TestBed.createComponent(TrackerComponent);
        const component = fixture.componentInstance;
        expect(component.overallChartData.labels).toEqual([]);
        expect(component.sleepChartData.labels).toEqual([]);
    });

    it('should have 6 datasets in overallChartData', () => {
        const fixture = TestBed.createComponent(TrackerComponent);
        const component = fixture.componentInstance;
        expect(component.overallChartData.datasets.length).toBe(6);
    });

    it('should have 2 datasets in sleepChartData', () => {
        const fixture = TestBed.createComponent(TrackerComponent);
        const component = fixture.componentInstance;
        expect(component.sleepChartData.datasets.length).toBe(2);
    });

    it('should have chart options with y-axis range [-3, 3]', () => {
        const fixture = TestBed.createComponent(TrackerComponent);
        const component = fixture.componentInstance;
        const scales = component.chartOptions?.scales as any;
        expect(scales?.y?.min).toBe(-3);
        expect(scales?.y?.max).toBe(3);
    });

    it('should call CheckInService.getCheckIns on init', () => {
        const fixture = TestBed.createComponent(TrackerComponent);
        const component = fixture.componentInstance;

        // Call ngOnInit directly (avoids detectChanges which triggers chart rendering
        // that fails in jsdom since <canvas> context is unavailable)
        component.ngOnInit();

        // Verify the HTTP call was made
        const req = httpTesting.expectOne('http://localhost:5222/api/checkins?days=30');
        expect(req.request.method).toBe('GET');

        // Flush with mock data
        req.flush([
            { id: 1, date: '2026-02-27T00:00:00Z', questionId: 'sleep_quality', answer: 2 },
            { id: 2, date: '2026-02-27T00:00:00Z', questionId: 'energy_level', answer: 1 }
        ]);

        // After data is loaded, labels should be populated
        expect(component.overallChartData.labels!.length).toBeGreaterThan(0);
    });
});
