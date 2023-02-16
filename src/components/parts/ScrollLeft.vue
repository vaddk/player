<script lang="ts" setup>
import { usePanel } from '../../stores/panel'

const panel = usePanel()
</script>

<template>
  <button
    type="button"
    class="scroll-left"
    title="Таймлайн влево (ctrl + a.l)"
    @click.prevent.left="panel.moveTimeline(0.09)"
    @pointerdown="panel.updateMoveTimeout(0.2, true)"
    @pointerup="panel.removeMoveTimeout"
    @pointerleave="panel.removeMoveTimeout"
  >
    <span class="scroll-left-icon" />
  </button>
</template>

<style lang="sass" scoped>
.scroll-left
  display: inline-block
  width: 31px
  height: 24px
  margin-top: 2px
  span
    display: block
    width: 100%
    height: 100%
    background-repeat: no-repeat
    background-size: contain
  .scroll-left-icon
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='29' height='25' viewBox='0 0 29 25' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M28.7268 6.4668C28.7268 3.15309 26.0405 0.466797 22.7268 0.466797H6.72681C3.4131 0.466797 0.726807 3.15309 0.726807 6.4668V18.4668C0.726807 21.7805 3.4131 24.4668 6.72681 24.4668H22.7268C26.0405 24.4668 28.7268 21.7805 28.7268 18.4668V6.4668ZM16.9197 8.59977C17.3102 8.20924 17.3044 7.57025 16.9139 7.17973C16.5234 6.7892 15.8844 6.78338 15.4938 7.1739L10.7067 11.961C10.3162 12.3515 10.3162 12.9847 10.7067 13.3752L11.1365 13.805C11.1575 13.8308 11.1801 13.8558 11.2041 13.8799L15.9937 18.6695C16.3843 19.06 17.0233 19.0541 17.4138 18.6636C17.8044 18.2731 17.8102 17.634 17.4197 17.2435L12.8478 12.6716L16.9197 8.59977Z' fill='%23CCCCCC'/%3e%3c/svg%3e")
</style>
