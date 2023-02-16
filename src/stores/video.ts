import { reactive, ref, watch } from 'vue'
import { useFullscreen } from '@vueuse/core'
import { defineStore } from 'pinia'

import type {
  Initial,
  Sound,
  Speed,
} from '../types/video'

import { playerWorker } from '../scripts/worker'

import { useCanvas } from './canvas'
import { useZoom } from './zoom'
import { usePanel } from './panel'
import { useArchive } from './archive'

export const useVideo = defineStore('playerVideo', () => {
  const el = ref<HTMLVideoElement | null>(null)
  const width = ref<number>(0)
  const height = ref<number>(0)
  const ratio = ref<number>(1)
  const autoplay = ref<boolean>(true)
  const muted = ref<boolean>(true)
  const controls = ref<boolean>(false)
  const playing = ref<boolean>(true)
  const condition = ref<boolean>(false)
  const preloader = ref<boolean>(true)
  const fullscreen = ref<boolean>(false)
  const allowPause = ref<boolean>(true)
  const error = ref<boolean>(false)
  const worker = ref<Worker | null>(null)
  const isMobile = ref<boolean>(false)
  const isIOS = ref<boolean>(false)

  const initial: Initial = reactive({
    width: 0,
    height: 0,
  })
  const speed: Speed = reactive({
    display: false,
    current: 1,
    list: [0.125, 0.25, 0.5, 1, 2, 4, 8, 16],
    max() {
      return this.list[this.list.length - 1]
    },
    min() {
      return this.list[0]
    },
  })
  const sound: Sound = reactive({
    display: true,
    level: 0,
  })

  const canvas = useCanvas()
  const zoom = useZoom()
  const panel = usePanel()
  const archive = useArchive()

  const { enter, exit } = useFullscreen()

  function play(cond = false): void {
    playing.value = true
    condition.value = cond
  }
  function pause(cond = true): void {
    playing.value = false
    condition.value = cond
  }
  function toggle(): void {
    if (error.value) return
    playing.value = !playing.value
    if (playing.value === true && condition.value === false) return
    condition.value = !condition.value
  }
  function setHeight(): void {
    const result = width.value / ratio.value
    const maxHeight = Math.round(window.screen.height * 0.7)
    height.value = result > maxHeight ? maxHeight : result
  }
  function updateSpeed(): void {
    if (!el.value) return
    el.value.playbackRate = speed.current
  }
  function minSound(): void {
    sound.level = 0
    muted.value = true
  }
  function maxSound(): void {
    sound.level = 1
    muted.value = false
  }
  function decreaseSpeed(): void {
    if (archive.camera.blocked || speed.current === speed.min()) return
    speed.current = speed.current / 2
  }
  function increaseSpeed(): void {
    if (archive.camera.blocked || speed.current === speed.max()) return
    speed.current = speed.current * 2
  }
  function displaySpeed(value: boolean): void {
    if (archive.camera.blocked) return
    speed.display = value
  }
  async function enterFullscreen(): Promise<void> {
    zoom.reset()
    await enter()
    width.value = window.screen.width
    height.value = window.screen.height
    canvas.width = window.screen.width
    canvas.height = window.screen.height
    document.body.classList.add('overflow-hidden')
    if (isMobile.value && !!window.screen.orientation) window.screen.orientation.lock('landscape-primary')
    panel.updateHideTimeout()
  }
  async function exitFullscreen(): Promise<void> {
    zoom.reset()
    await exit()
    width.value = initial.width
    height.value = initial.height
    canvas.width = initial.width
    canvas.height = initial.height
    document.body.classList.remove('overflow-hidden')
    if (isMobile.value && !!window.screen.orientation) window.screen.orientation.unlock()
  }
  function toggleFullscreen(value: boolean): void {
    if (value) enterFullscreen()
    else exitFullscreen()
  }
  function escFullscreen(): void {
    if (!document.fullscreenElement) fullscreen.value = false
  }
  function useWorker(): void {
    worker.value = new Worker(window.URL.createObjectURL(playerWorker))
    worker.value.onmessage = function (event: any) {
      if (event.data === 'live') archive.updateMainFragments()
    }
  }
  function showError(lite = false): void {
    playing.value = false
    condition.value = false
    preloader.value = false
    allowPause.value = false
    if (!lite) error.value = true
  }
  function onKeypress(event: KeyboardEvent): void {
    if (document.activeElement?.nodeName === 'TEXTAREA' || document.activeElement?.nodeName === 'INPUT') return

    switch (event.code) {
      case 'Space':
      case 'KeyP':
        toggle()
        break
      case 'KeyF':
        fullscreen.value = !fullscreen.value
        break
      case 'KeyV':
        if (sound.level !== 0) minSound()
        else maxSound()
        break
      case 'KeyL':
        archive.setLive()
        break
      case 'KeyC':
        if (event.shiftKey) panel.timeline.follow = !panel.timeline.follow
        else panel.setTimelinePosition()
        break
      case 'KeyD':
        if (panel.fragment.display) panel.cancelDownload()
        else panel.startDownload()
        break
      case 'KeyS':
        panel.screenshoot()
        break
    }
  }
  function onKeydown(event: KeyboardEvent): void {
    if (document.activeElement?.nodeName === 'TEXTAREA' || document.activeElement?.nodeName === 'INPUT') return

    switch (event.code) {
      case 'ArrowLeft':
        if (event.ctrlKey) {
          if (panel.moving) return
          panel.moveTimeline(0.09)
          panel.updateMoveTimeout(0.2)
        } else if (event.shiftKey) {
          decreaseSpeed()
        } else {
          archive.rewindBackward()
        }
        break
      case 'ArrowRight':
        if (event.ctrlKey) {
          if (panel.moving) return
          panel.moveTimeline(-0.09)
          panel.updateMoveTimeout(-0.2)
        } else if (event.shiftKey) {
          increaseSpeed()
        } else {
          archive.rewindForward()
        }
        break
      case 'ArrowUp':
        if (event.ctrlKey) {
          if (panel.zooming) return
          panel.zoomInTimeline(0.2)
          panel.updateZoomTimeout({ value: 0.2, type: 'In' })
        }
        break
      case 'ArrowDown':
        if (event.ctrlKey) {
          if (panel.zooming) return
          panel.zoomOutTimeline(0.2)
          panel.updateZoomTimeout({ value: 0.2, type: 'Out' })
        }
        break
    }
  }
  function onKeyup() {
    panel.removeMoveTimeout()
    panel.removeZoomTimeout()
  }

  watch(playing, (value: boolean) => {
    autoplay.value = value
    value ? el.value?.play() : el.value?.pause()
  })
  watch(() => speed.current, (value: number) => {
    if (el.value) el.value.playbackRate = value
  })
  watch(() => sound.level, (value) => {
    if (el.value) el.value.volume = value
  })
  watch(fullscreen, toggleFullscreen)

  return {
    el,
    width,
    height,
    ratio,
    autoplay,
    muted,
    controls,
    playing,
    condition,
    preloader,
    fullscreen,
    allowPause,
    error,
    worker,
    initial,
    speed,
    sound,
    isMobile,
    isIOS,
    play,
    pause,
    toggle,
    setHeight,
    updateSpeed,
    minSound,
    maxSound,
    decreaseSpeed,
    increaseSpeed,
    displaySpeed,
    enterFullscreen,
    exitFullscreen,
    escFullscreen,
    toggleFullscreen,
    useWorker,
    showError,
    onKeypress,
    onKeydown,
    onKeyup,
  }
})
