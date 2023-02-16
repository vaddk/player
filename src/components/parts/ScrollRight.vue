<script lang="ts" setup>
import { usePanel } from '../../stores/panel'

const panel = usePanel()
</script>

<template>
  <button
    type="button"
    class="scroll-right"
    title="Таймлайн вправо (ctrl + a.r)"
    @click.prevent.left="panel.moveTimeline(-0.09)"
    @pointerdown="panel.updateMoveTimeout(-0.2, true)"
    @pointerup="panel.removeMoveTimeout"
    @pointerleave="panel.removeMoveTimeout"
  >
    <span class="scroll-right-icon" />
  </button>
</template>

<style lang="sass" scoped>
.scroll-right
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
  .scroll-right-icon
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='29' height='25' viewBox='0 0 29 25' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.458252 6.4668C0.458252 3.15309 3.14454 0.466797 6.45825 0.466797H22.4583C25.772 0.466797 28.4583 3.15309 28.4583 6.4668V18.4668C28.4583 21.7805 25.772 24.4668 22.4583 24.4668H6.45825C3.14454 24.4668 0.458252 21.7805 0.458252 18.4668V6.4668ZM12.2654 8.59977C11.8748 8.20924 11.8807 7.57025 12.2712 7.17973C12.6617 6.7892 13.3007 6.78338 13.6912 7.1739L18.4783 11.961C18.8689 12.3515 18.8689 12.9847 18.4783 13.3752L18.0486 13.805C18.0275 13.8308 18.005 13.8558 17.9809 13.8799L13.1913 18.6695C12.8008 19.06 12.1618 19.0541 11.7712 18.6636C11.3807 18.2731 11.3748 17.634 11.7654 17.2435L16.3372 12.6716L12.2654 8.59977Z' fill='%23CCCCCC'/%3e%3c/svg%3e")
</style>
