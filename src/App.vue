<template>
  <div id="app">
    <h1>Flipper Zero Firmware Update page</h1>
    <h2>WebUSB updater</h2>
    <div class="component">
      <WebUSB /> 
    </div>
  </div>
</template>

<script>
import WebUSB from './components/WebUSB.vue'

export default {
  name: 'App',
  components: {
    WebUSB
  }
}
</script>
