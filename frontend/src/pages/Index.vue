<template>
  <q-page class="flex flex-center">
    <div id="homepage-container" class="fit text-center q-pa-sm">
      <h3>Flipper Zero Firmware Update page</h3>

      <AppContainer />

      <QFlipper />

      <h3>Download firmware files</h3>

      <FirmwareFiles />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import AppContainer from 'components/AppContainer.vue'
import QFlipper from 'components/QFlipper.vue'
import FirmwareFiles from 'components/FirmwareFiles.vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    AppContainer,
    QFlipper,
    FirmwareFiles
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

    this.$store.commit({
      type: 'setUserAgent',
      userAgent: this.userAgent
    })
  }
})
</script>

<style lang="scss" src="../css/homepage.scss"></style>
