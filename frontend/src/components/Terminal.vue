<template>
  <div id="terminal-wrapper" class="z-top fit">
    <div id="terminal-container" class="fit"></div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit'

import { emitter } from './updater/core'

import {
  evaCloseOutline
} from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'Terminal',

  props: {
    flipper: Object
  },

  setup () {
    return {
      terminal: ref(undefined),
      readInterval: undefined,
      input: ref(''),
      unbind: ref(undefined)
    }
  },

  methods: {
    init () {
      this.terminal = new Terminal({
        scrollback: 10_000
      })
      const fitAddon = new FitAddon()
      this.terminal.loadAddon(fitAddon)
      this.terminal.open(document.getElementById('terminal-container'))
      document.querySelector('.xterm').setAttribute('style', 'height:' + getComputedStyle(document.querySelector('.xterm')).height)
      this.terminal.focus()
      fitAddon.fit()

      this.write('\x01')
      this.read()

      this.terminal.onData(async data => {
        this.write(data)
      })
    },

    write (data) {
      this.flipper.write('cli', data)
    },

    read (shouldStop) {
      this.flipper.read('cli')
    }
  },

  created () {
    this.evaCloseOutline = evaCloseOutline
  },

  mounted () {
    this.init()
    this.unbind = emitter.on('cli output', data => {
      this.terminal.write(data.replaceAll('\x7F', ''))
    })
  },

  beforeUnmount () {
    this.unbind()
  }
})
</script>

<style lang="scss" src="../css/terminal.scss"></style>
