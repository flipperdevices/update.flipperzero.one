<template>
  <div id="paint-wrapper" class="absolute z-top fit flex justify-center items-center bg-white">
    <div class="flex column full-width items-center">
      <div class="q-mb-md">
        <div class="q-ma-sm">
          <q-toggle
            v-model="autoStreaming.enabled"
            label="Auto-streaming"
            class="q-mr-md"
            @click="toggleAutoStreaming"
          ></q-toggle>
          <q-btn
            v-if="!autoStreaming.enabled"
            @click="sendFrame"
          >Send frame</q-btn>
          <q-input
            v-else
            v-model="autoStreaming.delay"
            label="Delay, ms"
            dense
            class="inline-block"
            style="width: 50px;"
          />
        </div>

        <input type="file" id="file-upload" @change="upload" class="hidden"/>
        <q-btn
          @click="triggerUpload"
          :icon="mdiFileImageOutline"
        ></q-btn>

        <q-btn-group
          class="q-ma-sm"
        >
          <q-btn
            :disabled="this.saveState.length < 2"
            :icon="mdiUndo"
            @click="undo"
          ></q-btn>
          <q-btn
            :disabled="this.restoreState.length === 0"
            :icon="mdiRedo"
            @click="redo"
          ></q-btn>
          <q-btn
            :icon="mdiTrashCanOutline"
            @click="clear"
          ></q-btn>
        </q-btn-group>

        <q-btn-toggle
          v-model="tool"
          @click="toggleTool"
          toggle-color="primary"
          :options="[
            {value: 'pencil', slot: 'pencil'},
            {value: 'eraser', slot: 'eraser'}
          ]"
        >
          <template v-slot:pencil>
            <q-icon :name="mdiPencil" />
          </template>

          <template v-slot:eraser>
            <q-icon :name="mdiEraser" />
          </template>
        </q-btn-toggle>

        <q-item>
          <q-item-section side>
            <q-icon :name="mdiPencilMinus" />
          </q-item-section>
          <q-item-section>
            <q-slider
              v-model="ctx.lineWidth"
              :min="1"
              :max="10"
              :step="1"
              label
              label-always
              class="q-mt-lg"
            />
          </q-item-section>
          <q-item-section side>
            <q-icon :name="mdiPencilPlus" />
          </q-item-section>
        </q-item>
      </div>

      <div
        :class="scaling === 1 ? 'canvas-container' : ''"
        :style="scaling === 1 ? '' : 'margin-top:' + scaling * 16 + 'px;'"
      >
        <canvas
          :style="'transform: scale(' + scaling + ');'"
          width="128"
          height="64"
          ref="canvas"
          @mousedown="mouseDown"
          @mouseup="mouseUp"
          @mousemove="mouseMove"
        ></canvas>
      </div>
    </div>
    <q-btn-toggle
      v-model="scaling"
      toggle-color="primary"
      :options="[
        {label: '1x', value: 1},
        {label: '2x', value: 2},
        {label: '4x', value: 4}
      ]"
      class="absolute-top-left q-ma-sm"
    />
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import * as pbCommands from './updater/protobuf/commands'
import { xbmValues } from './paint/xbm-values'

import {
  mdiPencil,
  mdiPencilMinus,
  mdiPencilPlus,
  mdiEraser,
  mdiUndo,
  mdiRedo,
  mdiTrashCanOutline,
  mdiFileImageOutline
} from '@quasar/extras/mdi-v5'

