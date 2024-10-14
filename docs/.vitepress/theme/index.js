// https://vitepress.dev/guide/custom-theme
import DefaultTheme, { VPHomeHero } from 'vitepress/theme'
import ImgZoom from './components/ImgZoom.vue'
import { plugin, defaultConfig } from '@formkit/vue'
import { pt } from '@formkit/i18n'
import Vue3Toastify, { toast } from 'vue3-toastify'

import './style.css'
import '@formkit/themes/genesis'
import 'vue3-toastify/dist/index.css'


export default {
  ...DefaultTheme,

  enhanceApp({ app, router, siteData }) {
    app.component('VPDocHero', VPHomeHero)
    app.component('ImgZoom', ImgZoom)
    app.use(plugin, defaultConfig({
        locales: { pt },
        locale: 'pt',
    }))
    app.use(Vue3Toastify, {
      autoClose: 3000,
      position: toast.POSITION.BOTTOM_CENTER
    })
  }
}
