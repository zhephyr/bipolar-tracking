import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { JournalComponent } from './journal.component';

describe('JournalComponent', () => {
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // Standalone component goes in imports
            imports: [JournalComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    it('should create the component', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should have 7 questions', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        expect(component.questions.length).toBe(7);
    });

    it('should start at question 0', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        expect(component.current).toBe(0);
    });

    it('should advance to the next question', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        component.answer = 1;
        component.next();
        expect(component.current).toBe(1);
    });

    it('should go back to the previous question', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        component.answer = 1;
        component.next();
        component.prev();
        expect(component.current).toBe(0);
    });

    it('should not go back past question 0', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        component.prev();
        expect(component.current).toBe(0);
    });

    it('should select an answer', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        component.selectAnswer(2);
        expect(component.answer).toBe(2);
        expect(component.answers[0]).toBe(2);
    });

    it('should report isComplete correctly', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        expect(component.isComplete()).toBe(false);

        // Fill in all answers
        component.answers = [1, 2, -1, 0, 3, -2, 1];
        expect(component.isComplete()).toBe(true);
    });

    it('should navigate to a specific question via goToQuestion', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;
        component.selectAnswer(0);
        component.goToQuestion(4);
        expect(component.current).toBe(4);
    });

    it('should reset component state', () => {
        const fixture = TestBed.createComponent(JournalComponent);
        const component = fixture.componentInstance;

        // Modify some state
        component.current = 3;
        component.answer = 2;
        component.submitted = true;
        component.justSaved = true;

        component.reset();

        expect(component.current).toBe(0);
        expect(component.answer).toBeNull();
        expect(component.submitted).toBe(false);
        expect(component.justSaved).toBe(false);

        // Flush the HTTP request that loadTodayCheckIns makes during reset
        httpTesting.match('http://localhost:5222/api/checkins?days=1').forEach(req => req.flush([]));
    });
});
