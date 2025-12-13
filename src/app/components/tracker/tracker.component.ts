import { Component } from '@angular/core';

@Component({
  selector: 'app-tracker',
  template: `
    <div class="tracker-container">
      <h1>Tracker</h1>
      <p>Coming soon...</p>
    </div>
  `,
  styles: [`
    .tracker-container {
      padding: 40px;
      background: #3a3a3a;
      min-height: 100vh;
      color: #e0e0e0;
    }
    
    h1 {
      font-size: 36px;
      margin-bottom: 20px;
      color: #fff;
    }
  `]
})
export class TrackerComponent {
}