export default defineComponent({
  name: 'Paint',

  props: {
    flipper: Object
  },

  setup () {
    return {
      ctx: ref({
        lineWidth: 1
      }),
      painting: ref(false),
      tool: ref('pencil'),
      saveState: ref([]),
      restoreState: ref([]),
      autoStreaming: ref({
        enabled: false,
        interval: undefined,
        delay: 500
      }),
      backlightInterval: ref(undefined),
      file: ref(undefined),
      scaling: ref(1)
    }
  },

  methods: {
    async startSession () {
      const startPing = await pbCommands.startRpcSession(this.flipper)
      if (!startPing.resolved || startPing.error) {
        console.log('Couldn\'t start rpc session:', startPing.error)
        return
      }

      const startVirtualDisplay = await pbCommands.guiStartVirtualDisplay()
      if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
        console.log('Couldn\'t start virtual display session:', startVirtualDisplay.error)
      }
    },
    async stopSession () {
      await pbCommands.guiStopVirtualDisplay()
      await pbCommands.stopRpcSession()
    },
    async sendFrame () {
      const imageData = this.filter('monochrome')
      const data = imageData.data

      let pixel = 0
      let atualRow = 1
      const xbmBytes = []
      for (let c = 0; c < 64; c++) {
        for (let c2 = 0; c2 < 128 / 8; c2++) {
          const hexBits = []
          for (let c3 = 0; c3 < 8; c3++) {
            const pixelIsBlack = !(data[pixel * 4])
            if (pixelIsBlack) { hexBits.push(c3) }
            pixel++
            const isNewRow = pixel / (128 * atualRow) === 1
            if (isNewRow) {
              atualRow++
              break
            }
          }
          for (let c4 = 0; c4 < 256; c4++) {
            if (JSON.stringify(xbmValues[String(c4)]) === JSON.stringify(hexBits)) {
              xbmBytes.push(c4)
            }
          }
        }
      }

      pbCommands.guiScreenFrame(new Uint8Array(xbmBytes))
    },
    toggleAutoStreaming () {
      if (this.autoStreaming.enabled) {
        if (this.autoStreaming.interval) {
          clearInterval(this.autoStreaming.interval)
        }
        this.autoStreaming.interval = setInterval(this.sendFrame, this.autoStreaming.delay)
      } else {
        clearInterval(this.autoStreaming.interval)
      }
    },

    clear () {
      this.save()
      this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
      this.ctx.fillRect(0, 0, 128, 64)
    },
    save () {
      const imageData = this.filter('orange')
      this.ctx.putImageData(imageData, 0, 0)
      this.saveState.push(this.ctx.getImageData(0, 0, 128, 64))
      if (this.restoreState.length > 0) {
        this.restoreState = []
      }
      if (this.saveState.length === 30) {
        this.saveState.shift()
      }
    },
    undo () {
      this.restoreState.push(this.saveState.pop())
      if (this.restoreState.length === 30) {
        this.restoreState.shift()
      }
      this.ctx.putImageData(this.saveState[this.saveState.length - 1], 0, 0)
    },
    redo () {
      this.saveState.push(this.restoreState.pop())
      if (this.saveState.length === 30) {
        this.saveState.shift()
      }
      this.ctx.putImageData(this.saveState[this.saveState.length - 1], 0, 0)
    },
    triggerUpload () {
      document.getElementById('file-upload').click()
    },
    upload (event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        const img = new Image()
        reader.onload = event => {
          if (event.target.readyState !== FileReader.DONE) {
            return
          }
          img.onload = () => {
            this.ctx.drawImage(img, 0, 0, 128, 64)
            const imageData = this.filter('orange')
            this.ctx.putImageData(imageData, 0, 0)
            this.save()
          }
          img.src = event.target.result
        }
      }
    },

    mouseDown (e) {
      this.painting = true
      this.ctx.beginPath()
    },
    mouseUp (e) {
      this.stroke(e)
      this.painting = false
      this.save()
    },
    mouseMove (e) {
      if (this.painting) {
        this.stroke(e)
        this.ctx.beginPath()
        this.ctx.moveTo(e.offsetX, e.offsetY)
      }
    },
    stroke (e) {
      this.ctx.lineTo(e.offsetX, e.offsetY)
      this.ctx.stroke()
    },
    filter (type) {
      const imageData = this.ctx.getImageData(0, 0, 128, 64)
      const data = imageData.data
      const pixelsLength = 128 * 64
      for (let pixel = 0; pixel < pixelsLength; pixel++) {
        const pixelRed = data[pixel * 4]
        const pixelGreen = data[pixel * 4 + 1]
        const pixelBlue = data[pixel * 4 + 2]
        const pixelAlpha = data[pixel * 4 + 3]
        if (!pixelAlpha) {
          data[pixel * 4] = 255
          data[pixel * 4 + 1] = 255
          data[pixel * 4 + 2] = 255
          data[pixel * 4 + 3] = 1
        } else {
          const allThem = (pixelRed + pixelGreen + pixelBlue) / 3
          if (allThem <= 128) {
            data[pixel * 4] = 0
            data[pixel * 4 + 1] = 0
            data[pixel * 4 + 2] = 0
          } else {
            if (type === 'orange') {
              data[pixel * 4] = 254
              data[pixel * 4 + 1] = 138
              data[pixel * 4 + 2] = 44
            } else if (type === 'monochrome') {
              data[pixel * 4] = 255
              data[pixel * 4 + 1] = 255
              data[pixel * 4 + 2] = 255
            }
          }
        }
      }
      return imageData
    },
    toggleTool () {
      this.ctx.strokeStyle = this.tool === 'pencil' ? 'black' : '#fe8a2c'
    }
  },

  created () {
    this.mdiPencil = mdiPencil
    this.mdiPencilMinus = mdiPencilMinus
    this.mdiPencilPlus = mdiPencilPlus
    this.mdiEraser = mdiEraser
    this.mdiUndo = mdiUndo
    this.mdiRedo = mdiRedo
    this.mdiTrashCanOutline = mdiTrashCanOutline
    this.mdiFileImageOutline = mdiFileImageOutline
  },

  mounted () {
    this.startSession()

    this.ctx = this.$refs.canvas.getContext('2d')
    this.ctx.lineWidth = 1
    this.ctx.lineCap = 'square'
    this.ctx.strokeStyle = 'black'
    this.ctx.imageSmoothingEnabled = false

    this.ctx.fillStyle = '#fe8a2c'
    this.ctx.fillRect(0, 0, 128, 64)
    this.save()

    this.backlightInterval = setInterval(() => {
      pbCommands.guiSendInputEvent(4, 0)
      pbCommands.guiSendInputEvent(4, 2)
      pbCommands.guiSendInputEvent(4, 1)
    }, 10000)
  },

  beforeUnmount () {
    if (this.autoStreaming.interval) {
      clearInterval(this.autoStreaming.interval)
    }
    clearInterval(this.backlightInterval)
    this.stopSession()
  }
})
</script>

<style lang="scss" scoped>
canvas {
  border: 1px #00000080 solid;
  image-rendering: pixelated;
}
.canvas-container {
  padding: 25px 46px 0 0;
  width: 360px;
  height: 160px;
  background-image: url(../assets/flipper_w.svg);
  background-repeat: no-repeat;
}
</style>
