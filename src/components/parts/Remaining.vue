<script lang="ts" setup>
import { inject, ref } from 'vue'

import { useToast } from '@vaddk/toastification'

import { useVideo } from '../../stores/video'
import { usePanel } from '../../stores/panel'
import { useArchive } from '../../stores/archive'

interface Params {
  start: number
  end: number
}

const $toast = useToast()

const playerCamId = inject('playerCamId')

const video = useVideo()
const panel = usePanel()
const archive = useArchive()

const params = ref<boolean | Params>(false)
const processing = ref<boolean>(false)

async function downloadFragment(): Promise<void> {
  params.value = checkParams()
  if (typeof params.value !== 'object') return

  // @ts-expect-error: window csrf
  if (!window.CSRF) {
    window.location.href = `${archive.camera.host}/vsaas/api/cameras/${archive.camera.name}/dvr/download?start=${params.value.start}&end=${params.value.end}&token=${archive.camera.token}&p=site`
    return
  }

  processing.value = true
  const response = await fetch(`${window.location.origin}/ajax/streamers/download-session/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      // @ts-expect-error: window csrf
      'X-CSRF-Token': window.CSRF,
    },
    body: JSON.stringify({ cameraId: playerCamId }),
  })
  const data = await response.json()
  if (response.ok) {
    const sessionId = data.result
    window.location.href = `${archive.camera.host}/vsaas/api/cameras/${archive.camera.name}/dvr/download?start=${params.value.start}&end=${params.value.end}&token=${archive.camera.token}&p=site&downloadSessionId=${sessionId}`
    params.value = false
  } else {
    console.error(response.statusText)
  }
  processing.value = false
}

function checkParams(): boolean | Params {
  if (archive.camera.blocked) {
    $toast.error('Доступ к архиву запрещен')
    return false
  }
  if (!panel.fragment.start.date || !panel.fragment.end.date) {
    $toast.error('Обозначьте интервал')
    return false
  }
  if (panel.fragment.start.date > panel.fragment.end.date) {
    $toast.error('Начальное время не может быть больше конечного')
    return false
  }
  if (panel.fragment.end.date - panel.fragment.start.date > 3600000) {
    $toast.error('Максимальный допустимый интервал - 1 час')
    return false
  }
  const start = Math.floor(panel.fragment.start.date / 1000)
  const end = Math.floor(panel.fragment.end.date / 1000)
  return { start, end }
}
</script>

<template>
  <div class="remaining-buttons">
    <div class="scissor-buttons">
      <button
        v-show="panel.fragment.display"
        class="download-fragment"
        title="Загрузить фрагмент"
        :disabled="processing"
        @click.prevent="downloadFragment"
      >
        <span class="download-fragment-icon" />
      </button>
      <button
        v-show="panel.fragment.display"
        class="cancel-download-fragment"
        title="Отмена (d)"
        @click.prevent="panel.cancelDownload"
      >
        ×
      </button>
      <button
        v-show="!panel.fragment.display"
        class="scissor-btn"
        title="Загрузка (d)"
        @click.prevent="panel.startDownload"
      >
        <span class="scissor-btn-icon" />
      </button>
    </div>
    <button
      type="button"
      class="screenshoot-button"
      title="Скриншот (s)"
      @click.prevent="panel.screenshoot"
    />
    <button
      type="button"
      class="fullscreen-btn"
      :title="video.fullscreen ? 'Свернуть (f)' : 'Полный экран (f)'"
      @click.prevent="video.fullscreen = !video.fullscreen"
    >
      <span :class="video.fullscreen ? 'exit-fullscreen' : 'enter-fullscreen'" />
    </button>
  </div>
</template>

<style lang="sass" scoped>
.remaining-buttons
  display: inline-flex
  align-items: center
  margin-left: auto
  .scissor-buttons
    display: inline-flex
    align-items: center
    width: auto
    height: 24px
    .download-fragment
      display: inline-block
      width: 24px
      height: 24px
      margin-right: 5px
      &[disabled]
        opacity: 0.7
      .download-fragment-icon
        display: block
        width: 100%
        height: 100%
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M16.2929 9.29289L13 12.5858V2H11V12.5858L7.7071 9.29289L6.29289 10.7071L12 16.4142L17.7071 10.7071L16.2929 9.29289ZM22 20V16H20V20H4V16H2V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20Z' fill='white'/%3e%3c/svg%3e")
        background-repeat: no-repeat
        background-size: cover
    .cancel-download-fragment
      display: inline-block
      width: 20px
      font-size: 28px
      line-height: 28px
      color: #fff
      margin-right: 5px
    .scissor-btn
      display: inline-block
      width: 22px
      height: 22px
      position: relative
      top: 2px
      margin-right: 8px
      .scissor-btn-icon
        display: block
        width: 100%
        height: 100%
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg fill='%23ffffff' height='512pt' viewBox='0 -8 512 512' width='512pt' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m512 80v131c0 11.046875-8.953125 20-20 20s-20-8.953125-20-20v-131c0-22.054688-17.945312-40-40-40h-352c-22.054688 0-40 17.945312-40 40v311c0 22.054688 17.945312 40 40 40h137c11.046875 0 20 8.953125 20 20s-8.953125 20-20 20h-137c-44.113281 0-80-35.886719-80-80v-311c0-44.113281 35.886719-80 80-80h352c44.113281 0 80 35.886719 80 80zm-415 276c-11.046875 0-20 8.953125-20 20s8.953125 20 20 20 20-8.953125 20-20-8.953125-20-20-20zm80 0c-11.046875 0-20 8.953125-20 20s8.953125 20 20 20 20-8.953125 20-20-8.953125-20-20-20zm-60-251c0-11.046875-8.953125-20-20-20s-20 8.953125-20 20 8.953125 20 20 20 20-8.953125 20-20zm80 0c0-11.046875-8.953125-20-20-20s-20 8.953125-20 20 8.953125 20 20 20 20-8.953125 20-20zm80 0c0-11.046875-8.953125-20-20-20s-20 8.953125-20 20 8.953125 20 20 20 20-8.953125 20-20zm60 20c11.046875 0 20-8.953125 20-20s-8.953125-20-20-20-20 8.953125-20 20 8.953125 20 20 20zm100-20c0-11.046875-8.953125-20-20-20s-20 8.953125-20 20 8.953125 20 20 20 20-8.953125 20-20zm75 214c0 33.085938-26.914062 60-60 60-26.074219 0-48.304688-16.722656-56.558594-40h-40.441406v40.441406c23.277344 8.253906 40 30.484375 40 56.558594 0 33.085938-26.914062 60-60 60s-60-26.914062-60-60c0-26.074219 16.722656-48.304688 40-56.558594v-40.441406h-82c-11.046875 0-20-8.953125-20-20s8.953125-20 20-20h82v-82c0-11.046875 8.953125-20 20-20s20 8.953125 20 20v82h40.441406c8.253906-23.277344 30.484375-40 56.558594-40 33.085938 0 60 26.914062 60 60zm-157 117c0-11.027344-8.972656-20-20-20s-20 8.972656-20 20 8.972656 20 20 20 20-8.972656 20-20zm117-117c0-11.027344-8.972656-20-20-20s-20 8.972656-20 20 8.972656 20 20 20 20-8.972656 20-20zm0 0'/%3e%3c/svg%3e")
        background-repeat: no-repeat
        background-size: cover
  .screenshoot-button
    width: 26px
    height: 22px
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M21 5C22.1046 5 23 5.89543 23 7V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3H9.00001C10.12 3 10.8329 3.47545 11.549 4.37885C11.5688 4.40385 11.6171 4.46608 11.6706 4.535L11.6707 4.53515C11.7461 4.63236 11.8319 4.74283 11.8625 4.78082C11.8935 4.81925 11.9196 4.85103 11.9412 4.8773L11.9412 4.87732C12.0292 4.98428 12.0419 4.99978 12.0018 5H21ZM2.99988 19.0002H20.9999V7.00024L11.9945 7.00023C11.2764 6.99638 10.8086 6.66015 10.3057 6.03678C10.2601 5.9803 10.1494 5.8376 10.0691 5.73399L10.069 5.73386C10.027 5.6797 9.99324 5.63625 9.98148 5.6214C9.6069 5.14881 9.38412 5.00024 8.99988 5.00024H2.99988V19.0002ZM14.9999 12.9998C14.9999 14.6566 13.6567 15.9998 11.9999 15.9998C10.343 15.9998 8.99988 14.6566 8.99988 12.9998C8.99988 11.3429 10.343 9.99976 11.9999 9.99976C13.6567 9.99976 14.9999 11.3429 14.9999 12.9998ZM7 13.0002C7 15.7617 9.23857 18.0002 12 18.0002C14.7614 18.0002 17 15.7617 17 13.0002C17 10.2388 14.7614 8.00024 12 8.00024C9.23857 8.00024 7 10.2388 7 13.0002ZM17.9999 9.00024C17.9999 9.55253 18.4476 10.0002 18.9999 10.0002C19.5522 10.0002 19.9999 9.55253 19.9999 9.00024C19.9999 8.44796 19.5522 8.00024 18.9999 8.00024C18.4476 8.00024 17.9999 8.44796 17.9999 9.00024Z' fill='white'/%3e%3c/svg%3e")
    background-size: 22px auto
    background-repeat: no-repeat
    background-position: center center
    margin-right: 5px
  .fullscreen-btn
    display: inline-block
    width: 24px
    height: 24px
    span
      display: block
      width: 100%
      height: 100%
      background-repeat: no-repeat
      background-size: cover
      &.exit-fullscreen
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg version='1.1' fill='white' baseProfile='tiny' id='Слой_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24 24' overflow='visible' xml:space='preserve'%3e%3cpath fill-rule='evenodd' d='M22,8h-4.2c-1,0-1.8-0.9-1.8-2V2h2v4h4V8z M6.2,16H2v2h4v4h2v-4C8,16.9,7.2,16,6.2,16z M22,18v-2h-4.2 c-1,0-1.8,0.9-1.8,2v4h2v-4H22z M2,6v2h4.2C7.2,8,8,7.1,8,6V2H6v4H2z'/%3e%3c/svg%3e")
      &.enter-fullscreen
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M16 2H20.1818C21.186 2 22 2.89543 22 4V8H20V4H16V2ZM3.81818 22H8V20H4V16H2V20C2 21.1046 2.81403 22 3.81818 22ZM16 20V22H20.1818C21.186 22 22 21.1046 22 20V16H20V20H16ZM8 4V2H3.81818C2.81403 2 2 2.89543 2 4V8H4V4H8Z'/%3e%3c/svg%3e")
@media (max-width: 1300px)
  #player:not(.fullscreen)
    .remaining-buttons
      order: 3
      width: 33%
      justify-content: flex-end
      margin-left: 0
@media (max-width: 400px)
  #player:not(.fullscreen)
    .remaining-buttons
      .scissor-buttons
        height: 22px
        .download-fragment
          width: 22px
          height: 22px
        .cancel-download-fragment
          width: 18px
          font-size: 26px
          line-height: 26px
        .scissor-btn
          width: 20px
          height: 20px
          margin-right: 6px
      .screenshoot-button
        width: 24px
        height: 20px
        background-size: 20px auto
        margin-right: 3px
      .fullscreen-btn
        width: 20px
        height: 24px
        img
          width: 20px
          height: 20px
</style>
