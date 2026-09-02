import { describe, expect, it } from 'vitest'
import {
  getVisibleWeekTimeRange,
  getWeekDates,
  getWorkWeekScrollTop,
} from './CrmCalendarTab'
import { getWeekActivityCardMeta } from './CrmCalendarTab.utils'

describe('getWeekDates', () => {
  it('returns Monday to Sunday for work week view', () => {
    expect(getWeekDates(new Date('2026-05-04T12:00:00'))).toEqual([
      '2026-05-04',
      '2026-05-05',
      '2026-05-06',
      '2026-05-07',
      '2026-05-08',
      '2026-05-09',
      '2026-05-10',
    ])
  })

  it('keeps local calendar dates without UTC serialization', () => {
    expect(getWeekDates(new Date(2026, 4, 4, 0, 0))[0]).toBe('2026-05-04')
  })
})

describe('getVisibleWeekTimeRange', () => {
  it('uses work hours when there are no timed activities outside them', () => {
    expect(getVisibleWeekTimeRange({ start: 9, end: 18 }, [
      { planned_time: '10:30', duration: 45 },
      { planned_time: '17:00', duration: 60 },
    ])).toEqual({
      start: 9,
      end: 18,
      hours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    })
  })

  it('extends to earlier non-working time only when an activity is planned there', () => {
    expect(getVisibleWeekTimeRange({ start: 9, end: 18 }, [
      { planned_time: '07:30', duration: 30 },
    ])).toEqual({
      start: 7,
      end: 18,
      hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    })
  })

  it('extends to later non-working time only when an activity is planned there', () => {
    expect(getVisibleWeekTimeRange({ start: 9, end: 18 }, [
      { planned_time: '19:15', duration: 90 },
    ])).toEqual({
      start: 9,
      end: 21,
      hours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    })
  })
})

describe('getWorkWeekScrollTop', () => {
  it('does not scroll past the grid when working hours fit into the viewport', () => {
    expect(getWorkWeekScrollTop(
      { start: 9, end: 18 },
      { start: 9, end: 18 },
      660,
      648,
    )).toBe(0)
  })

  it('scrolls to the working day start when earlier planned time expands the grid', () => {
    expect(getWorkWeekScrollTop(
      { start: 9, end: 18 },
      { start: 7, end: 18 },
      360,
      792,
    )).toBe(144)
  })

  it('clamps desired scroll to the maximum available scroll distance', () => {
    expect(getWorkWeekScrollTop(
      { start: 9, end: 18 },
      { start: 0, end: 10 },
      600,
      720,
    )).toBe(120)
  })
})

describe('getWeekActivityCardMeta', () => {
  it('keeps planned action details visible for week cards', () => {
    expect(getWeekActivityCardMeta({
      title: 'Позвонить клиенту',
      status: 'planned',
      planned_time: '09:30:00',
      duration: 30,
      customer_name: 'Тест1',
      service_name: 'CRMLight',
    })).toEqual({
      title: 'Позвонить клиенту',
      statusLabel: 'Запланировано',
      plannedTime: '09:30',
      durationLabel: '30м',
      customerName: 'Тест1',
      serviceName: 'CRMLight',
    })
  })

  it('falls back to planned status for activities without an explicit status', () => {
    expect(getWeekActivityCardMeta({ title: 'Уточнить детали' }).statusLabel).toBe('Запланировано')
  })
})
