<template>
  <div id="dfu-container">
    <div v-show="displayArrows" class="arrows">
      <div class="popup-overlay"></div>
      <div id="arrow-1">
        <div class="svg-container">
          <i data-eva="arrow-circle-left-outline" data-eva-fill="#fff" data-eva-height="48px" data-eva-width="48px"></i>
        </div>
        <span>1. {{ arrowText }}</span>
      </div>
      <div id="arrow-2">
        <div class="svg-container">
          <i data-eva="arrow-circle-up-outline" data-eva-fill="#fff" data-eva-height="48px" data-eva-width="48px"></i>
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
        <p>{{ error.msg }}<a v-if="error.msg.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></p>
      </div>
      <button v-if="error.button === 'connectSerial'" class="btn primary" @click="reconnect('serial')">Try again</button>
      <button v-else-if="error.button === 'connectDFU'" class="btn primary" @click="reconnect('serial')">Try again</button>
    </div>
    <div v-show="displaySerialMenu" id="connected-serial">
      <h2>Flipper Zero Web Updater</h2>
      <div class="card">
        <div>
          <img v-if="flipper.bodyColor === 'white' || flipper.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
          <img v-if="flipper.bodyColor === 'black'" src="../assets/flipper-black.png" />
        </div>
        <div>
          <h3>
            <b>{{ flipper.name }} </b>
            <span v-if="status !== 'Serial connection lost'">connected!</span>
            <span v-else class="alert">disconnected!</span>
          </h3>
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
      <div v-if="isOutdated && status !== 'Serial connection lost' && status !== 'Writing firmware'" id="outdated">
        <p v-if="!firmwareFileName.length">
          Your firmware is outdated, latest release is <b>{{ hwLatest }}</b>
        </p>
        <button v-if="!firmwareFileName.length" class="btn primary" @click="fetchFirmwareFile">Update firmware to {{ hwLatest }}</button>
        <p v-if="!firmwareFileName.length" class="alternative">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu"/>
        </p>
        <button v-if="firmwareFileName.length" class="btn primary" @click="gotoDFU">Flash {{ firmwareFileName }}</button>
        <button v-if="firmwareFileName.length" class="ml-1 btn secondary" @click="cancelUpload">Cancel</button>
      </div>
      <div v-if="!isOutdated && status !== 'Serial connection lost' && status !== 'Writing firmware'" id="up-to-date">
        <p v-if="!firmwareFileName.length">
          Your firmware is up to date.
        </p>
        <p v-if="!firmwareFileName.length" class="alternative">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu"/>
        </p>
        <button v-if="firmwareFileName.length" class="btn primary" @click="gotoDFU">Flash {{ firmwareFileName }}</button>
        <button v-if="firmwareFileName.length" class="ml-1 btn secondary" @click="cancelUpload">Cancel</button>
      </div>
      <div v-if="status === 'Serial connection lost' && status !== 'Writing firmware'" class="alert">
        <span class="alert">Information is valid on {{ disconnectTime }}</span>
      </div>
      <div v-show="status === 'Writing firmware'">
        <h3>Writing firmware. Don't disconnect your Flipper</h3>
        <p v-if="progress.stage === 0">Erasing device memory</p>
        <p v-else>Copying data from browser to Flipper</p>
        <progress :max="progress.max" :value="progress.current"></progress>
      </div>
    </div>
    <h2 v-if="status === 'OK'" id="ok">Firmware successfully updated.</h2>
    <div v-show="status === 'Serial connection lost' || status === 'OK'" id="reconnect">
      <button class="btn secondary" @click="reconnect('serial')">
        <i data-eva="refresh-outline" data-eva-fill="#6b6b6b" data-eva-height="18px" data-eva-width="18px"></i> Reconnect
      </button>
    </div>
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
  name: 'Updater',
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
      startAddress: '',
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
        target: 'undefined',
        firmwareVer: 'undefined',
        firmwareBuild: 'undefined',
        bootloaderVer: 'undefined',
        bootloaderBuild: 'undefined',
        radioFirmware: 'undefined',
        btMac: 'undefined'
      },
      hwLatest: '',
      isOutdated: false,
      disconnectTime: '',
      arrowText: 'Find your Flipper in dropdown menu'
    }
  },
  methods: {
    async connectSerial () {
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.displayArrows = true
      this.arrowText = 'Find your Flipper in serial mode (Flipper <name>)'
      this.adjustArrows()
      try {
        this.port = await navigator.serial.requestPort()
        await this.port.open({
          baudRate: 9600
        })

        this.displayArrows = false
        this.status = 'Connected to Flipper in serial mode'

        this.getData()
      } catch (error) {
        if (!error.message.includes('Failed to open serial port.')) {
          console.log(error.message)
          this.error.msg = error.message
        } else {
          this.error.msg = 'Can\'t connect to Flipper. It may be used by another tab or process.'
        }
        this.displaySerialMenu = false
        this.error.isError = true
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
      eva.replace()
    },
    async read () {
      try {
        while (this.port && this.port.readable) {
          // eslint-disable-next-line no-undef
          const textDecoder = new TextDecoderStream()
          this.port.readable.pipeTo(textDecoder.writable).catch(error => {
            if (error.message.includes('The device has been lost.')) {
              this.status = 'Serial connection lost'
            } else {
              console.log(error.message)
            }
          })
          const reader = textDecoder.readable
            // eslint-disable-next-line no-undef
            .pipeThrough(new TransformStream(new LineBreakTransformer()))
            .getReader()
          const begin = Date.now()

          while (this.port && this.port.readable) {
            const { value, done } = await reader.read()
            if (done || Date.now() - begin > 3000) {
              reader.releaseLock()
              break
            }
            this.parseReadValue(value)
          }
        }
      } catch (error) {
        if (error.message.includes('The device has been lost.')) {
          const d = new Date(Date.now())
          this.disconnectTime = d.toTimeString().slice(0, 5) + ' ' + d.toLocaleDateString('en-US')
          this.status = 'Serial connection lost'
          document.querySelector('#battery').style.color = '#c6c6c6'
          if (this.port) {
            this.port.close().catch(error => {
              if (!error.message.includes('The port is already closed') && !error.message.includes('The device has been lost.')) {
                console.log(error.message)
              }
            })
          }
        } else {
          console.log(error.message)
        }
      }
    },
    async write (lines) {
      // eslint-disable-next-line no-undef
      const textEncoder = new TextEncoderStream()
      textEncoder.readable.pipeTo(this.port.writable)
      const writer = textEncoder.writable.getWriter()

      lines.forEach(line => {
        writer.write(line + '\r\n')
      })
      writer.close()
    },
    parseReadValue (value) {
      if (value.includes('State of Charge: ')) {
        this.flipper.battery = value.match(/State of Charge: (\d){1,3}%/g)[0].slice(-4).trim()
        const b = document.querySelector('#battery')
        if (parseInt(this.flipper.battery) > 50) b.style.color = '#49c74a'
        else if (parseInt(this.flipper.battery) < 50 && parseInt(this.flipper.battery) > 20) b.style.color = '#ff9e29'
        else b.style.color = '#e23e3e'
      }

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
      this.cropDFUFile()
    },
    async fetchFirmwareFile () {
      try {
        const file = this.latest.files.find((e) => {
          if (e.type === 'full_dfu' && e.target === 'f' + this.flipper.target) return e
          else return undefined
        })
        const buffer = await fetch(file.url)
          .then(response => {
            return response.arrayBuffer()
          })
        this.firmwareFile = new Uint8Array(buffer)
        this.cropDFUFile()
        this.gotoDFU()
      } catch (error) {
        this.displaySerialMenu = false
        this.error.isError = true
        this.error.msg = `Failed to fetch latest firmware (${error})`
        this.error.button = ''
      }
    },
    cropDFUFile () {
      function toHex (f, s, e) {
        return Array.from(f.slice(s, e), function (byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2)
        }).join(' ')
      }

      this.startAddress = toHex(this.firmwareFile, 285, 289).split(' ').reverse().join('')
      const size = parseInt(toHex(this.firmwareFile, 289, 293).split(' ').reverse().join(''), 16)
      const binary = this.firmwareFile.slice(293, size + 293)
      this.firmwareFile = binary
    },
    async gotoDFU () {
      this.write(['dfu'])
      this.status = 'Rebooted into DFU'
      this.connectDFU()
    },
    async connectDFU () {
      this.disconnectSerial()
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.displayArrows = true
      this.arrowText = 'Find your Flipper in DFU mode (DFU in FS Mode)'
      try {
        const selectedDevice = await navigator.usb.requestDevice({ filters: [] })
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
          this.displaySerialMenu = false
          this.error.isError = true
          this.error.msg = 'The selected device does not have any USB DFU interfaces'
          this.error.button = 'connectDFU'
          this.status = 'The selected device does not have any USB DFU interfaces'
          this.displayArrows = false
        }

        await this.webdfu.connect(0)
        this.status = 'Connected to Flipper in DFU mode'
        this.error.isError = false
        this.error.msg = ''
        this.error.button = ''
        this.displayArrows = false

        this.writeFirmware()
      } catch (error) {
        this.displaySerialMenu = false
        this.error.isError = true
        if (error.message.includes('No device selected')) {
          this.error.msg = 'No device selected'
          this.status = 'No device selected'
        } else if (error.message.includes('Access denied')) {
          this.error.msg = 'Chrome can\'t access Flipper in DFU mode. This may be caused by using '
          this.status = 'The device was disconnected'
        } else {
          console.log(error.message)
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
        this.webdfu.driver.startAddress = Number('0x' + this.startAddress)
        await this.webdfu.write(1024, this.firmwareFile)
        this.webdfu.close()
        this.status = 'OK'
        this.displaySerialMenu = false
      } catch (error) {
        this.displaySerialMenu = false
        this.error.isError = true
        this.error.msg = `Failed to write firmware (${error})`
        this.error.button = ''
        this.status = 'Failed to write firmware'
      }
    },
    adjustArrows () {
      const diff = window.outerHeight - window.innerHeight
      let bar = false
      if (diff > 89 && diff <= 120) {
        bar = true
        document.getElementById('arrow-2').style.top = '397px'
      }

      if (this.userAgent.os !== 'Windows') {
        document.getElementById('arrow-2').style.left = '470px'
      }

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
      this.firmwareFile = undefined
      this.firmwareFileName = ''
      this.progress = {
        current: 0,
        max: 0,
        stage: 0
      }
      if (type === 'serial') {
        this.disconnectSerial()
        this.connectSerial()
      } else if (type === 'dfu') {
        try {
          if (this.webdfu) this.webdfu.close()
        } catch (error) {
          console.log(error.message)
        }
        this.connectDFU()
      }
    },
    async disconnectSerial () {
      if (this.port) {
        const localPort = this.port
        this.port = undefined
        await localPort.close().catch(error => {
          if (!error.message.includes('The port is already closed') &&
            !error.message.includes('The device has been lost.') &&
            !error.message.includes('locked stream')) {
            console.log(error.message)
          }
        })
      }
    },
    cancelUpload () {
      this.firmwareFile = undefined
      this.firmwareFileName = ''
    }
  },
  mounted () {
    eva.replace()
    this.connectSerial()
  }
}
</script>

<style src="../assets/css/updater.css"></style>
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
