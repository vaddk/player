<script lang="ts" setup>
import { usePanel } from '../../stores/panel'

const panel = usePanel()
</script>

<template>
  <div
    v-show="panel.preview.display"
    class="timeline-preview-block"
    :style="{ top: `${panel.preview.style.top}px`, left: `${panel.preview.style.left}px` }"
  >
    <img :src="panel.preview.src" class="timeline-preview-img">
    <div class="timeline-preview-time">
      {{ panel.preview.text }}
    </div>
  </div>
</template>

<style lang="sass" scoped>
.timeline-preview-block
  position: fixed
  width: 266px
  height: 170px
  background: #cccccc
  border: 1px solid #18181b
  z-index: 100
  overflow: hidden
.timeline-preview-time
  width: 100%
  height: 20px
  position: absolute
  bottom: 0
  background-color: #403f49
  border-top: 1px solid #18181b
  box-shadow: rgb(0 0 0 / 10%) 0px 1px 10px 2px inset
  color: #fff
  font-size: 15px
  line-height: 15px
  padding: 3px 5px 0
  text-align: center
</style>
