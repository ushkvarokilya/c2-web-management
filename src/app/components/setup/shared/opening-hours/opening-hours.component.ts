import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ToggleComponent } from "../../../shared/toggle/toggle.component";
import * as moment from "moment";

@Component({
  selector: 'app-opening-hours',
  templateUrl: './opening-hours.component.html',
  styleUrls: ['./opening-hours.component.scss']
})
export class OpeningHoursComponent implements OnInit {

  @Input() includeAlwaysOpen: boolean = false

  private _activityMode: ActivityMode = ActivityMode.weeklySchedule
  @Input()
  get activityMode(): ActivityMode {
    return this._activityMode
  }
  set activityMode(value: ActivityMode) {
    this._activityMode = value
    this.activityModeChange.emit(value)
    this.generateOpeningHours()
  }
  @Output() activityModeChange = new EventEmitter<ActivityMode>()

  private _openingHours: OpeningHour[]
  @Input()
  get openingHours(): OpeningHour[] {
    return this._openingHours
  }
  set openingHours(value: OpeningHour[]) {
    this._openingHours = value
    this.openingHoursChange.emit(value)
    this.reflectDataOnForms()
  }
  @Output() openingHoursChange = new EventEmitter<OpeningHour[]>()

  dailyOpeningHours: InternalOpeningHours[]
  weeklyOpeningHours: InternalWeeklyOpeningHours

  ActivityMode = ActivityMode //include enum as class field

  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  hours: string[] = []
  minutes: number[] = []

  constructor() {
    for (let i = 1; i <= 24; i++) {
      if (i > 12) {
        this.hours.push((i - 12) + ' PM')
      } else {
        this.hours.push((i) + ' AM')
      }
    }
    for (let i = 0; i <= 59; i++) {
      this.minutes.push(i)
    }
    this.weeklyOpeningHours = {
      fromDay: this.days[0],
      toDay: this.days[1],
      fromHour: this.hours[0],
      fromMinute: this.minutes[0],
      toHour: this.hours[1],
      toMinute: this.minutes[1]
    }
    this.dailyOpeningHours = this.days.map(day => ({
      on: true,
      day,
      fromHour: this.hours[0],
      fromMinute: this.minutes[0],
      toHour: this.hours[1],
      toMinute: this.minutes[2]
    }))
  }

  ngOnInit() {
  }

  reflectDataOnForms() {
    if (!this.openingHours) {
      return
    }
    switch (this.activityMode) {
      case ActivityMode.weeklySchedule:
        this.reflectOnWeeklyForm()
        break
      case ActivityMode.dailySchedule:
        this.reflectOnDailyForm()
        break
    }
  }

  private reflectOnWeeklyForm() {
    this.openingHours.sort(o => -o.day)
    this.weeklyOpeningHours = {
      fromDay: this.fromDayNumToString(this.openingHours[0].day),
      toDay: this.fromDayNumToString(this.openingHours[this.openingHours.length - 1].day),
      fromHour: this.fromFullHourToAMPM(this.openingHours[0].fromHour),
      fromMinute: this.openingHours[0].fromMinute,
      toHour: this.fromFullHourToAMPM(this.openingHours[0].toHour),
      toMinute: this.openingHours[0].toMinute
    }
  }

  private reflectOnDailyForm() {
    this.dailyOpeningHours = this.dailyOpeningHours.map(day => {
      let currentDay = this.openingHours.find(d => d.day === this.fromDayStringToNumber(day.day))
      return {
        on:  currentDay != null,
        day: currentDay ? this.fromDayNumToString(currentDay.day) : day.day,
        fromHour: currentDay ? this.fromFullHourToAMPM(currentDay.fromHour) : day.fromHour,
        fromMinute: currentDay ? currentDay.fromMinute : day.fromMinute,
        toHour: currentDay ? this.fromFullHourToAMPM(currentDay.toHour) : day.toHour,
        toMinute: currentDay ? currentDay.toMinute : day.toMinute
      }
    })
  }

  private fromDayNumToString(day: number): string {
    return moment().day(day - 1).format("dddd")
  }

  private fromFullHourToAMPM(hour: number) {
    return moment(hour, "H").format("h A")
  }

  generateOpeningHours() {
    switch (this.activityMode) {
      case ActivityMode.alwaysOpen:
      this.openingHours = this.generateAlwaysOpenOpeningHours()
      break
      case ActivityMode.weeklySchedule:
      this.openingHours = this.generateOpeneingHoursFromWeeklyForm()
      break
      case ActivityMode.dailySchedule:
      setTimeout(() => {
          this.openingHours = this.generateOpeningHoursFromDailyForm()
        }, 100)
        break
    }
  }

  private generateAlwaysOpenOpeningHours() {
    return Array(7).fill(1).map((e, i) => {
      return {
        day: i + 1,
        fromHour: 0,
        fromMinute: 0,
        toHour: 23,
        toMinute: 59
      }
    })
  }

  private generateOpeneingHoursFromWeeklyForm(): OpeningHour[] {

    let dayFromMoment = moment(this.weeklyOpeningHours.fromDay, 'dddd')
    let dayToMoment = moment(this.weeklyOpeningHours.toDay, 'dddd')

    let fromHour = this.fromAMPMToNum(this.weeklyOpeningHours.fromHour)
    let fromMinute = this.weeklyOpeningHours.fromMinute
    let toHour = this.fromAMPMToNum(this.weeklyOpeningHours.toHour)
    let toMinute = this.weeklyOpeningHours.toMinute

    let openingHours: OpeningHour[] = []
    while (dayFromMoment.day() !== dayToMoment.day()) {
      openingHours.push({
        day: dayFromMoment.day() + 1,
        fromHour,
        fromMinute,
        toHour,
        toMinute
      })
      dayFromMoment.add(1, 'day')
    }
    openingHours.push({
      day: dayToMoment.day() + 1,
      fromHour,
      fromMinute,
      toHour,
      toMinute
    })
    return openingHours
  }

  private generateOpeningHoursFromDailyForm(): OpeningHour[] {
    let openingHours: OpeningHour[] = []
    this.dailyOpeningHours.forEach((day, index) => {
      if (day.on) {
        openingHours.push({
          day: this.fromDayStringToNumber(day.day),
          fromHour: this.fromAMPMToNum(day.fromHour),
          fromMinute: day.fromMinute,
          toHour: this.fromAMPMToNum(day.toHour),
          toMinute: day.toMinute,
        })
      }
    })
    return openingHours
  }

  private fromDayStringToNumber(day: string) {
    return moment(day, 'dddd').day() + 1
  }

  private fromAMPMToNum(ampm: string): number {
    return +moment(ampm, 'hh A').format('H')
  }

}

export enum ActivityMode {
  alwaysOpen = "always_open",
  weeklySchedule = "weekly_schedule",
  dailySchedule = "daily_schedule"
}

export interface OpeningHour {
  day: number
  fromHour: number
  fromMinute: number
  toHour: number
  toMinute: number
}

interface InternalOpeningHours {
  on: boolean
  day: string
  fromHour: string
  fromMinute: number
  toHour: string
  toMinute: number
}

interface InternalWeeklyOpeningHours {
  fromDay: string,
  toDay: string,
  fromHour: string,
  fromMinute: number
  toHour: string
  toMinute: number
}