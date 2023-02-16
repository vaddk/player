<script lang="ts" setup>
import { computed, ref } from 'vue'

// @ts-expect-error no types provided
import { DatePicker } from '@vaddk/calendar'

import type { Moment } from 'moment'
import moment from '../../scripts/moment'

import { usePanel } from '../../stores/panel'
import { useArchive } from '../../stores/archive'

const panel = usePanel()
const archive = useArchive()

const calendarDate = computed({
  get() { return panel.calendar.date },
  set(value) { panel.calendar.date = value },
})
const currentDate = computed<Moment>(() => moment(archive.date.current).utcOffset(archive.date.offset))

const timezones = ref([
  'UTC',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Moscow',
  'Indian/Mahe',
  'Asia/Ashgabat',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Hong_Kong',
  'Asia/Pyongyang',
  'Australia/Sydney',
  'Asia/Magadan',
])
const currentTz = ref<number>(Math.round(archive.date.offset / 60))

function displayCalendar(togglePopover: Function) {
  if (archive.camera.blocked) return false
  togglePopover()
}
</script>

<template>
  <div class="calendar-block">
    <DatePicker
      v-model="calendarDate"
      mode="dateTime"
      is24hr
      is-dark
      trim-weeks
      confirm-date
      :min-date="archive.date.start"
      :max-date="archive.date.end"
      :timezone="timezones[currentTz]"
      :popover="{ placement: 'top-start' }"
      @confirm="archive.calendarDateChange"
    >
      <template #default="{ togglePopover }">
        <div class="icon-wrapper">
          <span
            class="calendar-icon"
            title="Календарь"
            @click.prevent="displayCalendar(togglePopover)"
          />
        </div>
        <div class="info-wrapper">
          <div
            class="calendar-date-text"
            @click.prevent="displayCalendar(togglePopover)"
          >
            {{ currentDate.format("L") }}
          </div>
          <div
            class="calendar-time-text"
            @click.prevent="displayCalendar(togglePopover)"
          >
            {{ currentDate.format("LTS") }}
          </div>
        </div>
      </template>
    </DatePicker>
  </div>
</template>

