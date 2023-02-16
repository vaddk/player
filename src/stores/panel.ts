import { reactive, ref, shallowRef, watch } from 'vue'
import { useEventListener, useIntervalFn, useTimeoutFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { Timeline } from 'vis-timeline/esnext'

import type { TimelineOptions, TimelineWindow } from 'vis-timeline'

import { useToast } from '@vaddk/toastification'

import type { Moment, MomentInput } from 'moment'
import moment from '../scripts/moment'

import type {
  Calendar,
  Fragment,
  PanelTimeline,
  Preview,
} from '../types/panel'

import { useVideo } from './video'
import { numToString, useArchive } from './archive'
import { useHls } from './hls'

export const usePanel = defineStore('playerPanel', () => {
  const el = ref<HTMLElement | null>(null)
  const hidden = ref<boolean>(false)
  const isPointed = ref<boolean>(false)
  const instance = shallowRef<Timeline | null>(null)

  const moveFactor = ref<any>(0)
  const zoomFactor = ref<any>(0)
  const zoomType = ref<any>(null)

  const timeline: PanelTimeline = reactive({
    attached: false,
    follow: false,
    range: {
      start: 0,
      end: 0,
      length() {
        return this.end - this.start
      },
    },
    grouping: {
      join: 0,
      start: 10000000,
      end: 63000000,
    },
  })
  const fragment: Fragment = reactive({
    display: false,
    start: {
      hours: '',
      minutes: '',
      seconds: '',
      date: 0,
      moving: false,
    },
    end: {
      hours: '',
      minutes: '',
      seconds: '',
      date: 0,
      moving: false,
    },
  })
  const calendar: Calendar = reactive({
    date: Date.now(),
  })
  const preview: Preview = reactive({
    display: false,
    style: {
      top: 0,
      left: 0,
    },
    time: Date.now(),
    text: '',
    src: '',
  })

  const video = useVideo()
  const archive = useArchive()
  const hls = useHls()

  const {
    isPending: hidePending,
    start: startHide,
    stop: stopHide,
  } = useTimeoutFn(() => {
    if (!isPointed.value) hidden.value = true
  }, 3000, { immediate: false })

  const {
    pause: stopMove,
    resume: startMove,
    isActive: moving,
  } = useIntervalFn(() => {
    moveTimeline(moveFactor.value)
  }, 100, { immediate: false })

  const {
    isPending: movePending,
    start: startMoveTimeout,
    stop: stopMoveTimeout,
  } = useTimeoutFn((value: any) => {
    moveFactor.value = value
    startMove()
  }, 300, { immediate: false })

  const {
    pause: stopZoom,
    resume: startZoom,
    isActive: zooming,
  } = useIntervalFn(() => {
    if (zoomType.value === 'In') zoomInTimeline(zoomFactor.value)
    if (zoomType.value === 'Out') zoomOutTimeline(zoomFactor.value)
  }, 100, { immediate: false })

  const {
    isPending: zoomPending,
    start: startZoomTimeout,
    stop: stopZoomTimeout,
  } = useTimeoutFn((payload: any) => {
    const { value, type } = payload
    zoomFactor.value = value
    zoomType.value = type
    startZoom()
  }, 300, { immediate: false })

  function buildTimeline(): void {
    const offset = archive.date.end - 3600000
    const options: TimelineOptions = {
      zoomMax: 192000000,
      zoomMin: 580000,
      start: offset > archive.date.start ? offset : archive.date.start,
      end: archive.date.live,
      height: '66px',
      dataAttributes: ['group'],
      showCurrentTime: false,
      zoomFriction: 20,
      preferZoom: true,
      moveable: true,
      locale: 'ru',
      moment: (date: MomentInput) => {
        if (typeof date == 'number' && date.toString().length === 10) return moment.unix(date).utcOffset(archive.date.offset)
        return moment(date).utcOffset(archive.date.offset)
      },
      onInitialDrawComplete() {
        if (!instance.value) return
        moveTimeline(0.5)
        instance.value.moveTo(archive.date.current)
        timeline.attached = true
      },
      groupHeightMode: 'fixed',
      editable: false,
    }
    instance.value = new Timeline(el.value as HTMLElement, archive.fragments.data, options)

    instance.value.addCustomTime(archive.date.current, 'current-time')
    instance.value.addCustomTime(archive.date.start, 'fragment-start-time')
    instance.value.addCustomTime(archive.date.end, 'fragment-end-time')
  }
  function initEvents(): void {
    if (!instance.value) return
    // @ts-expect-error: not full vis-timeline types (missed body)
    const timelineCenter = instance.value.body.dom.centerContainer
    // @ts-expect-error: same as top
    const timelineBottom = instance.value.body.dom.bottom

    const {
      isPending: motionPending,
      start: startMotion,
      stop: stopMotion,
    } = useTimeoutFn(() => {
      archive.removeMotionFragments()
      archive.addMotionFragments()
    }, 500, { immediate: false })

    instance.value.on('changed', (): void => {
      timelineCenter.style.height = '6px'
      timelineCenter.style.marginTop = '10px'
      timelineBottom.style.top = '15px'
    })
    instance.value.on('click', async (props): Promise<void> => {
      if (archive.camera.blocked) {
        useToast().error('Доступ к архиву запрещен')
        return
      }
      if (props.what !== 'background') return

      let date = props.time.getTime()
      if (date > archive.date.end || date < archive.date.start) return

      const group = props.event.target.getAttribute('data-group')
      if (group === '2') {
        const unix = Math.round(date / 1000)
        const fragment = archive.fragments.missing.find(el => unix >= el.start && unix <= el.end)
        if (!fragment) return
        date = +fragment.end * 1000 + 1000
      }

      if (archive.live) archive.live = false
      archive.date.current = date
      archive.setSrc(date)
      hls.update()
      updateMarker()
      if (timeline.follow) timeline.follow = false
    })
    instance.value.on('mouseDown', (props): void => {
      if (props.customTime === 'fragment-start-time') {
        fragment.start.moving = true
        // @ts-expect-error: missed dom
        instance.value?.dom.container.classList.add('resize')
      }
      if (props.customTime === 'fragment-end-time') {
        fragment.end.moving = true
        // @ts-expect-error: missed dom
        instance.value.dom.container.classList.add('resize')
      }
    })
    instance.value.on('mouseUp', (): void => {
      fragment.start.moving = false
      fragment.end.moving = false
      // @ts-expect-error: missed dom
      instance.value?.dom.container.classList.remove('resize')
    })
    instance.value.on('mouseMove', (props): void => {
      if (fragment.display) moveFragment(props.event)
    })
    instance.value.on('rangechanged', (data): void => {
      timeline.range.start = data.start.getTime()
      timeline.range.end = data.end.getTime()
      if (motionPending.value) stopMotion()
      startMotion()
    })

    if (archive.camera.blocked || !archive.camera.thumbnails) return
    useEventListener(timelineCenter, 'mousemove', (event) => {
      const { pageX, clientY } = event
      const props = instance.value?.getEventProperties(event)
      if (!props) return

      const time = props.time.getTime()
      if (archive.date.end >= time && archive.date.start <= time) {
        const panel = el.value?.getBoundingClientRect()
        if (!panel) return

        preview.style.top = clientY - 180

        if (pageX - 133 - panel.left < 0) preview.style.left = pageX - (pageX - panel.left)
        else if (panel.right < pageX + 133) preview.style.left = pageX - (pageX - panel.right) - 266
        else preview.style.left = pageX - 133

        if (Math.abs(+preview.time - time) > 6000) {
          preview.time = time
          preview.src = `${archive.camera.host}/cameras/${archive.camera.name}/min-preview/${Math.round(time / 1000)}?token=${archive.camera.token}`
        }

        preview.text = moment(props.time).utcOffset(archive.date.offset).format('L LT')
        preview.display = true
      }
    })
    useEventListener(timelineCenter, 'mouseleave', () => preview.display = false)
  }
  function moveTimeline(perc: number): void {
    if (!instance.value) return
    if (timeline.follow) timeline.follow = false
    const range: TimelineWindow = instance.value.getWindow()
    const interval = +range.end - +range.start
    const start = range.start.valueOf() - interval * perc
    const end = range.end.valueOf() - interval * perc
    instance.value.setWindow(start, end, {
      animation: { duration: 200 },
    })
  }
  function setTimelinePosition(value = archive.date.current) {
    instance.value?.moveTo(value)
  }
  function updateMarker() {
    instance.value?.setCustomTime(archive.date.current, 'current-time')
  }
  function zoomInTimeline(percentage: number) {
    instance.value?.zoomIn(percentage, { animation: { duration: 150 } })
  }
  function zoomOutTimeline(percentage: number) {
    instance.value?.zoomOut(percentage, { animation: { duration: 150 } })
  }
  function moveFragment(event: any): void {
    if (!instance.value) return
    if (fragment.start.moving) {
      const props = instance.value.getEventProperties(event)
      const date = moment(props.time).utcOffset(archive.date.offset)
      if (date.valueOf() < archive.date.start) return
      if (date.valueOf() > archive.date.end) return
      fragment.start.hours = numToString(date.hour())
      fragment.start.minutes = numToString(date.minute())
      fragment.start.seconds = numToString(date.second())
      fragment.start.date = date.valueOf()
      instance.value.setCustomTime(fragment.start.date, 'fragment-start-time')
    }
    if (fragment.end.moving) {
      const props = instance.value.getEventProperties(event)
      const date = moment(props.time).utcOffset(archive.date.offset)
      if (date.valueOf() > archive.date.end) return
      if (date.valueOf() < archive.date.start) return
      fragment.end.hours = numToString(date.hour())
      fragment.end.minutes = numToString(date.minute())
      fragment.end.seconds = numToString(date.second())
      fragment.end.date = date.valueOf()
      instance.value.setCustomTime(fragment.end.date, 'fragment-end-time')
    }
  }
  function setFragmentPosition(): void {
    if (!instance.value) return
    const visibleDates = instance.value.getWindow()
    const fixRightBorder = visibleDates.end.getSeconds() - 25
    visibleDates.end.setSeconds(fixRightBorder)

    let dateStart = moment(visibleDates.start).utcOffset(archive.date.offset)
    let dateEnd = moment(visibleDates.end).utcOffset(archive.date.offset)

    if (dateStart.valueOf() < archive.date.start) dateStart = moment(archive.date.start).utcOffset(archive.date.offset)

    fragment.start.hours = numToString(dateStart.hour())
    fragment.start.minutes = numToString(dateStart.minute())
    fragment.start.seconds = numToString(dateStart.second())
    fragment.start.date = dateStart.valueOf()
    instance.value.setCustomTime(fragment.start.date, 'fragment-start-time')

    if (dateEnd.valueOf() > archive.date.end) dateEnd = moment(archive.date.end).utcOffset(archive.date.offset)

    fragment.end.hours = numToString(dateEnd.hour())
    fragment.end.minutes = numToString(dateEnd.minute())
    fragment.end.seconds = numToString(dateEnd.second())
    fragment.end.date = dateEnd.valueOf()
    instance.value.setCustomTime(fragment.end.date, 'fragment-end-time')

    instance.value.zoomOut(0.1)
  }
  function updateFragment(prop: keyof Fragment): void {
    if (!instance.value) return
    if (prop === 'display') return
    const currentDate: Date = instance.value.getCustomTime(`fragment-${prop}-time`)
    let newDate = moment(currentDate).utcOffset(archive.date.offset)
    newDate.hour(+fragment[prop].hours)
    newDate.minute(+fragment[prop].minutes)
    newDate.second(+fragment[prop].seconds)
    newDate = validateDate(newDate, prop)
    fragment[prop].hours = numToString(newDate.hour())
    fragment[prop].minutes = numToString(newDate.minute())
    fragment[prop].seconds = numToString(newDate.second())
    fragment[prop].date = newDate.valueOf()
    instance.value.setCustomTime(fragment[prop].date, `fragment-${prop}-time`)
    const visibleDates = instance.value.getWindow()
    if ((newDate.valueOf() < +visibleDates.start || newDate.valueOf() > +visibleDates.end) && fragment.display)
      instance.value.moveTo(fragment[prop].date)
  }
  function resetFragment(): void {
    fragment.start.hours = ''
    fragment.start.minutes = ''
    fragment.start.seconds = ''
    fragment.start.date = 0
    fragment.end.hours = ''
    fragment.end.minutes = ''
    fragment.end.seconds = ''
    fragment.end.date = 0
  }
  function validateDate(date: Moment, prop: keyof Fragment): Moment {
    const start = moment(archive.date.start).utcOffset(archive.date.offset)
    const end = moment(archive.date.end).utcOffset(archive.date.offset)
    if (prop === 'start') {
      if (date.isBefore(start)) {
        date.hour(start.hour())
        date.minute(start.minute())
        date.second(start.second())
      } else if (date.isAfter(end)) {
        date.hour(end.hour())
        date.minute(end.minute())
        date.second(end.second())
      }
    } else {
      if (date.isAfter(end)) {
        date.hour(end.hour())
        date.minute(end.minute())
        date.second(end.second())
      } else if (date.isBefore(start)) {
        date.hour(start.hour())
        date.minute(start.minute())
        date.second(start.second())
      }
    }
    return date
  }
  function updateHideTimeout(): void {
    if (hidePending.value) stopHide()
    if (!video.fullscreen) return
    startHide()
  }
  function updateMoveTimeout(value: number, immediate = false): void {
    if (immediate) {
      moveFactor.value = value
      startMove()
      return
    }
    // @ts-expect-error: useTimeout missed start and stop arguments types
    if (!movePending.value) startMoveTimeout(value)
  }
  function removeMoveTimeout() {
    if (movePending.value) stopMoveTimeout()
    if (moving.value) stopMove()
  }
  function updateZoomTimeout(params: any, immediate = false): void {
    if (immediate) {
      const { value, type } = params
      zoomFactor.value = value
      zoomType.value = type
      startZoom()
      return
    }
    // @ts-expect-error: useTimeout missed start and stop arguments types
    if (!zoomPending.value) startZoomTimeout(params)
  }
  function removeZoomTimeout(): void {
    if (zoomPending.value) stopZoomTimeout()
    if (zooming.value) stopZoom()
  }
  function startDownload() {
    if (!timeline.attached || !instance.value) return
    // @ts-expect-error: missed range
    instance.value.range.options.moveable = false
    fragment.display = true
  }
  function cancelDownload(): void {
    if (!instance.value) return
    // @ts-expect-error: missed range
    instance.value.range.options.moveable = true
    fragment.display = false
    resetFragment()
  }
  function screenshoot() {
    const link = document.createElement('a')
    const currentDate = moment(archive.date.current).utcOffset(archive.date.offset)
    const day = currentDate.format('L')
    const time = currentDate.format('LTS')
    const unix = currentDate.format('X')
    link.download = `screenshot_${day}_${time}.png`
    link.href = `${archive.camera.host}/cameras/${archive.camera.name}/preview?token=${archive.camera.token}&time=${unix}`
    link.click()
  }

  watch(isPointed, (value) => {
    if (!value && !video.isMobile) updateHideTimeout()
  })
  watch(hidden, (value) => {
    if (!value && !video.isMobile) updateHideTimeout()
  })
  watch(() => fragment.display, (value) => {
    if (!instance.value) return
    if (!value) {
      // @ts-expect-error: missed customTimes
      instance.value.customTimes[1]?.bar.classList.remove('visible')
      // @ts-expect-error: missed customTimes
      instance.value.customTimes[2]?.bar.classList.remove('visible')
    } else {
      setFragmentPosition()
      // @ts-expect-error: missed customTimes
      instance.value.customTimes[1]?.bar.classList.add('visible')
      // @ts-expect-error: missed customTimes
      instance.value.customTimes[2]?.bar.classList.add('visible')
    }
  })

  return {
    el,
    hidden,
    isPointed,
    instance,
    moveFactor,
    timeline,
    fragment,
    calendar,
    preview,
    moving,
    zooming,
    buildTimeline,
    initEvents,
    moveTimeline,
    setTimelinePosition,
    updateMarker,
    zoomInTimeline,
    zoomOutTimeline,
    moveFragment,
    setFragmentPosition,
    updateFragment,
    resetFragment,
    updateHideTimeout,
    updateMoveTimeout,
    removeMoveTimeout,
    updateZoomTimeout,
    removeZoomTimeout,
    startDownload,
    cancelDownload,
    screenshoot,
  }
})

/* Old screen logic
function screenshoot() {
  canvas.display = true
  const context = canvas.el.getContext("2d")
  context.fillRect(0, 0, canvas.el.width, canvas.el.height)
  context.drawImage(video.el, 0, 0, canvas.el.width, canvas.el.height)

  const link = document.createElement("a")
  const currentDate = moment().utcOffset(archive.date.offset)
  const date = currentDate.format("L")
  const time = currentDate.format("LT")

  link.download = `screenshot_${date}_${time}.png`
  link.href = canvas.el.toDataURL()
  link.click()
  canvas.display = false
}
*/
