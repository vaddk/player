<script lang="ts" setup>
import {
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
} from 'vue'
import { useEventListener } from '@vueuse/core'

import { useVideo } from '../stores/video'
import { useZoom } from '../stores/zoom'
import { useCanvas } from '../stores/canvas'
import { useArchive } from '../stores/archive'
import { usePanel } from '../stores/panel'
import { useHls } from '../stores/hls'

import Preloader from './parts/Preloader.vue'

const video = useVideo()
const canvas = useCanvas()
const zoom = useZoom()
const archive = useArchive()
const panel = usePanel()
const hls = useHls()

const videoEl = ref<HTMLVideoElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const videoWr = ref<HTMLElement | null>(null)

if (archive.notSupported) video.showError()

function togglePlayback(): void {
  if ((zoom.scale.current > 1 && !video.isMobile) || !video.allowPause) return
  if (video.isMobile) panel.hidden = !panel.hidden
  else video.toggle()
}

function setElements(): void {
  if (archive.notSupported) return
  video.el = unref(videoEl)
  canvas.el = unref(canvasEl)
  video.el?.focus()
}

function setElementsSize(): void {
  if (archive.notSupported) return
  video.width = unref(videoWr)?.offsetWidth ?? 0
  video.ratio = archive.camera.width / archive.camera.height
  video.setHeight()
  video.initial.width = video.width
  video.initial.height = video.height
  canvas.width = video.width
  canvas.height = video.height
}

function updateSize(): void {
  if (video.fullscreen) {
    const width = video.isIOS ? window.innerWidth : window.screen.width
    const height = video.isIOS ? window.innerHeight : window.screen.height
    video.width = width
    video.height = height
    canvas.width = video.width
    canvas.height = video.height
  } else {
    video.width = unref(videoWr)?.offsetWidth ?? 0
    video.setHeight()
    canvas.width = video.width
    canvas.height = video.height
  }
}

useEventListener(window, 'resize', updateSize)

useEventListener(document, 'keypress', video.onKeypress)
useEventListener(document, 'keydown', video.onKeydown)
useEventListener(document, 'keyup', video.onKeyup)

useEventListener(document, 'fullscreenchange', video.escFullscreen)
useEventListener(document, 'webkitfullscreenchange', video.escFullscreen)
useEventListener(document, 'mozfullscreenchange', video.escFullscreen)
useEventListener(document, 'MSFullscreenChange', video.escFullscreen)

onMounted(() => {
  setElements()
  setElementsSize()
})

onBeforeUnmount(() => {
  video.error = false
  hls.fatal.state = false
  hls.fatal.current = 0
})
</script>

<template>
  <div class="video-block">
    <Preloader v-show="video.preloader" />
    <div v-cloak ref="videoWr" class="video-wrapper">
      <div
        v-if="archive.notSupported"
        class="not-supported"
      >
        <img :src="archive.previewUrl" alt="not supported">
      </div>
      <video
        v-else
        id="video"
        ref="videoEl"
        v-hammer:pan="zoom.onPan"
        v-hammer:panend="zoom.onPanEnd"
        v-hammer:pinch="zoom.onPinch"
        v-hammer:pinchstart="zoom.onPinchStart"
        v-hammer:pinchend="zoom.onPinchEnd"
        :width="video.width"
        :height="video.height"
        :autoplay="video.autoplay"
        :muted="video.muted"
        :controls="video.controls"
        :playsinline="true"
        :style="{ transform: zoom.transform }"
        @mousemove="zoom.onMouseMove"
        @wheel.prevent="zoom.onMouseWheel"
        @click.prevent="togglePlayback"
        @loadstart="video.preloader = true"
        @canplay="video.preloader = false"
        @ended="hls.loadNext"
        @timeupdate="archive.updateCurrentTime"
      />
      <canvas
        v-show="canvas.display"
        id="canvas"
        ref="canvasEl"
        :width="canvas.width"
        :height="canvas.height"
      />
      <div
        v-show="video.error && !video.preloader"
        class="fatal-wrapper"
      >
        <p>Не удалось установить соединение с сервером. <br> Перезагрузить плеер?</p>
        <button
          type="button"
          @click.prevent="hls.update()"
        />
      </div>
      <transition name="fade">
        <div
          v-show="video.condition"
          class="condition-wrapper"
          @click.stop.prevent="video.toggle"
        >
          <span class="condition" />
        </div>
      </transition>
      <transition name="fade">
        <div
          v-show="zoom.zooming"
          class="current-scale"
        >
          x{{ +zoom.scale.current.toFixed(1) }}
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="sass" scoped>
#video
  position: relative
  display: block
  margin: 0 auto
  transform-origin: 0 0 0
  &.compress
    object-fit: fill
#canvas
  position: absolute
  top: 0
  left: 0
.video-block
  width: 100%
  height: 100%
  position: relative
  .video-wrapper
    width: 100%
    height: 100%
    display: flex
    align-items: center
.current-scale
  width: 38px
  height: 30px
  padding: 4px
  display: inline-flex
  align-items: center
  justify-content: center
  position: absolute
  top: 20px
  right: 30px
  font-size: 14px
  line-height: 14px
  color: #ffffff
  background-color: rgba(0, 0, 0, 0.7)
  border-radius: 4px
.condition-wrapper
  display: inline-flex
  align-items: center
  justify-content: center
  width: 100px
  height: 100px
  position: absolute
  top: calc(50% - 50px)
  left: calc(50% - 50px)
  z-index: 50
  background-color: rgba(0, 0, 0, 0.35)
  border-radius: 50%
  cursor: pointer
  .condition
    display: inline-block
    width: 40px
    height: 44px
    margin-left: 8px
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg version='1.1' baseProfile='tiny' id='Слой_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 22.3 24.8' overflow='visible' xml:space='preserve' fill='white'%3e%3cpath fill-rule='evenodd' d='M21.3,13.5c0.7-0.4,0.7-1.3,0-1.7L1.9,0.4C1.2,0,0.4,0.5,0.4,1.3L0.3,23.5c0,0.8,0.8,1.2,1.5,0.9 L21.3,13.5z'/%3e%3c/svg%3e")
    background-repeat: no-repeat
    background-size: cover
    cursor: pointer

.fatal-wrapper
  display: flex
  position: absolute
  flex-wrap: wrap
  align-items: center
  justify-content: center
  width: 100%
  height: auto
  font-size: 20px
  line-height: 130%
  font-weight: 600
  color: white
  text-align: center
  p
    width: 100%
  button
    display: inline-block
    width: 48px
    height: 48px
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg fill='%23ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='256px' height='256px'%3e%3cpath d='M 16 4 C 10.886719 4 6.617188 7.160156 4.875 11.625 L 6.71875 12.375 C 8.175781 8.640625 11.710938 6 16 6 C 19.242188 6 22.132813 7.589844 23.9375 10 L 20 10 L 20 12 L 27 12 L 27 5 L 25 5 L 25 8.09375 C 22.808594 5.582031 19.570313 4 16 4 Z M 25.28125 19.625 C 23.824219 23.359375 20.289063 26 16 26 C 12.722656 26 9.84375 24.386719 8.03125 22 L 12 22 L 12 20 L 5 20 L 5 27 L 7 27 L 7 23.90625 C 9.1875 26.386719 12.394531 28 16 28 C 21.113281 28 25.382813 24.839844 27.125 20.375 Z'/%3e%3c/svg%3e")
    background-size: cover
    background-repeat: no-repeat
    cursor: pointer
    &:hover
      animation: rotating 1.5s linear infinite
</style>
