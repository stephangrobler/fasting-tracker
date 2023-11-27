import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription, interval } from 'rxjs';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonButton,
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonCardContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
  ],
})
export class TimerPage implements OnInit {
  start: Date | null = null;
  end: Date | null = null;
  elapsedTime: number = 0;
  timeSubscription: Subscription | null = null;
  isRunning = false;
  sessions: [{ start: Date; end: Date; elapsedTime: number }?] = [];

  constructor() {}

  ngOnInit() {
    this.retrieveSessions();
    this.retrieveActiveSession();
  }

  onStart() {
    if (!this.isRunning) {
      this.start = new Date();
      this.timeSubscription = interval(1000).subscribe((time) => {
        if (this.start) {
          this.elapsedTime = new Date().getTime() - this.start?.getTime();
        }
      });
      this.isRunning = true;
      this.persistActiveSession({
        start: this.start,
        end: null,
        elapsedTime: 0,
      });
    }
  }

  onEnd() {
    if (this.isRunning) {
      this.end = new Date();
      if (this.start) {
        this.sessions.push({
          start: this.start,
          end: this.end,
          elapsedTime: this.elapsedTime,
        });
        this.persistSessions(this.sessions);
      }
      this.timeSubscription?.unsubscribe();
      this.elapsedTime = 0;
      this.isRunning = false;
      localStorage.removeItem('active-fasting-session');
    }
  }

  calculateDiff(start: Date, end: Date) {
    return end.getUTCDate() - start.getUTCDate();
  }

  formatElapsedTime(elapsedTime: number): string {
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);

    const pad = (num: number): string => (num < 10 ? '0' : '') + num;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  persistSessions(sessions: any) {
    localStorage.setItem('fasting-sessions', JSON.stringify(this.sessions));
  }

  retrieveSessions() {
    if (localStorage.getItem('fasting-sessions')) {
      this.sessions = JSON.parse(localStorage.getItem('fasting-sessions')!);
    } else {
      localStorage.setItem('fasting-sessions', JSON.stringify([]));
    }
  }

  persistActiveSession(session: any) {
    localStorage.setItem('active-fasting-session', JSON.stringify(session));
  }

  retrieveActiveSession() {
    if (localStorage.getItem('active-fasting-session')) {
      const session: { start: Date; end: Date; elapsedTime: number } =
        JSON.parse(localStorage.getItem('active-fasting-session')!);
      console.log(session);
      if (session?.start) {
        this.start = new Date(session.start);
        this.timeSubscription = interval(1000).subscribe((time) => {
          if (this.start) {
            this.elapsedTime = new Date().getTime() - this.start?.getTime();
          }
        });
        this.isRunning = true;
      }
    }
  }
}
