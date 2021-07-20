<template>
  <div id="dfu-container">
    <button id="back" :disabled="status === 'Writing firmware'" @click="$emit('clickHome')">
      <i data-eva="arrow-ios-back-outline" data-eva-fill="#6b6b6b"></i> Back
    </button>
    <div v-show="displayArrows" class="arrows">
      <div id="arrow-1">
        <div class="svg-container">
          <i data-eva="arrow-circle-left-outline" data-eva-fill="#000000cc" data-eva-height="48px" data-eva-width="48px"></i>
        </div>
        <span>1. Find your Flipper in dropdown menu</span>
      </div>
      <div id="arrow-2">
        <div class="svg-container">
          <i data-eva="arrow-circle-up-outline" data-eva-fill="#000000cc" data-eva-height="48px" data-eva-width="48px"></i>
        </div>
        <span>2. Press "Connect"</span>
      </div>
    </div>
    <div v-show="displayArrows" id="connection-spinner">
      <svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg>
      <p>
        Waiting for connection...
      </p>
    </div>
    <div v-show="error.isError" id="error">
      <div>
        <h2><i data-eva="alert-circle-outline" data-eva-fill="#000000cc"></i> Error</h2>
        <p>{{ error.msg }}</p>
      </div>
      <button v-if="error.button === 'connectSerial'" class="btn primary" @click="reconnect('serial')">Try again</button>
      <button v-else-if="error.button === 'connectDFU'" class="btn primary" @click="reconnect('serial')">Try again</button>
    </div>
    <div v-if="displaySerialMenu" id="connected-serial">
      <h2>Flipper Zero WebUSB Updater</h2>
      <div class="card">
        <div>
          <img v-if="flipper.bodyColor === 'white' || flipper.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
          <img v-if="flipper.bodyColor === 'black'" src="../assets/flipper-black.png" />
        </div>
        <div>
          <h3><b>{{ flipper.name }}</b> connected!</h3>
          <h3 id="battery">Battery: {{ flipper.battery }}</h3>
        </div>
        <div>
          <pre>
            <b>Device type:</b>
            <b>Device name:</b>
            <b>Stm32 serial:</b>
            <b>Color:</b>
            <b>Region:</b>
            <b>Hardware version:</b>
            <b>Firmware target:</b>
          </pre>
          <pre>
    {{ flipper.type }}
    {{ flipper.name }}
    {{ flipper.stm32Serial }}
    {{ flipper.bodyColor }}
    {{ flipper.region }}
    {{ flipper.hardwareVer }}
    {{ flipper.target }}
          </pre>
        </div>
        <div>
          <pre>
            <b>Firmware version:</b>
            <b>Firmware build:</b>
            <b>Bootloader version:</b>
            <b>Bootloader build:</b>
            <b>Radio firmware:</b>
            <b>Bluetooth mac:</b>
          </pre>
          <pre>
    {{ flipper.firmwareVer }}
    {{ flipper.firmwareBuild }}
    {{ flipper.bootloaderVer }}
    {{ flipper.bootloaderBuild }}
    {{ flipper.radioFirmware }}
    {{ flipper.btMac }}
          </pre>
        </div>
      </div>
      <div v-if="isOutdated" id="outdated">
        <p>
          Your firmware is outdated, latest release is <b>{{ hwLatest }}</b>
        </p>
        <button class="btn primary" @click="fetchFirmwareFile">Update firmware to {{ hwLatest }}</button>
        <p v-if="!firmwareFileName.length" class="alternative">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".bin"/>
        </p>
        <button v-else class="btn primary" @click="gotoDFU">Flash {{ firmwareFileName }}</button>
      </div>
      <div v-if="!isOutdated" id="up-to-date">
        <p>
          Your firmware is up to date.
        </p>
        <p v-if="!firmwareFileName.length" class="alternative">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".bin"/>
        </p>
        <button v-else class="btn primary" @click="gotoDFU">Flash {{ firmwareFileName }}</button>
      </div>
    </div>
    <div v-show="status === 'Writing firmware'" id="connection-spinner">
      <h3>Writing firmware. Don't disconnect your Flipper</h3>
      <p v-if="progress.stage === 0">Erasing device memory</p>
      <p v-else>Copying data from browser to Flipper</p>
      <progress :max="progress.max" :value="progress.current"></progress>
    </div>
    <h2 v-if="status === 'OK, reboot Flipper'">Firmware successfully updated. You may need to restart your Flipper.</h2>
  </div>
