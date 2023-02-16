<script lang="ts" setup>
import { computed, watch } from 'vue'

import { usePanel } from '../../stores/panel'

const panel = usePanel()

const startHours = computed({
  get() { return panel.fragment.start.hours },
  set(value) { panel.fragment.start.hours = value },
})
const startMinutes = computed({
  get() { return panel.fragment.start.minutes },
  set(value) { panel.fragment.start.minutes = value },
})
const startSeconds = computed({
  get() { return panel.fragment.start.seconds },
  set(value) { panel.fragment.start.seconds = value },
})
const endHours = computed({
  get() { return panel.fragment.end.hours },
  set(value) { panel.fragment.end.hours = value },
})
const endMinutes = computed({
  get() { return panel.fragment.end.minutes },
  set(value) { panel.fragment.end.minutes = value },
})
const endSeconds = computed({
  get() { return panel.fragment.end.seconds },
  set(value) { panel.fragment.end.seconds = value },
})

watch(startHours, (val) => {
  if (+val > 23) startHours.value = '23'
  if (+val < 0) startHours.value = '00'
})
watch(startMinutes, (val) => {
  if (+val > 60) startMinutes.value = '59'
  if (+val < 0) startMinutes.value = '00'
})
watch(startSeconds, (val) => {
  if (+val > 60) startSeconds.value = '59'
  if (+val < 0) startSeconds.value = '00'
})

watch(endHours, (val) => {
  if (+val > 23) endHours.value = '23'
  if (+val < 0) endHours.value = '00'
})
watch(endMinutes, (val) => {
  if (+val > 60) endMinutes.value = '59'
  if (+val < 0) endMinutes.value = '00'
})
watch(endSeconds, (val) => {
  if (+val > 60) endSeconds.value = '59'
  if (+val < 0) endSeconds.value = '00'
})
</script>

<template>
  <div v-show="panel.fragment.display" class="fragment-time">
    <div class="start-fragment-time">
      <input
        v-model="startHours"
        type="number"
        name="start-fragment-hours"
        min="0"
        max="23"
        placeholder="00"
        @blur="panel.updateFragment('start')"
        @keypress.enter="panel.updateFragment('start')"
      >
      <span>:</span>
      <input
        v-model="startMinutes"
        type="number"
        name="start-fragment-minutes"
        min="0"
        max="59"
        placeholder="00"
        @blur="panel.updateFragment('start')"
        @keypress.enter="panel.updateFragment('start')"
      >
      <span>:</span>
      <input
        v-model="startSeconds"
        type="number"
        name="start-fragment-seconds"
        min="0"
        max="60"
        placeholder="00"
        @blur="panel.updateFragment('start')"
        @keypress.enter="panel.updateFragment('start')"
      >
    </div>
    <span>-</span>
    <div class="end-fragment-time">
      <input
        v-model="endHours"
        type="number"
        name="end-fragment-hours"
        placeholder="00"
        min="0"
        max="23"
        @blur="panel.updateFragment('end')"
        @keypress.enter="panel.updateFragment('end')"
      >
      <span>:</span>
      <input
        v-model="endMinutes"
        type="number"
        name="end-fragment-minutes"
        placeholder="00"
        min="0"
        max="59"
        @blur="panel.updateFragment('end')"
        @keypress.enter="panel.updateFragment('end')"
      >
      <span>:</span>
      <input
        v-model="endSeconds"
        type="number"
        name="end-fragment-seconds"
        placeholder="00"
        min="0"
        max="60"
        @blur="panel.updateFragment('end')"
        @keypress.enter="panel.updateFragment('end')"
      >
    </div>
  </div>
</template>

<style lang="sass" scoped>
.fragment-time
  width: 220px
  height: 30px
  padding: 0 5px
  display: flex
  align-items: center
  justify-content: space-around
  position: absolute
  top: -35px
  right: 10px
  background-color: #403f49
  box-shadow: rgb(0 0 0 / 10%) 0px 1px 3px 2px inset
  border-radius: 2px
  font-size: 16px
  line-height: 16px
  color: #ffffff
</style>
