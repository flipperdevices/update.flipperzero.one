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

import { emitter } from '../../core/core'

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

    read () {
      this.flipper.read('cli')
    }
  },

  created () {
    this.evaCloseOutline = evaCloseOutline
  },

  mounted () {
    this.init()

    let isUnicode = false,
      unicodeBytesLeft = 0,
      unicodeBuffer = []

    this.unbind = emitter.on('cli output', data => {
      if (data.byteLength === 1) {
        const byte = data[0]
        if (!isUnicode && byte >> 7 === 1) {
          isUnicode = true
          data = undefined
          unicodeBuffer.push(byte)
          for (let i = 6; i >= 4; i--) {
            if ((byte >> i) % 2 === 1) {
              unicodeBytesLeft++
            } else {
              break
            }
          }
        } else {
          if (unicodeBytesLeft > 0 && byte >> 6 === 2) {
            unicodeBuffer.push(byte)
            unicodeBytesLeft--
            if (unicodeBytesLeft === 0) {
              data = new Uint8Array(unicodeBuffer)
              isUnicode = false
              unicodeBuffer = []
            } else {
              data = undefined
            }
          } else {
            isUnicode = false
            unicodeBytesLeft = 0
            unicodeBuffer = []
          }
        }
      }

      if (data) {
        const text = new TextDecoder().decode(data).replaceAll('\x7F', '')
        this.terminal.write(text)
      }
    })
  },

  beforeUnmount () {
    this.unbind()
  }
})
</script>

<style lang="scss" src="../../../css/terminal.scss"></style>