</template>

<script>
import { WebDFU } from 'dfu'
import * as eva from 'eva-icons'

class LineBreakTransformer {
  constructor () {
    this.chunks = ''
  }

  transform (chunk, controller) {
    this.chunks += chunk
    const lines = this.chunks.split('\r\n')
    this.chunks = lines.pop()
    lines.forEach((line) => controller.enqueue(line))
  }

  flush (controller) {
    controller.enqueue(this.chunks)
  }
}

export default {
  name: 'WebUSB',
  props: {
    userAgent: Object,
    latest: Object
  },
  data () {
    return {
      error: {
        isError: false,
        msg: '',
        button: ''
      },
      status: 'Connect Flipper',
      port: undefined,
      webdfu: undefined,
      progress: {
        current: 0,
        max: 0,
        stage: 0
      },
      firmwareFile: undefined,
      firmwareFileName: '',
      displayArrows: false,
      displaySerialMenu: false,
      commands: ['version', 'uid', 'hw_info', 'power_info', 'power_test', 'device_info'],
      flipper: {
        type: 'undefined',
        battery: 'undefined',
        name: 'undefined',
        stm32Serial: 'undefined',
        bodyColor: 'undefined',
        region: 'undefined',
        hardwareVer: 'undefined',
        target: '6',
        firmwareVer: 'undefined',
        firmwareBuild: 'undefined',
        bootloaderVer: 'undefined',
        bootloaderBuild: 'undefined',
        radioFirmware: 'undefined',
        btMac: 'undefined'
      },
      hwLatest: '',
      isOutdated: false,
      closeRead: false
    }
  },
  methods: {
    async connectSerial () {
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.displayArrows = true
      this.adjustArrows()
      try {
        this.port = await navigator.serial.requestPort()
        await this.port.open({
          baudRate: 9600
        })

        this.displayArrows = false
        this.status = 'Connected to Flipper in serial mode'

        this.getData()
      } catch {
        this.error.isError = true
        this.error.msg = 'No device selected'
        this.error.button = 'connectSerial'
        this.status = 'No device selected'
        this.displayArrows = false
      }
    },
    async getData () {
      this.write(this.commands)
      this.read()
      setTimeout(this.compareVersions, 500)
      this.displaySerialMenu = true
    },
    async read () {
      try {
        while (this.port.readable && !this.closeRead) {
          // eslint-disable-next-line no-undef
          const textDecoder = new TextDecoderStream()
          // eslint-disable-next-line no-unused-vars
          const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable)
          const reader = textDecoder.readable
            // eslint-disable-next-line no-undef
            .pipeThrough(new TransformStream(new LineBreakTransformer()))
            .getReader()
          const begin = Date.now()

          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { value, done } = await reader.read()
            if (done || Date.now() - begin > 3000) {
              reader.releaseLock()
              break
            }
            this.parseReadValue(value)
          }
        }
      } catch (error) {
        console.log(error)
        this.status = 'Serial connection lost'
      }
    },
    async write (lines) {
      // eslint-disable-next-line no-undef
      const textEncoder = new TextEncoderStream()
      // eslint-disable-next-line no-unused-vars
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable)
      const writer = textEncoder.writable.getWriter()

      lines.forEach(line => {
        writer.write(line + '\r\n')
      })
      writer.close()
    },
    parseReadValue (value) {
      // Legacy commands parser
      if (value.includes('Version:')) {
        if (this.flipper.bootloaderVer === 'undefined') {
          this.flipper.bootloaderVer = value.slice(value.match(/Version:(\s)*/g)[0].length + 1)
        } else {
          this.flipper.firmwareVer = value.slice(value.match(/Version:(\s)*/g)[0].length + 1)
        }
      }
      if (value.includes('Build date:')) {
        if (this.flipper.bootloaderBuild === 'undefined') {
          this.flipper.bootloaderBuild = value.slice(-10)
        } else {
          this.flipper.firmwareBuild = value.slice(-10)
        }
      }
      if (value.includes('HW version')) {
        this.flipper.hardwareVer = value.slice(11).trim()
      }
      if (value.includes('Name: ') || value.includes('Production date: ')) {
        try {
          this.flipper.name = value.match(/Name:(\s)*(\S)*/g)[0].slice(5).trim()
        } catch (error) {
          // different firmwares have different command formats
          // so some actions need to be wrapped
        }
      }

      // Battery charge parser
      if (value.includes('State of Charge: ')) {
        this.flipper.battery = value.match(/State of Charge: (\d){1,3}%/g)[0].slice(-4).trim()
        const b = document.querySelector('#battery')
        if (parseInt(this.flipper.battery) > 50) b.style.color = '#49c74a'
        else if (parseInt(this.flipper.battery) < 50 && parseInt(this.flipper.battery) > 20) b.style.color = '#ff9e29'
        else b.style.color = '#e23e3e'
      }

      // device_info parser
      if (value.includes('hardware_model')) {
        this.flipper.type = value.replace(/hardware_model\s*:\s/g, '').trim()
      }
      if (value.includes('hardware_name')) {
        this.flipper.name = value.replace(/hardware_name\s*:\s/g, '').trim()
      }
      if (value.includes('hardware_uid')) {
        this.flipper.stm32Serial = value.replace(/hardware_uid\s*:\s/g, '').trim()
      }
      if (value.includes('hardware_color')) {
        const color = value.replace(/hardware_color\s*:\s/g, '').trim()
        switch (color) {
          case '0':
            this.flipper.bodyColor = 'white'
            break
          case '1':
            this.flipper.bodyColor = 'black'
            break
        }
      }
      if (value.includes('hardware_region')) {
        this.flipper.region = value.replace(/hardware_region\s*:\s/g, '').trim()
      }
      if (value.includes('hardware_ver')) {
        this.flipper.hardwareVer = value.replace(/hardware_ver\s*:\s/g, '').trim()
      }
      if (value.includes('hardware_target')) {
        this.flipper.target = value.replace(/hardware_target\s*:\s/g, '').trim()
      }
      if (value.includes('firmware_version')) {
        this.flipper.firmwareVer = value.replace(/firmware_version\s*:\s/g, '').trim()
      }
      if (value.includes('firmware_build_date')) {
        this.flipper.firmwareBuild = value.replace(/firmware_build_date\s*:\s/g, '').trim()
      }
      if (value.includes('boot_version')) {
        this.flipper.bootloaderVer = value.replace(/boot_version\s*:\s/g, '').trim()
      }
      if (value.includes('boot_build_date')) {
        this.flipper.bootloaderBuild = value.replace(/boot_build_date\s*:\s/g, '').trim()
      }
      if (value.includes('radio_stack_release')) {
        this.flipper.radioFirmware = value.replace(/radio_stack_release\s*:\s/g, '').trim()
      }
      if (value.includes('radio_ble_mac')) {
        this.flipper.btMac = value.replace(/radio_ble_mac\s*:\s/g, '').trim()
      }
    },
    async compareVersions () {
      if (this.flipper.firmwareVer === this.latest.version) {
        this.isOutdated = false
      } else {
        this.isOutdated = true
        this.hwLatest = this.latest.version
      }
    },
    async loadFirmwareFile (event) {
      const buffer = await event.target.files[0].arrayBuffer()
      this.firmwareFile = new Uint8Array(buffer)
      this.firmwareFileName = event.target.files[0].name
    },
    async fetchFirmwareFile () {
      try {
        const file = this.latest.files.find((e) => {
          if (e.url.slice(-11) === 'f' + this.flipper.target + '_full.bin') return e
          else return undefined
        })
        const buffer = await fetch(file.url)
          .then(response => {
            return response.arrayBuffer()
          })
        this.firmwareFile = new Uint8Array(buffer)
        this.gotoDFU()
      } catch (error) {
        this.error.isError = true
        this.error.msg = `Failed to fetch latest firmware (${error})`
        this.error.button = ''
      }
    },
    async gotoDFU () {
      this.closeRead = true
      this.write(['dfu'])
      this.status = 'Rebooted into DFU'
      this.displaySerialMenu = false
      this.connectDFU()
    },
    async connectDFU () {
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.displayArrows = true
      // Load the device by WebUSB
      try {
        const selectedDevice = await navigator.usb.requestDevice({ filters: [] })
        // Create and init the WebDFU instance
        this.webdfu = new WebDFU(
          selectedDevice,
          {
            forceInterfacesName: true
          },
          {
            progress: (done, total) => {
              if (total !== this.progress.max && this.progress.max !== 0) {
                this.progress.stage = 1
              }
              this.progress.max = total
              this.progress.current = done
            }
          }
        )
        await this.webdfu.init()
        if (this.webdfu.interfaces.length === 0) {
          this.error.isError = true
          this.error.msg = 'The selected device does not have any USB DFU interfaces'
          this.error.button = 'connectDFU'
          this.status = 'The selected device does not have any USB DFU interfaces'
          this.displayArrows = false
        }
        // Connect to first device interface
        await this.webdfu.connect(0)
        this.status = 'Connected to Flipper in DFU mode'
        this.error.isError = false
        this.error.msg = ''
        this.error.button = ''
        this.displayArrows = false

        this.writeFirmware()
      } catch (e) {
        this.error.isError = true
        if (e.message.includes('No device selected')) {
          this.error.msg = 'No device selected'
          this.status = 'No device selected'
        } else {
          console.log(e)
          this.error.msg = 'The device was disconnected'
          this.status = 'The device was disconnected'
        }
        this.error.button = 'connectDFU'
        this.displayArrows = false
      }
    },
    async writeFirmware () {
      try {
        this.status = 'Writing firmware'
        await this.webdfu.write(1024, this.firmwareFile)
        this.webdfu.close()
        this.status = 'OK, reboot Flipper'
      } catch (error) {
        this.error.isError = true
        this.error.msg = `Failed to write firmware (${error})`
        this.error.button = ''
        this.status = 'Failed to write firmware'
      }
    },
    adjustArrows () {
      // try to detect bookmarks bar
      const diff = window.outerHeight - window.innerHeight
      let bar = false
      if (diff > 89 && diff <= 120) {
        bar = true
        document.getElementById('arrow-2').style.top = '397px'
      }

      // Chrome on Linux/OS X
      if (this.userAgent.os !== 'Windows') {
        document.getElementById('arrow-2').style.left = '470px'
      }

      // Edge
      if (this.userAgent.browser === 'Edge') {
        document.getElementById('arrow-1').style.top = '50px'
        document.getElementById('arrow-1').style.left = '593px'

        if (bar) {
          document.getElementById('arrow-2').style.top = '192px'
        } else {
          document.getElementById('arrow-2').style.top = '222px'
        }

        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '435px'
        } else {
          document.getElementById('arrow-2').style.left = '519px'
        }
      }

      // Opera
      if (this.userAgent.browser === 'Opera') {
        document.getElementById('arrow-1').style.left = '541px'

        if (bar) {
          document.getElementById('arrow-2').style.top = '357px'
        } else {
          document.getElementById('arrow-2').style.top = '389px'
        }

        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '395px'
        } else {
          document.getElementById('arrow-2').style.left = '470px'
        }
      }

      // Yandex
      if (this.userAgent.browser === 'Yandex') {
        document.getElementById('arrow-1').style.left = '651px'

        if (bar) {
          document.getElementById('arrow-2').style.top = '405px'
        } else {
          document.getElementById('arrow-2').style.top = '427px'
        }

        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '454px'
        } else {
          document.getElementById('arrow-2').style.left = '568px'
        }
      }
    },
    async reconnect (type) {
      if (type === 'serial') {
        try {
          if (this.port) this.port.close()
        } catch (e) {
          console.error(e)
        }
        this.connectSerial()
      } else if (type === 'dfu') {
        try {
          if (this.webdfu) this.webdfu.close()
        } catch (e) {
          console.error(e)
        }
        this.connectDFU()
      }
    }
  },
  mounted () {
    eva.replace()
    this.connectSerial()
  }
}
</script>

<style src="../assets/css/webdfu.css"></style>
<style src="../assets/css/spinner.css"></style>
<style scoped>
h2 {
  margin-bottom: 2.5rem;
}

.card {
  display: grid;
  grid-auto-columns: 1fr;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 0px 4rem;
  grid-template-areas:
    ". ."
    ". .";
  color: #000000cc;
}

.card > div {
  text-align: left;
}

.card > div:first-of-type, .card > div:nth-of-type(2) {
  padding-left: 2.5rem;
}
.card > div:nth-of-type(3), .card > div:nth-of-type(4) {
  display: flex;
}

.card pre {
  color: #000000a4;
}

.card img {
  width: 280px;
}
</style>
