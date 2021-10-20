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
      document.querySelector('#updater-wrapper').setAttribute('style', 'height:' + getComputedStyle(document.querySelector('#updater-wrapper')).height + ' !important')
      document.querySelector('.xterm').setAttribute('style', 'height:' + getComputedStyle(document.querySelector('.xterm')).height + ' !important')
      this.terminal.focus()
      fitAddon.fit()

      await this.write('\x01\r\n')
      await this.read()

      this.terminal.onData(async data => {
        if (data === '\x7F') {
          if (this.input.length) {
            this.input = this.input.slice(0, this.input.length - 1)
            this.terminal.write('\b \b')
          }
        } else if (data === '\r') {
          await this.write(this.input)
          await this.read()
          this.input = ''
        } else {
          this.input += data
          this.terminal.writeUtf8(data)
        }
      })
    },

    async write (data) {
      await this.flipper.write(data)
    },

    async read () {
      await this.flipper.read()
        .then(text => {
          text = this.clearOutput(text)
          this.terminal.writeUtf8(text)
        })
        .catch(error => {
          this.terminal.writeUtf8(error)
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
