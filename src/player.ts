import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PlayerComponent from './Player.vue'
import hammer from './scripts/hammer'

interface PlayerCamera {
  name: string
  cam_id: number
  primary_source?: string
  secondary_source?: string
  depth_user: number
  realTime: number
  width?: number
  height?: number
  dvr_protected?: boolean
  access?: boolean
  video_codec?: string
  playback_config: {
    token: string
    dToken?: string
  }
  server: {
    hostname: string
    https_port: number
    http_port: number
    ssl: boolean
  }
  objectData: {
    time_zone: {
      offset_minutes: number | string
    }
  }
}

interface PlayerOptions {
  camera: PlayerCamera
  access?: boolean
  csrf?: string
  expose?: boolean
}

const requiredCameraKeys = ['name', 'cam_id', 'depth_user', 'realTime', 'playback_config', 'server', 'objectData']

function checkRequiredOptions(camera: PlayerCamera) {
  if (typeof camera !== 'object' || Array.isArray(camera)) throw new Error('[player] camera key must contain object')
  const optionsKeys = Object.keys(camera)
  for (const key of requiredCameraKeys)
    if (!optionsKeys.includes(key)) throw new Error(`[player] camera object must contain ${key} key`)
  return true
}

export default class Player {
  mounted = false
  methods = {}
  constructor(el: HTMLElement | string, options: PlayerOptions) {
    if (this.mounted === true) throw new Error('[player] already mounted')

    if (typeof el === 'string') {
      const error = new Error('[player] the first argument of the constructor must be a valid css selector or an html element')
      if (!el.startsWith('#') && !el.startsWith('.')) throw error
      if (!document.querySelector(el)) throw error
    }

    if (!options.camera) throw new Error('[player] the second argument of the constructor must contain camera object')
    if (checkRequiredOptions(options.camera) !== true) return

    const app = createApp(PlayerComponent, {
      camera: options.camera,
      access: options.access ?? true,
      csfr: options.csrf || null,
      expose: options.expose || false,
    })

    app.use(createPinia())
    app.use(hammer)
    app.mount(el)

    this.mounted = true
  }
}

// @ts-expect-error: new key in window
window.Player = Player
