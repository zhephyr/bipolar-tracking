import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <nav class="sidenav" [class.collapsed]="navCollapsed">
        <button class="toggle-btn" (click)="navCollapsed = !navCollapsed">
          @if (navCollapsed) {
            <span>☰</span>
          }
          @if (!navCollapsed) {
            <span>✕</span>
          }
        </button>
    
        @if (!navCollapsed) {
          <div class="nav-content">
            <a routerLink="/journal" routerLinkActive="active" class="nav-link">
              <span class="icon">📔</span>
              <span class="label">Journal</span>
            </a>
            <a routerLink="/tracker" routerLinkActive="active" class="nav-link">
              <span class="icon">📊</span>
              <span class="label">Tracker</span>
            </a>
          </div>
        }
      </nav>
    
      <main class="main-content" [class.expanded]="navCollapsed">
        <router-outlet></router-outlet>
      </main>
    </div>
    `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    
    .sidenav {
      position: relative;
      background: #2a2a2a;
      border-right: 1px solid rgba(0,0,0,0.3);
      box-shadow: 2px 0 8px rgba(0,0,0,0.3);
      transition: width 300ms ease-out;
      width: 220px;
      z-index: 1000;
    }
    
    .sidenav.collapsed {
      width: 60px;
    }
    
    .toggle-btn {
      position: absolute;
      top: 20px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #aaa;
      transition: color 200ms;
      padding: 5px;
    }
    
    .toggle-btn:hover {
      color: #fff;
    }
    
    .nav-content {
      margin-top: 80px;
      padding: 0 10px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      margin: 8px 0;
      border-radius: 10px;
      text-decoration: none;
      color: #aaa;
      transition: all 200ms ease-out;
      font-size: 16px;
      font-weight: 500;
    }
    
    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    
    .nav-link.active {
      background: rgba(100,150,200,0.3);
      color: #6eb3ff;
    }
    
    .nav-link .icon {
      font-size: 20px;
      margin-right: 12px;
    }
    
    .main-content {
      flex: 1;
      overflow: auto;
      transition: margin-left 300ms ease-out;
    }
    
    .main-content.expanded {
      margin-left: 0;
    }
  `],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class AppComponent {
  navCollapsed = true;
}
