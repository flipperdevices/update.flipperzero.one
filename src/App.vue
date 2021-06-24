<template>
  <div id="app">
    <h1>Flipper Zero Firmware Update page</h1>
    <h2>WebUSB updater (recommended)</h2>
    <div class="component">
      <WebUSB /> 
    </div>
    <h2>Desktop application updater</h2>
    <div class="component">
      <QFlipper />
    </div>
    <h2>Download firmware files</h2>
    <div class="component">
      <FirmwareFiles />
    </div>
  </div>
</template>

<script>
import WebUSB from './components/WebUSB.vue'
import QFlipper from './components/QFlipper.vue'
import FirmwareFiles from './components/FirmwareFiles.vue'

export default {
  name: 'App',
  components: {
    WebUSB,
    QFlipper,
    FirmwareFiles
  }
}
</script>
