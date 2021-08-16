<template>
  <q-page class="flex flex-center">
    <Homepage
      :userAgent="userAgent"
    />
  </q-page>
</template>

<script>
import Homepage from 'components/Homepage.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    Homepage
  },
  setup () {
    return {
      userAgent: {
        browser: 'Not supported',
        os: 'Other'
      }
    }
  },
  created () {
    if (navigator.userAgent.indexOf('Chrome') !== -1) this.userAgent.browser = 'Chrome'
    if (navigator.userAgent.indexOf('YaBrowser') !== -1 || navigator.userAgent.indexOf('Yowser') !== -1) this.userAgent.browser = 'Yandex'
    if (navigator.userAgent.indexOf('Edg') !== -1) this.userAgent.browser = 'Edge'

    if (navigator.userAgent.indexOf('Macintosh') !== -1) this.userAgent.os = 'macOS'
    else if (navigator.userAgent.indexOf('Linux') !== -1) this.userAgent.os = 'Linux'
    else if (navigator.userAgent.indexOf('Windows') !== -1) this.userAgent.os = 'Windows'

    if (!('serial' in navigator) || !('usb' in navigator) || navigator.userAgent.indexOf('OPR') !== -1) this.userAgent.browser = 'Not supported'
  }
})
</script>
