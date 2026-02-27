import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-question-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './question-modal.component.html',
    styleUrls: ['./question-modal.component.css']
})
export class QuestionModalComponent {
    @Input() question!: { key: string, text: string };
    @Input() answer: number | null = null;
    @Input() index: number = 0; // helpful for unique IDs

    @Output() answerChange = new EventEmitter<number>();

    selectAnswer(value: number): void {
        this.answer = value;
        this.answerChange.emit(value);
    }
}
