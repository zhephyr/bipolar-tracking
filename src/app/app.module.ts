import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { JournalComponent } from './components/journal/journal.component';
import { TrackerComponent } from './components/tracker/tracker.component';
// ng2-charts v8 requires provideCharts to register chart.js components
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@NgModule({
    // Standalone components go in imports, not declarations
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppComponent,
        JournalComponent,
        TrackerComponent
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        // Register all default chart.js components (scales, plugins, etc.)
        provideCharts(withDefaultRegisterables())
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
