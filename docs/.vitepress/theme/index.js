// https://vitepress.dev/guide/custom-theme
import DefaultTheme, { VPHomeHero } from 'vitepress/theme'
import layout from './Layout.vue'
import ImgZoom from './components/ImgZoom.vue'
import './style.css'

export default {
  ...DefaultTheme,

  Layout: layout,

  enhanceApp({ app, router, siteData }) {
    app.component('VPDocHero', VPHomeHero)
    app.component('ImgZoom', ImgZoom)
  }
}
