<script lang="ts" setup>
import { ref } from 'vue'

import { onClickOutside } from '@vueuse/core'

import { usePanel } from '../../stores/panel'
import { useArchive } from '../../stores/archive'
import { useHls } from '../../stores/hls'

const panel = usePanel()
const archive = useArchive()
const hls = useHls()

const qualityEl = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setTimeout> | null, timeStamp: number
function onTouchStart(event: TouchEvent, target: string) {
  timeStamp = event.timeStamp
  if (!timer) timer = setTimeout(() => onLongTouch(target), 500)
}
function onTouchEnd(event: TouchEvent, target: string) {
  if (timer) clearTimeout(timer)
  if (event.timeStamp - timeStamp <= 300) {
    if (target === 'live') archive.setLive(true)
    else if (target === 'center') panel.setTimelinePosition()
  }
}
function onLongTouch(target: string) {
  timer = null
  if (target === 'live') archive.quality.display = true
  else if (target === 'center') panel.timeline.follow = !panel.timeline.follow
}

onClickOutside(qualityEl, () => archive.quality.display = false)
</script>

<template>
  <div class="live-control">
    <button
      type="button"
      class="center"
      :class="{ active: panel.timeline.follow }"
      title="Текущее положение (c)"
      @touchstart.prevent="onTouchStart($event, 'center')"
      @touchend.prevent="onTouchEnd($event, 'center')"
      @click.prevent="panel.setTimelinePosition()"
      @contextmenu.prevent="panel.timeline.follow = !panel.timeline.follow"
    />
    <div
      v-show="archive.quality.display"
      ref="qualityEl"
      class="quality"
    >
      <div class="title">
        Качество
      </div>
      <button
        type="button"
        class="quality-item"
        :class="{ active: archive.quality.current === 'best' }"
        :disabled="!archive.quality.list.includes('best')"
        @click.prevent="archive.changeQuality('best')"
      >
        Высокое
      </button>
      <button
        type="button"
        class="quality-item"
        :class="{ active: archive.quality.current === 'average' }"
        :disabled="!archive.quality.list.includes('average')"
        @click.prevent="archive.changeQuality('average')"
      >
        Среднее
      </button>
    </div>
    <button
      type="button"
      class="live"
      :class="{
        active: archive.live && !hls.fatal.current,
        dropdown: archive.quality.display,
      }"
      title="Онлайн (L)"
      @touchstart.prevent="onTouchStart($event, 'live')"
      @touchend.prevent="onTouchEnd($event, 'live')"
      @click.prevent="archive.setLive(true)"
      @contextmenu.prevent="archive.quality.display = true"
    >
      <span>LIVE</span>
      <span class="arrow" />
    </button>
  </div>
</template>

