<template>
  <div id="app">
    <h1>Flipper Zero Firmware Update page</h1>
    <h2>WebUSB updater (recommended)</h2>
    <div>
      <WebUSB /> 
    </div>
    <h2>Desktop application updater</h2>
    <div>
      <QFlipper />
    </div>
    <h2>Download firmware files</h2>
    <div>
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

<style>
#app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Roboto", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

#app > div {
  width: 100%;
  max-width: 60vw;
  padding: 2rem;
  margin-bottom: 50px;
  border-radius: 5px;
  box-shadow: 0px 2px 10px 0px rgba(34, 60, 80, 0.2);
}
</style> 
