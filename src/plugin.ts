import type { App } from 'vue'
import Player from './Player.vue'

import './sass/main.sass'

export default function install(App: App): void {
  App.component('Player', Player)
}
