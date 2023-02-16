import { reactive, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import Hls from 'hls.js'

import type { HlsConfig } from 'hls.js'
import type { Fatal } from '../types/hls'

import moment from '../scripts/moment'

import { useVideo } from './video'
import { useArchive } from './archive'

export const useHls = defineStore('playerHls', () => {
  const instance = shallowRef<Hls | null>(null)
  const attached = ref<boolean>(false)
  const browserSupport = ref<string>('')
  const fatal: Fatal = reactive({
    state: true,
    current: 0,
    max: 60,
  })

  const video = useVideo()
  const archive = useArchive()

  function init(): void {
    if (archive.live) archive.setLiveSrc()
    else archive.setSrc()

    if (Hls.isSupported()) browserSupport.value = 'hls'
    else if (video.el?.canPlayType('application/vnd.apple.mpegurl')) browserSupport.value = 'native'

    update(!archive.live)
  }
  function initEvents(): void {
    instance.value?.on(Hls.Events.MEDIA_ATTACHED, () => {
      attached.value = true
      instance.value?.loadSource(archive.camera.src)
    })
    instance.value?.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      if (fatal.state) {
        fatal.state = false
        fatal.current = 0
      }
      archive.getOffsetFromUrl(data.levels[0].details?.fragments[0]?.relurl || '')
      if (instance.value && instance.value.config.startPosition > 0) instance.value.config.startPosition -= archive.date.serverOffset
      video.updateSpeed()
    })
    instance.value?.on(Hls.Events.MEDIA_DETACHED, () => attached.value = false)
    instance.value?.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) return false
      fatal.state = true
      if (fatal.current >= fatal.max) {
        destroy()
        video.showError()
        return false
      }
      fatal.current += 1
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.warn('[HLS] fatal: true, type: network')
          setTimeout(() => update(), 5000)
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.warn('[HLS] fatal: true, type: media')
          instance.value?.recoverMediaError()
          break
        default:
          console.warn('[HLS] fatal: true, type: finish')
          destroy()
          video.showError(true)
          break
      }
    })
  }
  function update(time = true): void {
    if (!video.el) return
    if (browserSupport.value === 'native') {
      video.el.src = archive.camera.src
      if (time) video.el.currentTime = archive.date.load
    } else if (browserSupport.value === 'hls') {
      if (attached.value) {
        instance.value?.stopLoad()
        instance.value?.destroy()
      }
      const config: Partial<HlsConfig> = { lowLatencyMode: true }
      if (time) config.startPosition = archive.date.load
      instance.value = new Hls(config)
      instance.value.attachMedia(video.el)
      initEvents()
    } else {
      video.showError()
    }
  }
  function loadNext(): void {
    if (archive.live) {
      update()
      return
    }
    const last = moment(archive.date.last)
    last.hour(last.hour() + 1)
    last.minute(0)
    last.second(0)
    archive.setSrc(last.valueOf())
    archive.date.current = last.valueOf()
    update()
  }
  function destroy(): void {
    instance.value?.destroy()
    attached.value = false
  }

  return {
    instance,
    attached,
    browserSupport,
    fatal,
    init,
    initEvents,
    update,
    loadNext,
    destroy,
  }
})
