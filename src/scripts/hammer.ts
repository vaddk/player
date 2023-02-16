import type { App } from 'vue'

import Hammer from '@egjs/hammerjs'

const gestures = ['tap', 'pan', 'pinch', 'press', 'rotate', 'swipe']
const subGestures = ['panstart', 'panend', 'panmove', 'pancancel', 'pinchstart', 'pinchmove', 'pinchend', 'pinchcancel', 'pinchin', 'pinchout', 'pressup', 'rotatestart', 'rotatemove', 'rotateend', 'rotatecancel']
const directions = ['up', 'down', 'left', 'right', 'horizontal', 'vertical', 'all']

export default {
  config: {},
  install(app: App) {
    app.directive('hammer', {
      beforeMount: (el, binding) => {
        if (!el.hammer) el.hammer = new Hammer.Manager(el)
        const mc = el.hammer

        const event = binding.arg

        if (!event) throw new Error('[hammer] event type argument is required.')

        el.__hammerConfig = el.__hammerConfig || {}
        el.__hammerConfig[event] = {}

        const direction = binding.modifiers
        el.__hammerConfig[event].direction = el.__hammerConfig[event].direction || []
        if (Object.keys(direction).length) {
          Object.keys(direction)
            .filter(keyName => binding.modifiers[keyName])
            .forEach((keyName) => {
              const elDirectionArray = el.__hammerConfig[event].direction
              if (elDirectionArray.includes(keyName)) elDirectionArray.push(String(keyName))
            })
        }

        const recognizerType = gestures.find(gesture => gesture === event)
        const subGesturesType = subGestures.find(gesture => gesture === event)

        if (!recognizerType && !subGesturesType) throw new Error(`[hammer] invalid event type: ${event}`)

        if (subGesturesType && el.__hammerConfig[subGesturesType].direction.length !== 0) throw new Error(`[hammer] ${subGesturesType} should not have directions`)

        if (!recognizerType) return
        if ((recognizerType === 'tap'
          || recognizerType === 'pinch'
          || recognizerType === 'press'
          || recognizerType === 'rotate')
          && el.__hammerConfig[recognizerType].direction.length !== 0) throw new Error(`[hammer] ${recognizerType} should not have directions`)

        let recognizer = mc.get(recognizerType)
        if (!recognizer) {
          // @ts-expect-error: cant't get hammer key types
          recognizer = new Hammer[this.capitalize(recognizerType)]()
          recognizer.recognizeWith(mc.recognizers)
          mc.add(recognizer)
        }

        const localOptions = el.hammerOptions && el.hammerOptions[recognizerType]
        if (localOptions) {
          this.guardDirections(localOptions)
          recognizer.set(localOptions)
        }
      },
      mounted: (el, binding) => {
        const mc = el.hammer
        const event = binding.arg
        if (!event) return

        const eventWithDir = subGestures.find(subGes => subGes === event) ? event : this.buildEventWithDirections(event, el.__hammerConfig[event].direction)
        if (mc.handler) mc.off(eventWithDir, mc.handler)

        if (typeof binding.value !== 'function') {
          mc.handler = null
          console.warn(`[hammer] invalid handler function for v-hammer: ${binding.arg}`)
        } else {
          mc.on(eventWithDir, (mc.handler = binding.value))
        }
      },
      updated: (el, binding) => {
        const mc = el.hammer
        const event = binding.arg
        if (!event) return

        const eventWithDir = subGestures.find(subGes => subGes === event) ? event : this.buildEventWithDirections(event, el.__hammerConfig[event].direction)

        if (mc.handler) mc.off(eventWithDir, mc.handler)
        if (typeof binding.value !== 'function') {
          mc.handler = null
          console.warn(`[hammer] invalid handler function for v-hammer: ${binding.arg}`)
        } else {
          mc.on(eventWithDir, (mc.handler = binding.value))
        }
      },
      unmounted: (el, binding) => {
        const mc = el.hammer
        const event = binding.arg
        if (!event) return

        const eventWithDir = subGestures.find(subGes => subGes === event) ? event : this.buildEventWithDirections(event, el.__hammerConfig[event].direction)
        if (mc.handler) el.hammer.off(eventWithDir, mc.handler)
        if (!Object.keys(mc.handlers).length) {
          el.hammer.destroy()
          el.hammer = null
        }
      },
    })
  },
  guardDirections(options: any) {
    const dir = options.direction
    if (typeof dir === 'string') {
      const hammerDirection = `DIRECTION_${dir.toUpperCase()}`
      if (directions.includes(dir) && Object.prototype.hasOwnProperty.call(Hammer, hammerDirection)) {
        // @ts-expect-error: hammer keys...
        options.direction = Hammer[hammerDirection]
      } else {
        console.warn(`[hammer] invalid direction: ${dir}`)
      }
    }
  },
  buildEventWithDirections(eventName: string, directionArray: any): string {
    const event: any = {}
    directionArray.forEach((dir: string) => {
      dir = dir.toLowerCase()
      if (dir === 'horizontal') {
        event.left = 1
        event.right = 1
      } else if (dir === 'vertical') {
        event.up = 1
        event.down = 1
      } else if (dir === 'all') {
        event.left = 1
        event.right = 1
        event.up = 1
        event.down = 1
      } else {
        event[dir] = 1
      }
    })
    const _directionArray = Object.keys(event)
    if (_directionArray.length === 0) return eventName
    const eventWithDirArray = _directionArray.map(dir => eventName + dir)
    return eventWithDirArray.join(' ')
  },
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
}
