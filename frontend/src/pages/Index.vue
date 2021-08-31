<template>
  <q-page class="flex flex-center">
    <Homepage
      :userAgent="userAgent"
      :customSource="customSource"
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
  props: {
    customSource: Object
  },
  setup () {
    return {
      userAgent: {
        browser: 'Not supported',
        os: 'Other',
        usb: false,
        serial: false
      }
    }
  },
  created () {
    if (navigator.userAgent.includes('Chrome')) this.userAgent.browser = 'Chrome'
    if (navigator.userAgent.includes('YaBrowser') || navigator.userAgent.includes('Yowser')) this.userAgent.browser = 'Yandex'
    if (navigator.userAgent.includes('Edg')) this.userAgent.browser = 'Edge'

    if (navigator.userAgent.includes('Macintosh')) this.userAgent.os = 'macOS'
    else if (navigator.userAgent.includes('Windows')) this.userAgent.os = 'Windows'
    else if (navigator.userAgent.includes('Linux') && !navigator.userAgent.includes('Android')) this.userAgent.os = 'Linux'
    else if (navigator.userAgent.includes('Android')) this.userAgent.os = 'Android'

    if ('usb' in navigator) this.userAgent.usb = true
    if ('serial' in navigator) this.userAgent.serial = true

    if (!this.userAgent.serial || !this.userAgent.usb) this.userAgent.browser = 'Not supported'

    if (navigator.userAgent.includes('OPR')) {
      this.userAgent.browser = 'Not supported'
      this.userAgent.usb = false
      this.userAgent.serial = false
    }
  }
})
</script>