<style lang="sass" scoped>
.live-control
  display: inline-flex
  position: relative
  margin-right: 22px
  .center
    display: inline-block
    width: 20px
    min-width: 20px
    height: 20px
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='980.000000pt' height='980.000000pt' viewBox='0 0 980.000000 980.000000' preserveAspectRatio='xMidYMid meet'%3e%3cg transform='translate(0.000000,980.000000) scale(0.100000,-0.100000)' fill='%23ffffff' stroke='none'%3e%3cpath d='M4792 9785 c-75 -21 -108 -41 -169 -97 -117 -111 -133 -171 -133 -489 l0 -236 -132 -17 c-1355 -178 -2541 -1039 -3138 -2278 -183 -382 -306 -785 -362 -1195 l-23 -163 -227 0 c-130 0 -250 -5 -280 -11 -214 -46 -357 -253 -321 -465 28 -165 157 -298 321 -333 30 -6 150 -11 280 -11 l227 0 23 -163 c250 -1811 1715 -3253 3535 -3477 l97 -12 0 -223 c0 -122 5 -247 10 -276 24 -127 113 -244 225 -295 212 -97 439 -16 542 194 l38 76 3 261 4 262 156 22 c265 37 489 89 737 173 1323 445 2339 1555 2665 2913 32 131 74 370 85 478 l7 67 229 0 c128 0 251 5 281 11 211 44 357 258 319 466 -31 168 -155 297 -319 332 -30 6 -150 11 -282 11 l-228 0 -7 53 c-44 344 -108 620 -212 912 -56 158 -99 258 -183 430 -392 799 -1039 1448 -1846 1853 -396 198 -920 354 -1336 397 l-68 7 0 223 c0 249 -7 303 -50 391 -81 165 -290 259 -468 209z m448 -1636 c664 -71 1268 -331 1780 -765 93 -79 306 -294 386 -389 417 -498 668 -1092 745 -1765 16 -139 16 -516 0 -660 -74 -677 -339 -1293 -772 -1795 -84 -98 -289 -301 -384 -381 -783 -660 -1852 -910 -2860 -669 -1166 279 -2101 1196 -2395 2351 -76 295 -103 514 -103 824 0 310 27 529 103 824 248 973 962 1797 1895 2188 345 145 694 224 1105 252 85 6 394 -3 500 -15z'/%3e%3cpath d='M4659 6515 c-690 -112 -1212 -609 -1361 -1295 -19 -91 -22 -134 -22 -320 0 -186 3 -229 23 -320 112 -517 438 -934 906 -1156 113 -54 240 -96 375 -126 91 -19 134 -22 320 -22 186 0 229 3 320 23 154 33 280 77 417 146 154 78 261 155 387 275 250 241 403 516 478 860 19 91 22 134 22 320 0 186 -3 229 -22 320 -75 344 -227 618 -478 860 -219 212 -490 354 -799 420 -130 28 -437 36 -566 15z'/%3e%3c/g%3e%3c/svg%3e")
    background-repeat: no-repeat
    background-size: cover
    cursor: pointer
    transition: background-image 0.2s
    margin-right: 20px
    &.active
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='980.000000pt' height='980.000000pt' viewBox='0 0 980.000000 980.000000' preserveAspectRatio='xMidYMid meet'%3e%3cg transform='translate(0.000000,980.000000) scale(0.100000,-0.100000)' fill='%23ff9800' stroke='none'%3e%3cpath d='M4792 9785 c-75 -21 -108 -41 -169 -97 -117 -111 -133 -171 -133 -489 l0 -236 -132 -17 c-1355 -178 -2541 -1039 -3138 -2278 -183 -382 -306 -785 -362 -1195 l-23 -163 -227 0 c-130 0 -250 -5 -280 -11 -214 -46 -357 -253 -321 -465 28 -165 157 -298 321 -333 30 -6 150 -11 280 -11 l227 0 23 -163 c250 -1811 1715 -3253 3535 -3477 l97 -12 0 -223 c0 -122 5 -247 10 -276 24 -127 113 -244 225 -295 212 -97 439 -16 542 194 l38 76 3 261 4 262 156 22 c265 37 489 89 737 173 1323 445 2339 1555 2665 2913 32 131 74 370 85 478 l7 67 229 0 c128 0 251 5 281 11 211 44 357 258 319 466 -31 168 -155 297 -319 332 -30 6 -150 11 -282 11 l-228 0 -7 53 c-44 344 -108 620 -212 912 -56 158 -99 258 -183 430 -392 799 -1039 1448 -1846 1853 -396 198 -920 354 -1336 397 l-68 7 0 223 c0 249 -7 303 -50 391 -81 165 -290 259 -468 209z m448 -1636 c664 -71 1268 -331 1780 -765 93 -79 306 -294 386 -389 417 -498 668 -1092 745 -1765 16 -139 16 -516 0 -660 -74 -677 -339 -1293 -772 -1795 -84 -98 -289 -301 -384 -381 -783 -660 -1852 -910 -2860 -669 -1166 279 -2101 1196 -2395 2351 -76 295 -103 514 -103 824 0 310 27 529 103 824 248 973 962 1797 1895 2188 345 145 694 224 1105 252 85 6 394 -3 500 -15z'/%3e%3cpath d='M4659 6515 c-690 -112 -1212 -609 -1361 -1295 -19 -91 -22 -134 -22 -320 0 -186 3 -229 23 -320 112 -517 438 -934 906 -1156 113 -54 240 -96 375 -126 91 -19 134 -22 320 -22 186 0 229 3 320 23 154 33 280 77 417 146 154 78 261 155 387 275 250 241 403 516 478 860 19 91 22 134 22 320 0 186 -3 229 -22 320 -75 344 -227 618 -478 860 -219 212 -490 354 -799 420 -130 28 -437 36 -566 15z'/%3e%3c/g%3e%3c/svg%3e")
  .live
    display: flex
    align-items: center
    position: relative
    font-size: 15px
    line-height: 14px
    font-weight: 500
    color: #ffffff
    transition: color 0.2s
    &::before
      content: ""
      display: inline-block
      width: 6px
      height: 6px
      position: absolute
      left: -10px
      top: calc(50% - 3px)
      border-radius: 50%
      background-color: #ffffff
      transition: background-color 0.2s
    .arrow
      display: inline-block
      width: 11px
      height: 6px
      margin-left: 4px
      background: #ffffff
      mask-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='11' height='6' viewBox='0 0 11 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M10.1406 1.26807L5.64063 5.26807L1.14062 1.26807' stroke='%234A77CD'/%3e%3c/svg%3e")
      -webkit-mask-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='11' height='6' viewBox='0 0 11 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M10.1406 1.26807L5.64063 5.26807L1.14062 1.26807' stroke='%234A77CD'/%3e%3c/svg%3e")
      transition: transform 0.15s
  .live.active
    color: #FF4B55
    &::before
      background-color: #FF4B55
      animation: blink 1.5s ease infinite
  .live.dropdown
    .arrow
      transform: rotate(180deg)
  .quality
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
      font-size: 17px
      line-height: 17px
      color: #ffffff
      text-align: center
      border-bottom: 1px solid #62626A
      margin-bottom: 7px
    .quality-item
      display: block
      width: 100%
      font-size: 17px
      line-height: 17px
      color: #C4C4C4
      margin-bottom: 7px
      &.active
        color: #FFFFFF
        font-weight: 500
    .quality-item[disabled]
      text-decoration: line-through
@media (min-width: 1900px)
  .live-control
    margin-right: 40px
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .live-control
      width: 30%
      margin-right: 0
      margin-bottom: 5px
@media (max-width: 500px)
  #player:not(.fullscreen)
    .live-control
      width: 30%
@media (max-width: 400px)
  .live-control
    .center
      margin-right: 15px
    .live
      font-size: 13px
@keyframes blink
  0%
    background-color: #FF4B55
  50%
    background-color: #ffffff
  100%
    background-color: #FF4B55
</style>
