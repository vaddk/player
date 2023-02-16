<script lang="ts" setup>
import { onMounted, ref, unref } from 'vue'

import { useVideo } from '../stores/video'
import { usePanel } from '../stores/panel'

import ScrollLeft from './parts/ScrollLeft.vue'
import ScrollRight from './parts/ScrollRight.vue'
import Timeline from './parts/Timeline.vue'
import FragmentTime from './parts/FragmentTime.vue'
import Preview from './parts/Preview.vue'
import Calendar from './parts/Calendar.vue'
import Live from './parts/Live.vue'
import Speed from './parts/Speed.vue'
import Playback from './parts/Playback.vue'
import TimelineControls from './parts/TimelineControls.vue'
import Sound from './parts/Sound.vue'
import Remaining from './parts/Remaining.vue'

const video = useVideo()
const panel = usePanel()

const panelEl = ref<HTMLElement | null>(null)

onMounted(() => panel.el = unref(panelEl))
</script>

<template>
  <div
    v-cloak
    ref="panelEl" class="control-panel"
    :class="{ error: video.error, hidden: panel.hidden }"
    @pointerenter="panel.isPointed = true"
    @pointerleave="panel.isPointed = false"
  >
    <div class="timeline-wrapper">
      <ScrollLeft />
      <Timeline />
      <ScrollRight />
      <FragmentTime />
      <Preview />
    </div>
    <div class="player-control-panel">
      <Calendar />
      <Live />
      <Speed />
      <Playback />
      <TimelineControls />
      <Sound />
      <Remaining />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.control-panel
  width: 100%
  max-height: 120px
  position: relative
  background-color: #403f49
  box-shadow: inset 0px 1px 10px 2px rgba(0, 0, 0, 0.3)
  transition: transform 0.3s
  .player-control-panel
    display: flex
    align-items: center
    height: 46px
    padding: 5px 10px 12px
    box-sizing: border-box
    position: relative
  .timeline-wrapper
    display: flex
    position: relative
    height: 66px
    padding: 10px 10px 0
    margin-bottom: 8px
    box-sizing: border-box
.control-panel.error
  pointer-events: none
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .control-panel
      max-height: 155px
      .player-control-panel
        flex-wrap: wrap
        height: 80px
</style>
