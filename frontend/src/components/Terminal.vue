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
      input: ref('')
    }
  },

  methods: {
    async init () {
      this.terminal = new Terminal({
        scrollback: 10_000
      })
      const fitAddon = new FitAddon()
      this.terminal.loadAddon(fitAddon)
      this.terminal.open(document.getElementById('terminal-container'))
      document.querySelector('.xterm').setAttribute('style', 'height:' + getComputedStyle(document.querySelector('.xterm')).height)
      this.terminal.focus()
      fitAddon.fit()

      await this.write('\x01')
      this.read()

      this.terminal.onData(async data => {
        await this.write(data)
      })
    },

    async write (data) {
      this.flipper.cliWrite(data)
    },

    read () {
      this.flipper.cliRead()
      window.addEventListener('new cli output', (e) => {
        this.terminal.write(e.detail.replaceAll('\x7F', ''))
      })
    },

    clearOutput (text) {
      function trimPrompts (text) {
        if (text.endsWith('>: \r\n>: ')) {
          text = text.slice(0, text.length - 5)
          return trimPrompts(text)
        } else {
          return text
        }
      }

      if (this.input.length && text.startsWith(this.input)) {
        text = text.slice(this.input.length, text.length)
      }
      if (text.endsWith('\r\n')) {
        text = text.slice(0, text.length - 2)
      }
      text = text.replaceAll('\x07', '')
      text = trimPrompts(text)
      return text
    }
  },

  created () {
    this.evaCloseOutline = evaCloseOutline
  },

  mounted () {
    this.init()
  }
})
</script>

<style lang="scss" src="../css/terminal.scss"></style>
