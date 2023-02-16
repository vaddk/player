<script lang="ts" setup>
import { provide } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'

import moment from './scripts/moment'

import { useVideo } from './stores/video'
import { useArchive } from './stores/archive'

import Video from './components/Video.vue'
import Panel from './components/Panel.vue'

import './sass/main.sass'

const props = defineProps({
  camera: {
    type: Object,
    required: true,
  },
  access: {
    type: Boolean,
    required: false,
    default: true,
  },
  csrf: {
    type: String,
    required: false,
  },
  expose: {
    type: Boolean,
    required: false,
    default: false,
  },
})

defineExpose({
  currentTime, isLive, reset,
})

if (props.expose) {
  // @ts-expect-error: new key in window
  if (!window.Player) window.Player = {}
  // @ts-expect-error: new key in window
  window.Player.methods = {
    currentTime, isLive, reset,
  }
}

window.moment = moment

const video = useVideo()
const archive = useArchive()

const params = useUrlSearchParams('history')

const server = props.camera.server
const cameraId = props.camera.cam_id

provide('playerCamId', cameraId)

if (props.camera.primary_source !== '') archive.quality.list.push('best')
if (props.camera.secondary_source !== '') archive.quality.list.push('average')

// @ts-expect-error: window csrf
archive.csrf = props.csrf ?? window.CSRF

archive.camera.name = props.camera.name
archive.camera.host = server.ssl ? `https://${server.hostname}:${server.https_port}` : `http://${server.hostname}:${server.http_port}`
archive.camera.token = props.camera.playback_config.token
archive.camera.dToken = props.camera.playback_config.dToken
archive.camera.width = props.camera.width || 1920
archive.camera.height = props.camera.height || 1080
archive.camera.blocked = !!(props.camera.dvr_protected || !props.access)
archive.camera.codec = props.camera.video_codec || 'h.264'
archive.camera.dvrDepth = props.camera.depth_user
archive.camera.realTime = props.camera.realTime

archive.date.offset = +props.camera.objectData?.time_zone.offset_minutes
if (params.playerTime) archive.date.url = +params.playerTime

function currentTime(time: number | undefined): number | void {
  if (!time) return archive.date.current
  archive.date.url = time
}
function isLive(): boolean {
  return archive.camera.srcType === 'live'
}
function reset(): void {
  archive.resetParams()
}
</script>

<template>
  <div id="player" :class="{ fullscreen: video.fullscreen, mobile: video.isMobile }">
    <Video />
    <Panel />
  </div>
</template>
