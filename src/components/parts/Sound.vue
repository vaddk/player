<script lang="ts" setup>
import { computed } from 'vue'

import { useVideo } from '../../stores/video'

const video = useVideo()

const soundLevel = computed({
  get() { return video.sound.level },
  set(value) {
    video.sound.level = +value
    if (video.sound.level > 0) video.muted = false
    else video.muted = true
  },
})
</script>

<template>
  <div
    v-if="video.sound.display"
    class="player-sound-control"
  >
    <button
      type="button"
      class="min-sound-btn"
      title="Без звука (v)"
      @click.prevent="video.minSound"
    >
      <span class="min-sound-icon" />
    </button>
    <input
      v-model="soundLevel"
      type="range"
      min="0"
      max="1"
      step="0.1"
      class="sound-level"
      :title="String(soundLevel * 100)"
    >
    <button
      type="button"
      class="max-sound-btn"
      title="Максимум (v)"
      @click.prevent="video.maxSound"
    >
      <span class="max-sound-icon" />
    </button>
  </div>
</template>

<style lang="sass" scoped>
.player-sound-control
  display: inline-flex
  align-items: center
  .min-sound-btn
    display: inline-block
    width: 15px
    height: 16px
    .min-sound-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='7' height='10' viewBox='0 0 7 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M6.40974 0.911255L3.01921 3.45415H0.476318V7.12722H2.7361L6.40974 9.67011V0.911255Z' fill='white'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: contain
  .max-sound-btn
    display: inline-block
    width: 21px
    height: 18px
    margin-left: 4px
    .max-sound-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='15' height='13' viewBox='0 0 15 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.3857 0.204072C12.2625 0.0455519 11.9889 -0.0297311 11.8337 0.0961193C11.6788 0.221686 11.5951 0.500659 11.7181 0.659179C12.9768 2.27705 13.6421 4.22645 13.6421 6.29659C13.6421 8.36702 12.9768 10.3164 11.7181 11.9343C11.5951 12.0928 11.6788 12.3718 11.8337 12.4974C11.8998 12.5508 12.0262 12.528 12.1042 12.528C12.2099 12.528 12.315 12.4806 12.3857 12.3894C13.7459 10.6406 14.465 8.53378 14.465 6.29659C14.465 4.0597 13.7459 1.95291 12.3857 0.204072ZM10.4133 1.89294C10.2904 1.73697 10.0309 1.68356 9.87852 1.81055C9.72701 1.93725 9.60971 2.19549 9.73267 2.35117C10.6072 3.45967 11.0886 4.85795 11.0886 6.28776C11.0886 7.71785 10.6072 9.11584 9.73267 10.2243C9.60971 10.38 9.71769 10.6383 9.86919 10.765C9.93477 10.8198 10.0606 10.817 10.1386 10.817C10.2417 10.817 10.3435 10.7712 10.4133 10.6826C11.3893 9.44481 11.927 7.88432 11.927 6.28776C11.927 4.69147 11.3893 3.1307 10.4133 1.89294ZM7.83194 3.51423C7.67761 3.6415 7.56172 3.86564 7.69316 4.01479C8.25085 4.6483 8.55782 5.45539 8.55782 6.28748C8.55782 7.11986 8.25085 7.92695 7.69316 8.56017C7.56172 8.70932 7.67761 8.93375 7.83194 9.06074C7.90091 9.11784 7.98571 9.14596 8.06938 9.14596C8.17312 9.14596 8.27601 9.10335 8.34865 9.02125C9.01912 8.25961 9.38857 7.2886 9.38857 6.28748C9.38857 5.28636 9.01912 4.31564 8.34865 3.554C8.21749 3.40486 7.98599 3.38639 7.83194 3.51423ZM5.75716 2.1259L2.49411 4.58524H0.0561523V8.27836H2.37963L5.75716 10.8243C5.88153 10.9181 5.98329 10.867 5.98329 10.7107V2.23953C5.98329 2.08329 5.88153 2.03215 5.75716 2.1259Z' fill='white'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: cover
  .sound-level
    width: 50px
    height: 2px
    border-radius: 2px
    -webkit-appearance: none
    -moz-appearance: auto
    appearance: none
    outline: none
    cursor: pointer
  .sound-level::-webkit-slider-thumb
    width: 11px
    height: 11px
    background: #ffffff
    cursor: pointer
    border-radius: 50%
    -webkit-appearance: none
    -moz-appearance: none
    appearance: none
    outline: none
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .player-sound-control
      order: 2
      width: 34%
      justify-content: center
@media (max-width: 400px)
  #player:not(.fullscreen)
    .player-sound-control
      .min-sound-btn
        width: 13px
        height: 14px
      .max-sound-btn
        width: 19px
        height: 16px
      .sound-level::-webkit-slider-thumb
        width: 10px
        height: 10px
</style>
