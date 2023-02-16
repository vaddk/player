<script lang="ts" setup>
import { usePanel } from '../../stores/panel'

const panel = usePanel()
</script>

<template>
  <div class="timeline-buttons">
    <button
      type="button"
      class="scroll-timeline-btn left-scroll-btn"
      title="Таймлайн влево (ctrl + a.l)"
      @click.prevent.left="panel.moveTimeline(0.09)"
      @pointerdown="panel.updateMoveTimeout(0.2, true)"
      @pointerup="panel.removeMoveTimeout"
      @pointerleave="panel.removeMoveTimeout"
    >
      <span class="left-scroll-icon" />
    </button>
    <button
      type="button"
      class="zoom-timeline-btn decrease-zoom-btn"
      title="Уменьшить зум (ctrl + a.d)"
      @click.prevent="panel.zoomOutTimeline(0.2)"
      @pointerdown="panel.updateZoomTimeout({ value: 0.2, type: 'Out' }, true)"
      @pointerup="panel.removeZoomTimeout"
      @pointerleave="panel.removeZoomTimeout"
    >
      <span class="decrease-zoom-icon" />
    </button>
    <button
      type="button"
      class="zoom-timeline-btn increase-zoom-btn"
      title="Увеличить зум (ctrl + a.u)"
      @click.prevent="panel.zoomInTimeline(0.2)"
      @pointerdown="panel.updateZoomTimeout({ value: 0.2, type: 'In' }, true)"
      @pointerup="panel.removeZoomTimeout"
      @pointerleave="panel.removeZoomTimeout"
    >
      <span class="increase-zoom-icon" />
    </button>
    <button
      type="button"
      class="scroll-timeline-btn right-scroll-btn"
      title="Таймлайн вправо (ctrl + a.r)"
      @click.prevent.right="panel.moveTimeline(-0.09)"
      @pointerdown="panel.updateMoveTimeout(-0.2, true)"
      @pointerup="panel.removeMoveTimeout"
      @pointerleave="panel.removeMoveTimeout"
    >
      <span class="right-scroll-icon" />
    </button>
  </div>
</template>

<style lang="sass" scoped>
.timeline-buttons
  display: inline-flex
  align-items: center
  margin-right: 25px
  .scroll-timeline-btn
    display: inline-block
    width: 10px
    height: 18px
    .left-scroll-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='14' height='23' viewBox='0 0 14 23' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.3923 3.15596C12.7828 2.76543 12.7828 2.13227 12.3923 1.74175L11.3576 0.707098C10.9671 0.316574 10.334 0.316573 9.94343 0.707097L0.707105 9.94342C0.316581 10.3339 0.316581 10.9671 0.707105 11.3576L2.44886 13.0994L12.3923 3.15596Z' fill='white'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.3923 3.15596C12.7828 2.76543 12.7828 2.13227 12.3923 1.74175L11.3576 0.707098C10.9671 0.316574 10.334 0.316573 9.94343 0.707097L0.707105 9.94342C0.316581 10.3339 0.316581 10.9671 0.707105 11.3576L2.44886 13.0994L12.3923 3.15596Z' fill='white'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.802 21.465C11.1925 21.8555 11.8256 21.8555 12.2162 21.465L13.251 20.4302C13.6415 20.0397 13.6415 19.4065 13.251 19.016L4.01037 9.77537C3.61984 9.38485 2.98668 9.38485 2.59615 9.77537L1.56134 10.8102C1.17082 11.2007 1.17082 11.8339 1.56134 12.2244L10.802 21.465Z' fill='white'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.802 21.465C11.1925 21.8555 11.8256 21.8555 12.2162 21.465L13.251 20.4302C13.6415 20.0397 13.6415 19.4065 13.251 19.016L4.01037 9.77537C3.61984 9.38485 2.98668 9.38485 2.59615 9.77537L1.56134 10.8102C1.17082 11.2007 1.17082 11.8339 1.56134 12.2244L10.802 21.465Z' fill='white'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: cover
    .right-scroll-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='14' height='23' viewBox='0 0 14 23' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.56578 3.15596C1.17526 2.76543 1.17526 2.13227 1.56578 1.74175L2.60043 0.707098C2.99095 0.316574 3.62412 0.316573 4.01464 0.707097L13.251 9.94342C13.6415 10.3339 13.6415 10.9671 13.251 11.3576L11.5092 13.0994L1.56578 3.15596Z' fill='white'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.56578 3.15596C1.17526 2.76543 1.17526 2.13227 1.56578 1.74175L2.60043 0.707098C2.99095 0.316574 3.62412 0.316573 4.01464 0.707097L13.251 9.94342C13.6415 10.3339 13.6415 10.9671 13.251 11.3576L11.5092 13.0994L1.56578 3.15596Z' fill='white'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.15611 21.465C2.76559 21.8555 2.13242 21.8555 1.7419 21.465L0.707088 20.4302C0.316564 20.0397 0.316564 19.4065 0.707088 19.016L9.9477 9.77537C10.3382 9.38485 10.9714 9.38485 11.3619 9.77537L12.3967 10.8102C12.7872 11.2007 12.7872 11.8339 12.3967 12.2244L3.15611 21.465Z' fill='white'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.15611 21.465C2.76559 21.8555 2.13242 21.8555 1.7419 21.465L0.707088 20.4302C0.316564 20.0397 0.316564 19.4065 0.707088 19.016L9.9477 9.77537C10.3382 9.38485 10.9714 9.38485 11.3619 9.77537L12.3967 10.8102C12.7872 11.2007 12.7872 11.8339 12.3967 12.2244L3.15611 21.465Z' fill='white'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: cover
  .zoom-timeline-btn
    display: inline-block
    width: 18px
    height: 18px
    .decrease-zoom-icon
      display: block
      width: 100%
      height: 4px
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='4' viewBox='0 0 20 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M20 0V3.5L0 3.5V0L20 0Z' fill='%23ffffff'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: cover
    .increase-zoom-icon
      display: block
      width: 100%
      height: 100%
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='21' viewBox='0 0 20 21' fill='%23ffffff' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 0H11.5V20.2797H8V0Z'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M20 8.27063V11.7706L0 11.7706V8.27063L20 8.27063Z'/%3e%3c/svg%3e")
      background-repeat: no-repeat
      background-size: cover
  .left-scroll-btn,
  .decrease-zoom-btn,
  .increase-zoom-btn
    margin-right: 8px
@media (min-width: 1900px)
  .timeline-buttons
    margin-right: 40px
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .timeline-buttons
      width: 30%
      justify-content: flex-end
      margin-right: 0
      margin-bottom: 5px
@media (max-width: 500px)
  #player:not(.fullscreen)
    .timeline-buttons
      display: none
@media (max-width: 400px)
  #player:not(.fullscreen)
    .timeline-buttons
      .scroll-timeline-btn
        width: 9px
        height: 16px
      .zoom-timeline-btn
        width: 16px
        height: 16px
      .left-scroll-btn,
      .decrease-zoom-btn,
      .increase-zoom-btn
        margin-right: 6px
</style>
