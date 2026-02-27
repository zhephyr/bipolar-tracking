import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckInService } from '../../services/check-in.service';
import { CheckIn } from '../../models/check-in.model';

import { LandscapeComponent } from './landscape/landscape.component';
import { QuestionModalComponent } from './question-modal/question-modal.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
  imports: [CommonModule, LandscapeComponent, QuestionModalComponent],
  standalone: true
})
export class QuestionsComponent implements OnInit {
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
  answers: (number | null)[] = new Array(7).fill(null);
  submitted = false;
  justSaved = false;
  hasExistingData = false;
  today = new Date();

  constructor(private checkInService: CheckInService) { }

  get progress(): number {
    return this.questions.length > 1 ? this.current / (this.questions.length - 1) : 0;
  }

  ngOnInit(): void {
    this.loadTodayCheckIns();
  }

  loadTodayCheckIns(): void {
    this.checkInService.getCheckIns(1).subscribe({
      next: (checkIns) => {
        if (checkIns && checkIns.length > 0) {
          // Normalize today to UTC midnight for comparison
          const todayUTC = new Date(this.today);
          todayUTC.setUTCHours(0, 0, 0, 0);
          const todayUTCString = todayUTC.toISOString().split('T')[0]; // Just the date part YYYY-MM-DD

          const todayCheckIns = checkIns.filter(ci => {
            const ciDate = new Date(ci.date);
            const ciDateString = ciDate.toISOString().split('T')[0];
            const isSameDay = ciDateString === todayUTCString;
            return isSameDay;
          });

          if (todayCheckIns.length > 0) {
            this.hasExistingData = true;
            todayCheckIns.forEach(ci => {
              const index = this.questions.findIndex(q => q.key === ci.questionId);
              if (index >= 0 && index < this.answers.length) {
                this.answers[index] = ci.answer;
              }
            });
            this.answer = this.answers[this.current];
            // Don't mark as submitted when just loading existing data
            // User can still update their answers
          }
        }
      },
      error: (err) => console.error('Error loading check-ins:', err)
    });
  }

  next(): void {
    if (this.answer !== null) {
      this.answers[this.current] = this.answer;
    }
    if (this.current < this.questions.length - 1) {
      this.current++;
      this.answer = this.answers[this.current];
    }
  }

  prev(): void {
    if (this.answer !== null) {
      this.answers[this.current] = this.answer;
    }
    if (this.current > 0) {
      this.current--;
      this.answer = this.answers[this.current];
    }
  }

  goToQuestion(index: number): void {
    if (this.answer !== null) {
      this.answers[this.current] = this.answer;
    }
    this.current = index;
    this.answer = this.answers[this.current];
  }

  selectAnswer(value: number): void {
    this.answer = value;
    this.answers[this.current] = value;
    // Reset justSaved flag when user changes an answer
    this.justSaved = false;
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (this.answer !== null) {
      this.answers[this.current] = this.answer;
    }
    this.next();
  }

  isComplete(): boolean {
    return this.answers.every(a => a !== null);
  }

  saveAll(): void {
    if (!this.isComplete()) return;

    // Normalize to start of day (midnight UTC)
    const todayStart = new Date(this.today);
    todayStart.setUTCHours(0, 0, 0, 0);

    const checkIns: CheckIn[] = this.questions.map((q, index) => ({
      date: todayStart.toISOString(),
      questionId: q.key,
      answer: this.answers[index]!
    }));

    this.checkInService.saveMultipleCheckIns(checkIns).subscribe({
      next: () => {
        this.submitted = true;
        this.justSaved = true;
      },
      error: (err) => console.error('Error saving check-ins:', err)
    });
  }

  reset(): void {
    this.current = 0;
    this.answer = null;
    this.answers = new Array(7).fill(null);
    this.submitted = false;
    this.justSaved = false;
    this.hasExistingData = false;
    this.today = new Date();
    this.loadTodayCheckIns();
  }

}
