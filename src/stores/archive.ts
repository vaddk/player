import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { DataSet } from 'vis-data/esnext'
import moment from '../scripts/moment'

import { useVideo } from './video'
import { usePanel } from './panel'
import { useHls } from './hls'

import type {
  ArchiveDate,
  Camera,
  Fragment,
  Fragments,
  Quality,
  RangeParts,
} from '@/types/archive'

export function numToString(num: number): string {
  if (num === 0) return '00'
  if (num >= 10) return String(num)
  return `0${num}`
}

export const useArchive = defineStore('playerArchive', () => {
  const live = ref<boolean>(true)
  const csrf = ref<string>('')
  const camera: Camera = reactive({
    name: '',
    host: '',
    token: '',
    dToken: '',
    src: '',
    srcType: 'live',
    width: 0,
    height: 0,
    thumbnails: false,
    blocked: false,
    codec: '',
    dvrDepth: 0,
    realTime: 0,
  })
  const quality: Quality = reactive({
    display: false,
    list: [],
    current: 'best',
  })
  const date: ArchiveDate = reactive({
    live: 0,
    start: 0,
    end: 0,
    last: 0,
    current: Date.now(),
    load: 0,
    hour: 0,
    offset: -new Date().getTimezoneOffset(),
    serverOffset: 0,
    url: 0,
  })
  const fragments: Fragments = reactive({
    data: new DataSet({}),
    missing: [],
    motion: [],
    index: 0,
    clear() {
      this.data.clear()
      this.missing.length = 0
      this.motion.length = 0
      this.index = 0
    },
  })

  const previewUrl = computed<string>(() => `${camera.host}/cameras/${camera.name}/preview?token=${camera.token}`)
  // const notSupported = computed<boolean>(() => camera.codec.includes('265') || camera.codec.includes('hevc'))
  const notSupported = computed<boolean>(() => false)

  const video = useVideo()
  const panel = usePanel()
  const hls = useHls()

  function addMainFragments(): void {
    fragments.data?.add([
      {
        id: 1,
        className: 'archive-fragment',
        start: date.start,
        end: date.end,
        type: 'background',
        group: 1,
      }, {
        id: 0,
        className: 'non-processed-fragment',
        start: date.end,
        end: date.live,
        type: 'background',
        group: 1,
      },
    ])
  }
  function updateMainFragments(): void {
    date.live += 1000
    date.end += 1000
    fragments.data?.update([
      {
        id: 0,
        className: 'non-processed-fragment',
        start: date.end,
        end: date.live,
        type: 'background',
      },
      {
        id: 1,
        className: 'archive-fragment',
        start: date.start,
        end: date.end,
        type: 'background',
      },
    ])
  }
  function addMissingFragments(): void {
    if (fragments.missing.length === 0) return
    if (camera.dvrDepth === 0) return

    const lastItem: number = fragments.data?.length ?? 0
    fragments.missing.forEach((item, index) => {
      if (!item.start || !item.end) return

      item.start = +item.start
      item.end = +item.end

      const fragment = {
        start: item.start * 1000,
        end: item.end * 1000,
      }
      if (fragment.start < date.start) fragment.start = date.start
      if (fragment.end > date.end) fragment.end = date.end
      fragments.data?.add({
        id: lastItem + index,
        className: 'missing-fragment',
        start: fragment.start,
        end: fragment.end,
        type: 'background',
        group: 2,
      })
    })
  }
  function addMotionFragments(): void {
    if (fragments.motion.length === 0) return
    if (camera.dvrDepth === 0) return

    const range = {
      start: moment(panel.timeline.range.start).utc(),
      end: moment(panel.timeline.range.end).utc(),
      length: panel.timeline.range.length(),
    }
    if (range.length < panel.timeline.grouping.start) panel.timeline.grouping.join = 0
    else if (range.length > panel.timeline.grouping.end) panel.timeline.grouping.join = 400000
    else panel.timeline.grouping.join = range.length / 100

    const parts: RangeParts = {
      start: {
        year: range.start.year(),
        month: range.start.month() + 1,
        day: range.start.date(),
        hour: range.start.hour(),
        time: range.start.valueOf(),
      },
      end: {
        year: range.end.year(),
        month: range.end.month() + 1,
        day: range.end.date(),
        hour: range.end.hour(),
        time: range.end.valueOf(),
      },
      offset: -(date.offset / 60),
    }
    const motionFragments: any = []
    for (const year in fragments.motion[0]) {
      if (+year < parts.start.year || +year > parts.end.year) continue

      for (const month in fragments.motion[0][year]) {
        if (+year === parts.start.year && +month < parts.start.month) continue
        if (+year === parts.end.year && +month > parts.end.month) continue

        const motionMonth = Object.keys(fragments.motion[0][year][month])
        motionMonth.sort()

        for (const day of motionMonth) {
          if (+month === parts.start.month && +day < parts.start.day) continue
          if (+month === parts.end.month && +day > parts.end.day) continue

          const motionDay = Object.keys(fragments.motion[0][year][month][day])
          motionDay.sort()

          for (const hour of motionDay) {
            if (!fragments.motion[0][year][month][day][hour]) continue
            if (+day === parts.start.day && +hour < parts.start.hour) continue
            if (+day === parts.end.day && +hour > parts.end.hour) continue

            fragments.motion[0][year][month][day][hour].forEach((el: Fragment) => {
              if (!el.start || !el.end) return false
              const item = {
                start: +el.start * 1000,
                end: +el.end * 1000,
              }
              if (item.end - item.start < 0) {
                item.start = +el.end * 1000
                item.end = +el.start * 1000
              }

              if (item.start < date.start) item.start = date.start
              if (item.end > date.end) item.end = date.end

              if (panel.timeline.range.end < item.start || panel.timeline.range.start > item.end) return false
              if (motionFragments.length === 0) {
                motionFragments.push({
                  id: fragments.data?.length + motionFragments.length + 1,
                  className: 'motion-frament',
                  start: item.start,
                  end: item.end,
                  type: 'background',
                  group: 3,
                })
                return false
              }
              const difference = item.end - motionFragments[motionFragments.length - 1].end
              if (difference < 0) return false
              if (difference > panel.timeline.grouping.join) {
                motionFragments.push({
                  id: fragments.data?.length + motionFragments.length + 1,
                  className: 'motion-frament',
                  start: item.start,
                  end: item.end,
                  type: 'background',
                  group: 3,
                })
                return false
              }
              motionFragments[motionFragments.length - 1].end = item.end
            })
          }
        }
      }
    }
    fragments.data?.add(motionFragments)
  }
  function removeMotionFragments(): void {
    const group = fragments.data?.get({
      fields: ['id'],
      filter: (item: any) => item.group === 3,
    })
    fragments.data?.remove(group)
  }
  function updateCurrentTime(): void {
    if (!video.el) return
    if (!panel.timeline.attached || video.el.paused || video.error) return

    if (camera.srcType === 'live') {
      date.current = date.last + video.el.currentTime * 1000
      panel.updateMarker()
      if (panel.timeline.follow) panel.setTimelinePosition()
      if (video.speed.current > 1) video.speed.current = 1

      if (date.live - date.current > 5000) live.value = false
      else live.value = true

      return
    }

    const isMissing = fragments.missing.find(item => date.current >= +item.start * 1000 && date.current <= +item.end * 1000 && item.start !== 0)
    if (isMissing) {
      date.current = +isMissing.end * 1000 + 1000
      setSrc()
      panel.updateMarker()
      hls.update()
      return
    }

    const current = moment(date.current).utcOffset(date.offset)
    const time = video.el.currentTime + date.serverOffset
    const minute = Math.floor(time / 60)
    const second = Math.floor(time % 60)
    if (minute >= 60) {
      current.hour(date.hour + 1)
      current.minute(0)
      current.second(second)
    } else {
      current.minute(minute)
      current.second(second)
    }
    date.current = current.valueOf()
    panel.updateMarker()
    if (panel.timeline.follow) panel.setTimelinePosition()
    if (date.current >= date.end && video.speed.current > 1) video.speed.current = 1
  }
  function calendarDateChange(props: any): void {
    if (camera.blocked) return

    const start = moment(date.start).utcOffset(date.offset)
    const end = moment(date.end).utcOffset(date.offset)
    const selected = moment(props.date).utcOffset(date.offset)
    if (selected.isBefore(start)) {
      selected.hour(start.hour())
      selected.minute(start.minute())
      selected.second(start.second())
      panel.calendar.date = selected.toDate()
    } else if (selected.isAfter(end)) {
      selected.hour(end.hour())
      selected.minute(end.minute())
      selected.second(end.second())
      panel.calendar.date = selected.toDate()
    }

    live.value = false
    date.current = selected.valueOf()
    setSrc()
    if (panel.timeline.follow) panel.timeline.follow = false
    panel.setTimelinePosition()
    panel.updateMarker()
    hls.update()
  }
  function rewindBackward(): void {
    if (camera.blocked) return
    if (live.value) {
      live.value = false
      date.current = date.end
    } else {
      let newDate = date.current - 15000
      if (newDate < date.start) newDate = date.start
      date.current = newDate
    }
    setSrc()
    hls.update()
    panel.updateMarker()
  }
  function rewindForward(): void {
    if (camera.blocked || live.value) return
    const newDate = date.current + 15000
    if (newDate > date.end) {
      live.value = true
      date.current = date.live
      setLiveSrc()
    } else {
      date.current = newDate
      setSrc()
    }
    hls.update()
    panel.updateMarker()
  }
  function setLive(force = false): void {
    if (live.value && force !== true) return
    live.value = true
    setLiveSrc()
    date.last = date.live
    date.current = date.live
    panel.updateMarker()
    panel.setTimelinePosition()
    hls.update(false)
  }
  function changeQuality(value: string): void {
    quality.current = value
    setLive(true)
  }
  function getOffsetFromUrl(url: string): void {
    if (live.value) {
      date.serverOffset = 0
      return
    }

    let qmIndex = 0
    if (url.includes('.mt.ts')) qmIndex = url.indexOf('.mt.ts')
    else qmIndex = url.indexOf('.ts')

    const withoutParams = url.slice(0, qmIndex)
    const urlParts = withoutParams.split('/')
    const timeParts = urlParts[urlParts.length - 1].split('-')
    date.serverOffset = Number(timeParts[timeParts.length - 1]) || 0
  }
  async function getData(): Promise<void> {
    try {
      if (camera.codec.includes('265') || camera.codec.includes('hevc')) return
      const response = await fetch(`${camera.host}/ajax/cameras/${camera.name}?archiveData=1&token=${camera.token}&dToken=${camera.dToken}&groupingMt=true`)
      const result = await response.json()
      if (response.ok) {
        const archiveData: any = result.data.archiveData
        if (!archiveData) {
          video.showError()
          return
        }

        fragments.clear()

        if (archiveData.missingFragments) fragments.missing = archiveData.missingFragments
        if (archiveData.motionDetect) fragments.motion.push(archiveData.motionDetect)

        if (result.data.server?.minThumbnails) camera.thumbnails = true

        const borderTop = result.data?.archiveBorderTop ? result.data.archiveBorderTop : camera.realTime
        const dvr = camera.realTime - camera.dvrDepth * 86400
        date.start = (borderTop >= dvr ? borderTop : dvr) * 1000

        const liveTime = camera.realTime * 1000
        const offset = liveTime - 60000

        date.end = offset > date.start ? offset : date.start
        date.current = date.url > date.start && date.url < date.end ? date.url : liveTime

        date.live = date.last = liveTime
        live.value = date.current === liveTime

        addMainFragments()
        addMissingFragments()

        fragments.index = fragments.data.length
      } else {
        console.error(response.status)
      }
    } catch (error) {
      console.error(error)
    }
  }
  function setSrc(unixtime = date.current) {
    date.last = unixtime
    const utcDate = moment(unixtime).utc()
    const parts = {
      year: numToString(utcDate.year()),
      month: numToString(utcDate.month() + 1),
      day: numToString(utcDate.date()),
      hours: numToString(utcDate.hour()),
      minutes: utcDate.minute(),
      seconds: utcDate.second(),
    }
    date.load = parts.minutes * 60 + parts.seconds
    date.hour = moment(unixtime).utcOffset(date.offset).hour()
    camera.srcType = 'archive'
    camera.src = `${camera.host}/vsaas/cameras/${camera.name}/archive/${parts.year}/${parts.month}/${parts.day}/${parts.hours}/stream.m3u8?token=${camera.token}`
  }
  function setLiveSrc() {
    camera.srcType = 'live'
    camera.src = `${camera.host}/vsaas/cameras/${camera.name}/hls/${quality.current}/stream.m3u8?token=${camera.token}`
  }
  function resetParams() {
    date.url = 0
    video.speed.current = 1
    panel.fragment.display = false
    panel.timeline.attached = false
    hls.attached = false
  }

  return {
    live,
    csrf,
    camera,
    quality,
    date,
    fragments,
    previewUrl,
    notSupported,
    addMainFragments,
    updateMainFragments,
    addMissingFragments,
    addMotionFragments,
    removeMotionFragments,
    updateCurrentTime,
    calendarDateChange,
    rewindBackward,
    rewindForward,
    setLive,
    changeQuality,
    getOffsetFromUrl,
    getData,
    setSrc,
    setLiveSrc,
    resetParams,
  }
})
