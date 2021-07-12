<template>
  <div id="homepage-container">
    <div id="header">
      <img src="../assets/flipper-logo.png" />
      <img src="../assets/youtube.png" />
      <img src="../assets/discord.png" />
      <img src="../assets/github.png" />
    </div>
    <h1>Flipper Zero Firmware Update page</h1>
    <div class="component">
      <div class="card">
        <div v-if="userAgent.browser !== 'Not supported'" class="card-banner">
          <img v-if="userAgent.browser === 'Chrome'" src="../assets/chrome.png" />
          <img v-else-if="userAgent.browser === 'Edge'" src="../assets/edge.png" />
          <img v-else-if="userAgent.browser === 'Opera'" src="../assets/opera.png" />
          <img v-else-if="userAgent.browser === 'Yandex'" src="../assets/yandex.png" />
        </div>
        <div v-if="userAgent.browser !== 'Not supported'" class="card-desc">
          <h2>WebUSB updater (recommended)</h2>
          <h3>Flash the latest firmware right in your browser using WebUSB.</h3>
          <p>
            No drivers needed!
          </p>
          <p>
            Just connect your Flipper to the computer, press the button below and choose your device from dropping list.
            Don't forget to grant access to WebUSB in a pop-up.
          </p>
          <p>
            Currently supports only Chrome-based browsers: Chrome, Edge, Yandex Browser.
          </p>
          <div class="buttons">
            <button class="btn primary" @click="$emit('clickConnect')">Connect Flipper</button>
          </div>
        </div>
        <div v-else class="card-desc bad-browser">
          <h3>Your browser doesn't support WebUSB updater :(</h3>
          <img v-if="userAgent.browser === 'Not supported'" src="../assets/notsupported.png" />
          <p>
            Your browser doesn’t support WebUSB/WebSerial.

            Updater currently supports only Chrome-based browsers: Chrome, Edge, Yandex Browser.
          </p>
          <div class="buttons">
            <a class="btn alert" href="https://caniuse.com/webusb">Compatibility List</a>
          </div>
        </div>
      </div>
    </div>
    <div class="component qflipper">
      <div class="card">
        <div class="card-banner">
          <img src="../assets/qflipper.png" />
        </div>
        <div class="card-desc">
          <h2>Desktop crossplatform application</h2>
          <p>
            Check your Flipper status and choose different update versions. Find additional info on a <a href="http://docs.flipperzero.one/">wiki page</a>.
          </p>
          <div class="buttons">
            <div style="display: flex;">
              <a v-if="userAgent.os === 'Windows'" class="btn primary drop-left" href="https://update.flipperzero.one/qFlipper/qFlipperSetup-64bit.exe">Windows Download</a>
              <a v-if="userAgent.os === 'Mac'" class="btn primary drop-left" href="https://update.flipperzero.one/qFlipper/qflipper.dmg">Mac OS X Download</a>
              <a v-if="userAgent.os === 'Linux'" class="btn primary drop-left" href="https://update.flipperzero.one/qFlipper/qflipper-x86_64.AppImage">Linux Download</a>
              <button class="btn primary drop-right" @click="dropdownClick">
                <i v-if="isDropOpened" data-eva="arrow-ios-upward-outline" data-eva-fill="#fff"></i>
                <i v-if="!isDropOpened" data-eva="arrow-ios-downward-outline" data-eva-fill="#fff"></i>
              </button>
            </div>
            <div v-show="isDropOpened" class="drop-body">
              <a v-if="userAgent.os !== 'Windows'" href="https://update.flipperzero.one/qFlipper/qFlipperSetup-64bit.exe">Windows Download</a>
              <a v-if="userAgent.os !== 'Mac'" href="https://update.flipperzero.one/qFlipper/qflipper.dmg">Mac OS X Download</a>
              <a v-if="userAgent.os !== 'Linux'" href="https://update.flipperzero.one/qFlipper/qflipper-x86_64.AppImage">Linux Download</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as eva from 'eva-icons'

export default {
  name: 'Homepage',
  props: {
    userAgent: Object
  },
  data () {
    return {
      isDropOpened: false
    }
  },
  methods: {
    dropdownClick () {
      this.isDropOpened = !this.isDropOpened
      document.querySelector('.drop-body').style.width = document.querySelector('div.component.qflipper .buttons > div').clientWidth - 1 + 'px'
      document.querySelector('.drop-right > svg').style.rotate = this.isDropOpened * 180 + 'deg'
    }
  },
  mounted () {
    eva.replace()
  }
}
</script>
