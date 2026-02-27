import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CheckInService } from './check-in.service';
import { CheckIn } from '../models/check-in.model';

describe('CheckInService', () => {
    let service: CheckInService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });

        service = TestBed.inject(CheckInService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch check-ins', () => {
        const mockCheckIns: CheckIn[] = [
            { id: 1, date: '2026-02-27T00:00:00Z', questionId: 'sleep_quality', answer: 2 }
        ];

        // Subscribe to the observable
        service.getCheckIns(30).subscribe(checkIns => {
            expect(checkIns).toEqual(mockCheckIns);
        });

        // Expect a single GET request to the check-ins API
        const req = httpTesting.expectOne('http://localhost:5222/api/checkins?days=30');
        expect(req.request.method).toBe('GET');

        // Respond with mock data
        req.flush(mockCheckIns);
    });

    it('should fetch check-ins with a custom day count', () => {
        service.getCheckIns(7).subscribe();

        const req = httpTesting.expectOne('http://localhost:5222/api/checkins?days=7');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should save a single check-in', () => {
        const newCheckIn: CheckIn = {
            date: '2026-02-27T00:00:00Z',
            questionId: 'energy_level',
            answer: 1
        };

        service.saveCheckIn(newCheckIn).subscribe(result => {
            expect(result).toEqual({ ...newCheckIn, id: 5 });
        });

        const req = httpTesting.expectOne('http://localhost:5222/api/checkins');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newCheckIn);

        req.flush({ ...newCheckIn, id: 5 });
    });

    it('should save multiple check-ins using forkJoin', () => {
        const checkIns: CheckIn[] = [
            { date: '2026-02-27T00:00:00Z', questionId: 'sleep_quality', answer: 2 },
            { date: '2026-02-27T00:00:00Z', questionId: 'energy_level', answer: -1 }
        ];

        service.saveMultipleCheckIns(checkIns).subscribe(results => {
            expect(results.length).toBe(2);
        });

        // Expect two POST requests (one per check-in)
        const reqs = httpTesting.match('http://localhost:5222/api/checkins');
        expect(reqs.length).toBe(2);

        reqs[0].flush({ ...checkIns[0], id: 10 });
        reqs[1].flush({ ...checkIns[1], id: 11 });
    });
});
