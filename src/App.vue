<script setup lang="ts">
import { reactive, ref } from 'vue'

import { SETTINGS } from './settings'

import Player from './Player.vue'

const loaded = ref<boolean>(false)
const camera: any = reactive({
  name: SETTINGS.CAMERA_NAME,
})

const storage = localStorage.getItem('authData')
if (!storage) {
  login()
} else {
  const authData = JSON.parse(storage)
  getCameraData(authData.authToken, authData.apiKey)
}

async function login(): Promise<void> {
  const response = await fetch(SETTINGS.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({ login: SETTINGS.API_LOGIN, password: SETTINGS.API_PASS }),
  })
  const data = await response.json()
  if (response.ok) {
    if (!data.success) return
    const authToken: string = data.result.authToken
    const apiKey: string = data.result.apiKey
    localStorage.setItem('authData', JSON.stringify(data.result))
    getCameraData(authToken, apiKey)
  } else {
    console.error(response.statusText)
  }
}

async function getCameraData(token: string, key: string) {
  const response = await fetch(`${SETTINGS.API_URL}/${SETTINGS.CAMERA_NAME}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'x-vsaas-session': token,
      'x-vsaas-api-key': key,
    },
  })
  const data = await response.json()
  if (response.ok) {
    for (const key in data.result)
      camera[key] = data.result[key]
    loaded.value = true
  } else {
    console.error(response.statusText)
  }
}
</script>

<template>
  <main>
    <template v-if="loaded">
      <Player :camera="camera" />
    </template>
  </main>
</template>
