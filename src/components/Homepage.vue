<template>
  <div id="homepage-container">
    <div id="header">
      <img src="../assets/flipper-logo.png" />
      <img src="../assets/youtube.png" />
      <img src="../assets/discord.png" />
      <img src="../assets/github.png" />
    </div>
    <h1>Flipper Zero Firmware Update page</h1>
    <div class="component web-upgrade">
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
                <i data-eva="arrow-ios-downward-outline" data-eva-fill="#fff"></i>
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
    <h1>Download firmware files</h1>
    <div class="component firmware-files">
      <p>
        In case you need firmware files locally for some reason you may need this files to flash locally with <a href="http://dfu-util.sourceforge.net/">dfu-util</a> and <a href="">st-link</a> <i>.elf</i> files for debugging.
      </p>
      <div class="buttons">
        <a class="btn fw-btn" href="https://caniuse.com/webusb">
          <div>
            <div>
              <p>Latest Release</p>
              <b>5.12.14</b>
            </div>
            <div>
              <i data-eva="arrow-downward-outline" data-eva-fill="#fff" data-eva-height="48" data-eva-width="52"></i>
            </div>
          </div>
        </a>
        <a class="btn fw-btn" href="https://caniuse.com/webusb">
          <div>
            <div>
              <p>Nightly dev build</p>
              <b>5.12.14</b>
            </div>
            <div>
              <i data-eva="arrow-downward-outline" data-eva-fill="#fff" data-eva-height="48" data-eva-width="52"></i>
            </div>
          </div>
        </a>
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
    },
    getDir () {
      fetch('https://update.flipperzero.one/directory.json')
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          console.log(data)
        })
    }
  },
  mounted () {
    eva.replace()
    this.getDir()
  }
}
</script>
