import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionModalComponent } from './question-modal.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('QuestionModalComponent', () => {
    let component: QuestionModalComponent;
    let fixture: ComponentFixture<QuestionModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QuestionModalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionModalComponent);
        component = fixture.componentInstance;
        component.question = { key: 'test_q', text: 'Test Question' };
        component.answer = null;

        // Enable auto-detect changes to avoid NG0100 when modifying inputs
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the question text', () => {
        const pEl = fixture.nativeElement.querySelector('.question');
        expect(pEl.textContent).toContain('Test Question');
    });

    it('should render 7 radio inputs', () => {
        const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
        expect(inputs.length).toBe(7);
    });

    it('should emit answerChange when an answer is selected via method', () => {
        const emitSpy = vi.spyOn(component.answerChange, 'emit');
        component.selectAnswer(2);
        expect(emitSpy).toHaveBeenCalledWith(2);
    });

    it('should mark the correct answer as selected', async () => {
        // In Angular testing, to update an input and trigger the lifecycle properly without NG0100
        fixture.componentRef.setInput('answer', 1);
        fixture.detectChanges();

        // Check the selected class is on the span
        const selectedSpan = fixture.nativeElement.querySelector('span.selected');
        expect(selectedSpan).toBeTruthy();
        expect(selectedSpan.textContent).toContain('+1');
    });

    it('should select an answer when clicking the UI', () => {
        const emitSpy = vi.spyOn(component.answerChange, 'emit');

        // Find the input for value 2
        const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
        // Values are -3, -2, -1, 0, 1, 2, 3
        // Index for value 2 is 5
        const radioForTwo = inputs[5];

        // Trigger change event directly
        radioForTwo.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(component.answer).toBe(2);
        expect(emitSpy).toHaveBeenCalledWith(2);

        const selectedSpan = fixture.nativeElement.querySelector('span.selected');
        expect(selectedSpan).toBeTruthy();
        expect(selectedSpan.textContent).toContain('+2');
    });
});
