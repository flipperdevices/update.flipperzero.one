<template>
  <div id="app">
    <h1>Flipper Zero Firmware Update page</h1>
    <h2>WebUSB updater</h2>
    <div class="component">
      <div class="card">
        <div v-if="browser !== 'Other'" class="card-banner">
          <img v-if="browser === 'Chrome'" src="../assets/chrome.png" />
          <img v-else-if="browser === 'Edge'" src="../assets/edge.png" />
          <img v-else-if="browser === 'Opera'" src="../assets/opera.png" />
          <img v-else-if="browser === 'Yandex'" src="../assets/yandex.png" />
        </div>
        <div v-if="browser !== 'Other'" class="card-desc">
          <h3>Flash the latest firmware right in your browser using WebUSB.</h3>
          <p>
            No drivers needed!
          </p>
          <p>
            Just connect your Flipper to the computer, press the button below and choose your device from dropping list.
            Don't forget to grant access to WebUSB in a pop-up.
          </p>
          <p>
            Currently supports only webkit-based browsers:
            Chrome based, Opera, Edge
          </p>
          <div class="buttons">
            <button class="primary" @click="$emit('clickConnect')">Connect Flipper</button>
          </div>
        </div>
        <div v-else class="card-desc bad-browser">
          <h3>Your browser doesn't support WebUSB</h3>
          <img v-if="browser === 'Other'" src="../assets/notsupported.png" />
          <p>
            Try one of the chromium based browsers.
          </p>
          <div class="buttons">
            <button class="primary" href="https://caniuse.com/webusb">Compatibility List</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Homepage',
  props: {
    browser: String
  }
}
</script>
