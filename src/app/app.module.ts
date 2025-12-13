import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { JournalComponent } from './components/journal/journal.component';
import { TrackerComponent } from './components/tracker/tracker.component';

@NgModule({
  declarations: [
    AppComponent,
    JournalComponent,
    TrackerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
