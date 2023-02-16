import { reactive, ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import type Hammer from 'hammerjs'

import type {
  ZoomCoords,
  ZoomCoorsLast,
  ZoomPinch,
  ZoomScale,
} from '../types/zoom'

import { useVideo } from './video'
import { usePanel } from './panel'

export const useZoom = defineStore('playerZoom', () => {
  const shift: ZoomCoords = reactive({ x: 0, y: 0 })
  const max: ZoomCoords = reactive({ x: 0, y: 0 })
  const last: ZoomCoorsLast = reactive({ x: 0, y: 0, scale: 1 })
  const scale: ZoomScale = reactive({ min: 1, max: 5, current: 1 })
  const pinch: ZoomPinch = reactive({ x: 0, y: 0, origin: 0 })
  const factor = ref<number>(0.1)
  const ratio = ref<number>(1)
  const zooming = ref<boolean>(false)
  const transform = ref<string>('')

  const video = useVideo()
  const panel = usePanel()

  const { isPending, start, stop } = useTimeoutFn(() => {
    zooming.value = false
  }, 1000)

  function onMouseWheel(event: WheelEvent): void {
    zooming.value = true
    calculateScale(-event.deltaY / 120)
    setMaxShift()
    calculateShift(event)
    last.x = shift.x
    last.y = shift.y
    last.scale = scale.current
    setTransform()
    updateTimeout()
  }
  function onMouseMove(): void {
    if (video.isMobile) return
    panel.hidden = false
  }
  function onPan(event: typeof Hammer.Input): void {
    if (scale.current <= 1) return
    const x = last.x + event.deltaX
    const y = last.y + event.deltaY
    restrictShift(x, y)
    setTransform()
  }
  function onPanEnd(): void {
    last.x = shift.x
    last.y = shift.y
    last.scale = scale.current
  }
  function onPinch(event: typeof Hammer.Input): void {
    const result = scaleFrom(event.scale)
    zooming.value = true
    scale.current = restrictScale(result.scale + last.scale)
    if (scale.current >= 5) {
      setTransform()
      updateTimeout()
      return
    }
    setMaxShift()
    const x = result.x + last.x + event.deltaX
    const y = result.y + last.y + event.deltaY
    restrictShift(x, y)
    setTransform()
    updateTimeout()
  }
  function onPinchStart(event: typeof Hammer.Input): void {
    pinch.x = event.center.x
    pinch.y = event.center.y
    pinch.origin = getRelativePosition()
  }
  function onPinchEnd(): void {
    last.x = shift.x
    last.y = shift.y
    last.scale = scale.current
  }

  function getRelativePosition(): ZoomCoords {
    const domCoords = getCoords()
    const elementX = pinch.x - domCoords.x
    const elementY = pinch.y - domCoords.y
    const x = elementX / (video.initial.width * scale.current / 2) - 1
    const y = elementY / (video.initial.height * scale.current / 2) - 1
    return { x, y }
  }
  function getCoords(): ZoomCoords {
    if (!video.el) return { x: 0, y: 0 }
    const box = video.el.getBoundingClientRect()
    const body = document.body
    const docEl = document.documentElement
    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft
    const clientTop = docEl.clientTop || body.clientTop || 0
    const clientLeft = docEl.clientLeft || body.clientLeft || 0
    const top = box.top + scrollTop - clientTop
    const left = box.left + scrollLeft - clientLeft
    return { x: Math.round(left), y: Math.round(top) }
  }
  function scaleFrom(scale: number): ZoomCoorsLast {
    const currentScale = last.scale
    const newScale = last.scale * scale
    const currentShift = getCoordinateShift(currentScale)
    const newShift = getCoordinateShift(newScale)
    const shift = {
      x: currentShift.x - newShift.x,
      y: currentShift.y - newShift.y,
    }
    if (typeof pinch.origin !== 'object') return { x: 0, y: 0, scale: 1 }
    const output = {
      x: pinch.origin.x * shift.x,
      y: pinch.origin.y * shift.y,
      scale: newScale - currentScale,
    }
    return output
  }
  function getCoordinateShift(scale: number) {
    const newWidth = scale * video.initial.width
    const newHeight = scale * video.initial.height
    const x = (newWidth - video.initial.width) / 2
    const y = (newHeight - video.initial.height) / 2
    return { x, y }
  }
  function calculateShift(event: WheelEvent) {
    const { offsetX, offsetY } = event
    if (scale.current <= 1) {
      shift.x = 0
      shift.y = 0
      return false
    }
    const x = shift.x + (offsetX - shift.x) * ratio.value
    const y = shift.y + (offsetY - shift.y) * ratio.value
    restrictShift(x, y)
  }
  function setMaxShift(): void {
    if (!video.el) return
    max.x = -(video.el.offsetWidth * scale.current - video.el.offsetWidth)
    max.y = -(video.el.offsetHeight * scale.current - video.el.offsetHeight)
  }
  function restrictShift(x: number, y: number): void {
    if (x > 0) shift.x = 0
    else if (x < max.x) shift.x = max.x
    else shift.x = x

    if (y > 0) shift.y = 0
    else if (y < max.y) shift.y = max.y
    else shift.y = y
  }
  function calculateScale(delta: number): void {
    const newScale = restrictScale(delta * factor.value + scale.current)
    ratio.value = 1 - newScale / scale.current
    scale.current = newScale
  }
  function restrictScale(newScale: number): number {
    if (newScale <= scale.min) return scale.min
    if (newScale >= scale.max) return scale.max
    return newScale
  }

  function setTransform(): void {
    transform.value = `translate3d(${shift.x}px, ${shift.y}px, 0) scale(${scale.current})`
  }
  function reset(): void {
    scale.current = 1
    shift.x = 1
    shift.y = 1
    setTransform()
  }
  function updateTimeout(): void {
    if (isPending.value) stop()
    start()
  }

  return {
    shift,
    max,
    last,
    scale,
    pinch,
    factor,
    ratio,
    zooming,
    transform,
    onMouseWheel,
    onMouseMove,
    onPan,
    onPanEnd,
    onPinch,
    onPinchStart,
    onPinchEnd,
    setTransform,
    reset,
    updateTimeout,
  }
})
