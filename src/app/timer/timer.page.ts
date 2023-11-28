import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  slots = [
    { type: 'fast', duration: 16, end: 16 },
    { type: 'feast', duration: 8, end: 24 },
    { type: 'fast', duration: 20, end: 44 },
    { type: 'feast', duration: 4, end: 48 },
    { type: 'fast', duration: 36, end: 84 },
    { type: 'feast', duration: 12, end: 96 },
    { type: 'fast', duration: 16, end: 112 },
    { type: 'feast', duration: 8, end: 120 },
    { type: 'fast', duration: 20, end: 140 },
    { type: 'feast', duration: 4, end: 144 },
  ];

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
        this.sessions.unshift({
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

  hoursSinceSpecificTime(targetDay: string, targetTime: string) {
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const currentDateTime = new Date();
    const currentDay = currentDateTime
      .toLocaleString('en-us', { weekday: 'long' })
      .toLowerCase();
    const currentTime =
      currentDateTime.getHours() * 60 + currentDateTime.getMinutes(); // Convert to minutes for easy comparison

    const targetDayIndex = daysOfWeek.indexOf(targetDay.toLowerCase());
    const currentDayIndex = daysOfWeek.indexOf(currentDay);

    if (targetDayIndex === -1) {
      return 'Invalid target day';
    }

    const daysDifference = (currentDayIndex - targetDayIndex + 7) % 7;
    const minutesSinceTargetTime = currentTime - this.parseTime(targetTime);
    const hoursSinceTargetTime =
      daysDifference * 24 + minutesSinceTargetTime / 60;

    return hoursSinceTargetTime;
  }

  // Function to parse time in HH:mm format and convert it to minutes
  parseTime(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getSlot(slots: any) {
    const targetDay = 'Sunday';
    const targetTime = '20:00';
    
    const hoursSince = this.hoursSinceSpecificTime(targetDay, targetTime);
    
    for (let index = 0; index < slots.length; index++) {
      const element = slots[index];
      if (hoursSince < element.end) {
        return element.type;
      }
    }
  }
}
