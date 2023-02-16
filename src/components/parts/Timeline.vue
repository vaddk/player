<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, unref } from 'vue'

import { useVideo } from '../../stores/video'
import { useArchive } from '../../stores/archive'
import { usePanel } from '../../stores/panel'
import { useHls } from '../../stores/hls'

const video = useVideo()
const archive = useArchive()
const panel = usePanel()
const hls = useHls()

const timelineEl = ref<HTMLElement | null>(null)

function onMouseLeave() {
  panel.fragment.start.moving = false
  panel.fragment.end.moving = false
}

onMounted(() => {
  archive.getData().then(() => {
    panel.el = unref(timelineEl)
    panel.buildTimeline()
    panel.initEvents()
    hls.init()
    video.useWorker()
  }, () => video.showError())
})

onBeforeUnmount(() => {
  hls.instance?.destroy()
  panel.instance?.destroy()
  if (video.worker) video.worker.terminate()
})
</script>

<template>
  <div
    id="timeline"
    ref="timelineEl"
    class="timeline"
    @mouseleave="onMouseLeave"
  />
</template>

<style lang="sass" scoped>
.timeline
  display: block
  overflow-y: hidden
  width: 100%
  height: 66px
  padding: 0 5px
  font-size: 14px
  white-space: nowrap
  box-sizing: border-box
  &::hover
    cursor: pointer
.timeline::-webkit-scrollbar
  width: 0
  display: none
</style>
