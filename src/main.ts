import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import hammer from './scripts/hammer'

const app = createApp(App)

app.use(createPinia())
app.use(hammer)

app.mount('#app')
