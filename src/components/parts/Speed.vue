<script lang="ts" setup>
import { ref } from 'vue'

import { onClickOutside } from '@vueuse/core'

import { useVideo } from '../../stores/video'
import { useArchive } from '../../stores/archive'

const video = useVideo()
const archive = useArchive()

const valuesEl = ref<HTMLElement | null>(null)

onClickOutside(valuesEl, (event) => {
  if (!event.target) return
  const target: Partial<HTMLElement> = event.target
  if (target.className !== 'player-speed-text') video.speed.display = false
})
</script>

<template>
  <div class="player-speed-buttons">
    <button
      type="button"
      class="deceleration-button"
      title="Уменьшить скорость (shift + a.l)"
      @click.prevent="video.decreaseSpeed"
    >
      <span class="deceleration-button-icon" />
    </button>
    <div
      class="player-speed-text"
      @click.prevent="video.displaySpeed(!video.speed.display)"
    >
      x{{ video.speed.current }}
    </div>
    <div
      v-show="video.speed.display"
      ref="valuesEl"
      class="player-speed-full"
    >
      <div class="title">
        Скорость
      </div>
      <button
        v-for="(value, index) in video.speed.list"
        :key="index"
        class="player-speed"
        :class="{ active: value === video.speed.current }"
        :disabled="archive.live && value > 1"
        @click.prevent="video.speed.current = value"
      >
        {{ value }}
      </button>
    </div>
    <button
      type="button"
      class="acceleration-button"
      title="Увеличить скорость (shift + a.r)"
      :disabled="archive.live"
      @click.prevent="video.increaseSpeed"
    >
      <span class="acceleration-button-icon" />
    </button>
  </div>
</template>

<style lang="sass" scoped>
.player-speed-buttons
  position: relative
  display: inline-flex
  align-items: center
  margin-right: 25px
  .deceleration-button,
  .acceleration-button
    display: inline-block
    width: 22px
    height: 15px
    &:disabled
      cursor: not-allowed
  .deceleration-button
    margin-right: 8px
    .deceleration-button-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='28' height='17' viewBox='0 0 28 17' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.489685 7.20481C-0.164445 7.59297 -0.162928 8.54036 0.492443 8.92642L12.3488 15.9107C13.0141 16.3026 13.8538 15.8246 13.8563 15.0524L13.903 1.00487C13.9056 0.22827 13.0606 -0.254755 12.3927 0.141558L0.489685 7.20481ZM14.7034 7.21612C14.076 7.60851 14.0773 8.52278 14.7059 8.91334L25.8712 15.851C26.5361 16.2642 27.3964 15.7877 27.399 15.005L27.4454 1.05517C27.448 0.26811 26.5824 -0.213337 25.9151 0.204012L14.7034 7.21612Z' fill='white'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: 22px 15px
  .acceleration-button
    margin-left: 8px
    .acceleration-button-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='28' height='17' viewBox='0 0 28 17' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M26.9557 7.20481C27.6098 7.59297 27.6083 8.54036 26.9529 8.92642L15.0966 15.9107C14.4312 16.3026 13.5916 15.8246 13.589 15.0524L13.5423 1.00487C13.5398 0.22827 14.3848 -0.254756 15.0526 0.141558L26.9557 7.20481ZM12.7421 7.21612C13.3695 7.60851 13.3681 8.52278 12.7396 8.91334L1.57424 15.851C0.909365 16.2642 0.0490704 15.7877 0.0464668 15.005L8.39233e-05 1.05517C-0.00253296 0.268109 0.863035 -0.213338 1.53034 0.20401L12.7421 7.21612Z' fill='white'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: 22px 15px
  .player-speed-text
    display: inline-block
    font-size: 16px
    font-weight: 600
    line-height: 16px
    color: #FFFFFF
    cursor: pointer
  .player-speed-full
    display: flex
    flex-wrap: wrap
    justify-content: center
    width: 100px
    height: auto
    position: absolute
    bottom: 25px
    left: -10px
    z-index: 5
    background-color: #403f49
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25)
    border-radius: 2px
    .title
      width: 100%
      padding: 5px 0
      font-size: 18px
      line-height: 18px
      color: #ffffff
      text-align: center
      border-bottom: 1px solid #62626A
      margin-bottom: 4px
    .player-speed
      display: block
      width: 100%
      font-size: 17px
      line-height: 17px
      color: #C4C4C4
      margin-bottom: 5px
      &.active
        color: #FFFFFF
        font-weight: 600
      &:disabled
        cursor: not-allowed
@media (min-width: 1900px)
  .player-speed-buttons
    margin-right: 40px
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .player-speed-buttons
      width: 20%
      justify-content: center
      margin-right: 0
      margin-bottom: 5px
@media (max-width: 500px)
  #player:not(.fullscreen)
    .player-speed-buttons
      width: 40%
@media (max-width: 400px)
  #player:not(.fullscreen)
    .player-speed-buttons
      .deceleration-button,
      .acceleration-button
        width: 18px
        height: 11px
      .deceleration-button
        margin-right: 6px
        .deceleration-button-icon
          background-size: 18px 11px
      .acceleration-button
        margin-left: 6px
        .acceleration-button-icon
          background-size: 18px 11px
      .player-speed-text
        font-size: 14px
        line-height: 15px
</style>
