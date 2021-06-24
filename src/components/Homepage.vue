<template>
  <div id="app">
    <h1>Flipper Zero Firmware Update page</h1>
    <h2>WebUSB updater</h2>
    <div class="component">
      <div class="card">
        <div class="card-banner">
          <img v-if="browser === 'Chrome'" src="../assets/chrome.png" />
        </div>
        <div class="card-desc">
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
