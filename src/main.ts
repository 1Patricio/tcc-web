import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { Quasar, Dialog, Notify } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import langPtBr from 'quasar/lang/pt-BR'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const customLang = {
  ...langPtBr,
  table: {
    ...langPtBr.table,
    noData: 'Nenhum registro encontrado',
    loading: 'Carregando...',
    rowsPerPage: 'Itens por página'
  }
}

app.use(Quasar, {
  plugins: { Dialog, Notify },
  lang: customLang,
  config: {
    brand: {
      primary: '#003366',
      secondary: '#C6A75E',
      terciary: '#1C1C1C',
      accent: '#8B5E3C'
    }
  }
})

app.mount('#app')
