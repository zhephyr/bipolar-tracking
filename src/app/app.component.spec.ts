import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // Standalone components go in imports, not declarations
            imports: [AppComponent, RouterModule.forRoot([])],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should start with nav collapsed', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.navCollapsed).toBe(true);
    });

    it('should toggle navCollapsed', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.navCollapsed = !app.navCollapsed;
        expect(app.navCollapsed).toBe(false);
        app.navCollapsed = !app.navCollapsed;
        expect(app.navCollapsed).toBe(true);
    });
});