<style lang="sass" scoped>
.calendar-block
  position: relative
  display: inline-flex
  align-items: center
  margin-right: auto
  & > div
    display: flex
  .icon-wrapper
    display: inline-block
    margin-right: 10px
    &::after
      left: calc(50% - 14px)
    .calendar-icon
      display: block
      width: 24px
      height: 25px
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='25' viewBox='0 0 24 25' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cg clip-path='url(%23clip0)'%3e%3cpath d='M5.99998 0C5.52658 0 5.14282 0.399745 5.14282 0.892874V2.67857H6.85709V0.892874C6.85709 0.399745 6.47334 0 5.99998 0Z' fill='white'/%3e%3cpath d='M18 0C17.5266 0 17.1428 0.399745 17.1428 0.892874V2.67857H18.8571V0.892874C18.8571 0.399745 18.4734 0 18 0Z' fill='white'/%3e%3cpath d='M21.4286 2.67859H18.8571V6.25003C18.8571 6.74316 18.4734 7.14291 18 7.14291C17.5266 7.14291 17.1428 6.74316 17.1428 6.25003V2.67859H6.85712V6.25003C6.85712 6.74316 6.47337 7.14291 5.99996 7.14291C5.52656 7.14291 5.1428 6.74316 5.1428 6.25003V2.67859H2.57143C1.15127 2.67859 0 3.87782 0 5.35716V22.3215C0 23.8008 1.15127 25 2.57143 25H21.4286C22.8487 25 24 23.8008 24 22.3215V5.35716C24 3.87782 22.8487 2.67859 21.4286 2.67859ZM22.2857 22.3215C22.2857 22.8146 21.9019 23.2143 21.4285 23.2143H2.57143C2.09802 23.2143 1.71427 22.8146 1.71427 22.3215V10.7143H22.2857V22.3215Z' fill='white'/%3e%3cpath d='M6.85713 12.5H5.14286C4.66946 12.5 4.28571 12.8997 4.28571 13.3929C4.28571 13.886 4.66946 14.2858 5.14286 14.2858H6.85713C7.33054 14.2858 7.71429 13.886 7.71429 13.3929C7.71429 12.8997 7.33054 12.5 6.85713 12.5Z' fill='white'/%3e%3cpath d='M12.8571 12.5H11.1429C10.6695 12.5 10.2857 12.8997 10.2857 13.3929C10.2857 13.886 10.6695 14.2858 11.1429 14.2858H12.8571C13.3305 14.2858 13.7143 13.886 13.7143 13.3929C13.7143 12.8997 13.3305 12.5 12.8571 12.5Z' fill='white'/%3e%3cpath d='M18.8571 12.5H17.1429C16.6695 12.5 16.2857 12.8997 16.2857 13.3929C16.2857 13.886 16.6695 14.2858 17.1429 14.2858H18.8571C19.3305 14.2858 19.7143 13.886 19.7143 13.3929C19.7143 12.8997 19.3305 12.5 18.8571 12.5Z' fill='white'/%3e%3cpath d='M6.85713 16.0714H5.14286C4.66946 16.0714 4.28571 16.4712 4.28571 16.9643C4.28571 17.4574 4.66946 17.8572 5.14286 17.8572H6.85713C7.33054 17.8572 7.71429 17.4574 7.71429 16.9643C7.71429 16.4712 7.33054 16.0714 6.85713 16.0714Z' fill='white'/%3e%3cpath d='M12.8571 16.0714H11.1429C10.6695 16.0714 10.2857 16.4712 10.2857 16.9643C10.2857 17.4574 10.6695 17.8572 11.1429 17.8572H12.8571C13.3305 17.8572 13.7143 17.4574 13.7143 16.9643C13.7143 16.4712 13.3305 16.0714 12.8571 16.0714Z' fill='white'/%3e%3cpath d='M18.8571 16.0714H17.1429C16.6695 16.0714 16.2857 16.4712 16.2857 16.9643C16.2857 17.4574 16.6695 17.8572 17.1429 17.8572H18.8571C19.3305 17.8572 19.7143 17.4574 19.7143 16.9643C19.7142 16.4712 19.3305 16.0714 18.8571 16.0714Z' fill='white'/%3e%3cpath d='M6.85713 19.6428H5.14286C4.66946 19.6428 4.28571 20.0426 4.28571 20.5357C4.28571 21.0288 4.66946 21.4285 5.14286 21.4285H6.85713C7.33054 21.4285 7.71429 21.0288 7.71429 20.5356C7.71429 20.0425 7.33054 19.6428 6.85713 19.6428Z' fill='white'/%3e%3cpath d='M12.8571 19.6428H11.1429C10.6695 19.6428 10.2857 20.0426 10.2857 20.5357C10.2857 21.0288 10.6695 21.4286 11.1429 21.4286H12.8571C13.3305 21.4286 13.7143 21.0288 13.7143 20.5357C13.7143 20.0426 13.3305 19.6428 12.8571 19.6428Z' fill='white'/%3e%3cpath d='M18.8571 19.6428H17.1429C16.6695 19.6428 16.2857 20.0426 16.2857 20.5357C16.2857 21.0288 16.6695 21.4286 17.1429 21.4286H18.8571C19.3305 21.4286 19.7143 21.0288 19.7143 20.5357C19.7143 20.0426 19.3305 19.6428 18.8571 19.6428Z' fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath id='clip0'%3e%3crect width='24' height='25' fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: cover
      cursor: pointer
  .info-wrapper
    display: inline-block
    height: 24px
    .calendar-date-text
      font-size: 12px
      line-height: 12px
      color: #FFFFFF
      cursor: pointer
      margin-bottom: 2px
    .calendar-time-text
      min-width: 53px
      font-size: 12px
      line-height: 13px
      color: #CDCDCD
      cursor: pointer
  .calendar-container
    position: absolute
    left: 0
    bottom: 33px
    z-index: 10
:deep(.calendar-container.calendar-is-dark)
  background-color: #403f49
  border-color: #403f49
:deep(.calendar-is-dark .calendar-weekday)
  color: var(--gray-600, #6c757d)
:deep(.calendar-highlight)
  background-color: var(--main-color, #4A77CD)!important
:deep(.calendar-is-dark .calendar-day-content.is-disabled)
  pointer-events: none
:deep(.calendar-confirm button)
  background-color: var(--main-color, #4A77CD)!important
  font-weight: 600
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .calendar-block
      order: 1
      width: 33%
      margin-right: 0
@media (max-width: 400px)
  #player:not(.fullscreen)
    .calendar-block
      .info-wrapper
        .calendar-date-text
          font-size: 11px
          line-height: 11px
        .calendar-time-text
          font-size: 11px
          line-height: 12px
      .icon-wrapper
        margin-right: 8px
        .calendar-icon
          width: 22px
          height: 23px
</style>
