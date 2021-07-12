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
        <div v-if="browser !== 'Not supported'" class="card-banner">
          <img v-if="browser === 'Chrome'" src="../assets/chrome.png" />
          <img v-else-if="browser === 'Edge'" src="../assets/edge.png" />
          <img v-else-if="browser === 'Opera'" src="../assets/opera.png" />
          <img v-else-if="browser === 'Yandex'" src="../assets/yandex.png" />
        </div>
        <div v-if="browser !== 'Not supported'" class="card-desc">
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
          <h3>Your browser doesn't support WebUSB</h3>
          <img v-if="browser === 'Not supported'" src="../assets/notsupported.png" />
          <p>
            Try one of the chromium based browsers.
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
            <a class="btn primary drop-left">Windows Download</a>
            <a class="btn primary drop-right"><i data-eva="arrow-ios-downward-outline" data-eva-fill="#fff"></i></a>
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
    browser: String
  },
  mounted () {
    eva.replace()
  }
}
</script>
