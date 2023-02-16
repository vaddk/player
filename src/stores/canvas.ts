import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCanvas = defineStore('playerCanvas', () => {
  const el = ref<HTMLCanvasElement | null>(null)
  const width = ref<number>(0)
  const height = ref<number>(0)
  const display = ref<boolean>(false)

  return {
    el,
    width,
    height,
    display,
  }
})
