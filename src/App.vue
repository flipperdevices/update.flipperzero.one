<template>
  <div id="app">
    <Homepage
      :browser="userAgent.browser"
      v-if="displayHomepage"
      v-on:clickConnect="displayHomepage = !displayHomepage"
    />
    <WebUSB
      :userAgent="userAgent"
      v-if="!displayHomepage"
      v-on:clickHome="displayHomepage = !displayHomepage"
    />
  </div>
</template>

<script>
import Homepage from './components/Homepage.vue'
import WebUSB from './components/WebUSB.vue'

export default {
  name: 'App',
  components: {
    Homepage,
    WebUSB
  },
  data() {
    return {
      displayHomepage: true,
      userAgent: {
        browser: 'Not supported',
        os: 'Other'
      }
    }
  },
  mounted() {
    if (navigator.userAgent.indexOf("Chrome") !== -1) this.userAgent.browser = 'Chrome'
    if (navigator.userAgent.indexOf("YaBrowser") !== -1 || navigator.userAgent.indexOf("Yowser") !== -1) this.userAgent.browser = 'Yandex'
    if (navigator.userAgent.indexOf("OPR") !== -1) this.userAgent.browser = 'Opera'
    if (navigator.userAgent.indexOf("Edg") !== -1) this.userAgent.browser = 'Edge'

    if (navigator.userAgent.indexOf("Macintosh") !== -1) this.userAgent.os = 'Mac'
    else if (navigator.userAgent.indexOf("Linux") !== -1) this.userAgent.os = 'Linux'
    else if (navigator.userAgent.indexOf("Windows") !== -1) this.userAgent.os = 'Windows'

    if (!('serial' in navigator) || !('usb' in navigator)) this.userAgent.browser = 'Not supported'
  }
}
</script>
