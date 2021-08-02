<template>
  <div id="updater-container" class="flex column flex-center">
    <div v-show="displayArrows" class="arrows">
      <div class="popup-overlay"></div>
      <div id="arrow-1">
        <q-icon :name="evaArrowBackOutline"></q-icon>
        <span class="q-pl-sm">1. {{ arrowText }}</span>
      </div>
      <div id="arrow-2">
        <q-icon :name="evaArrowUpwardOutline"></q-icon>
        <span class="q-pl-sm q-pt-xs">2. Press "Connect"</span>
      </div>
    </div>

    <div v-show="displayArrows" id="connection-spinner">
      <q-spinner
        color="accent"
        size="3em"
      ></q-spinner>
      <p>
        Waiting for connection...
      </p>
    </div>

    <q-card v-show="error.isError" id="error">
      <q-card-section class="bg-negative text-white text-left">
        <div class="text-h6"><q-icon :name="evaAlertCircleOutline"></q-icon> Error</div>
        <div class="text-subtitle2">{{ error.msg }}<a v-if="error.msg.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
      </q-card-section>

      <q-separator></q-separator>

      <q-card-actions align="right">
        <q-btn flat v-if="error.button === 'connectSerial'" @click="reconnect('serial')">Try again</q-btn>
        <q-btn flat v-if="error.button === 'connectDFU'" @click="reconnect('dfu')">Try again</q-btn>
      </q-card-actions>
    </q-card>

    <div v-show="displaySerialMenu" id="connected">
      <h4>Flipper Zero Web Updater</h4>

      <q-card flat>
        <q-card-section horizontal class="text-left">
          <div class="col-6 flex flex-center">
            <img v-if="flipper.bodyColor === 'white' || flipper.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
            <img v-if="flipper.bodyColor === 'black'" src="../assets/flipper-black.png" />
          </div>
          <div class="col-6 q-ml-xl" style="white-space: nowrap;">
            <h5>
              <b>{{ flipper.name }}&nbsp;</b>
              <span v-if="status !== 'Serial connection lost'">connected<span v-if="status === 'Connected to Flipper in DFU mode' || status === 'Writing firmware'"> in recovery mode</span>!</span>
              <span v-else class="text-accent">disconnected!</span>
            </h5>
            <h5 id="battery">Battery: {{ flipper.battery }}</h5>
          </div>
        </q-card-section>
        <q-card-section horizontal class="text-left">
          <q-card flat class="col-6">
            <q-card-section horizontal>
              <pre>
<b>Device type:</b>
<b>Device name:</b>
<b>Stm32 serial:</b>
<b>Color:</b>
<b>Hardware version:</b>
<b>Firmware target:</b>
              </pre>
              <pre>
  {{ flipper.type }}
  {{ flipper.name }}
  {{ flipper.stm32Serial }}
  {{ flipper.bodyColor }}
  {{ flipper.hardwareVer }}
  {{ flipper.target }}
              </pre>
            </q-card-section>
          </q-card>
          <q-card flat class="col-6 q-ml-xl">
            <q-card-section horizontal>
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
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <div v-if="isOutdated && status !== 'Serial connection lost' && status !== 'Writing firmware'" id="outdated">
        <p v-if="!firmwareFileName.length">
          Your firmware is outdated, latest release is <b>{{ hwLatest }}</b>
        </p>
        <q-btn v-if="!firmwareFileName.length" @click="fetchFirmwareFile" color="positive" padding="12px 30px">Update firmware to {{ hwLatest }}</q-btn>
        <p v-if="!firmwareFileName.length" class="q-mt-lg">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu" class="q-ml-sm"/>
        </p>
        <q-btn v-if="firmwareFileName.length" @click="gotoDFU" color="positive" padding="12px 30px">Flash {{ firmwareFileName }}</q-btn>
        <q-btn v-if="firmwareFileName.length" @click="cancelUpload" flat class="q-ml-lg" padding="12px 30px">Cancel</q-btn>
      </div>
      <div v-if="!isOutdated && status !== 'Serial connection lost' && status !== 'Writing firmware'" id="up-to-date">
        <p v-if="!firmwareFileName.length && !newerThanLTS">
          Your firmware is up to date.
        </p>
        <p v-if="!firmwareFileName.length && newerThanLTS">
          Your fimware version is ahead of latest release.
        </p>
        <q-btn v-if="!firmwareFileName.length && !newerThanLTS" @click="fetchFirmwareFile" color="accent" padding="12px 30px">Re-flash latest release ({{ hwLatest }})</q-btn>
        <q-btn v-if="!firmwareFileName.length && newerThanLTS" @click="fetchFirmwareFile" color="positive" padding="12px 30px">Flash latest release ({{ hwLatest }})</q-btn>
        <p v-if="!firmwareFileName.length" class="q-mt-lg">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu" class="q-ml-sm"/>
        </p>
        <q-btn v-if="firmwareFileName.length" @click="gotoDFU" color="positive" padding="12px 30px">Flash {{ firmwareFileName }}</q-btn>
        <q-btn v-if="firmwareFileName.length" @click="cancelUpload" flat class="q-ml-lg" padding="12px 30px">Cancel</q-btn>
      </div>

      <div v-if="status === 'Serial connection lost' && status !== 'Writing firmware'" class="alert">
        <span class="text-accent">Information is valid on {{ disconnectTime }}</span>
      </div>

      <div v-show="status === 'Writing firmware'">
        <h5>Writing firmware. Don't disconnect your Flipper</h5>
        <p v-if="progress.stage === 0">Erasing device memory</p>
        <p v-else>Copying data from browser to Flipper</p>
        <progress :max="progress.max" :value="progress.current"></progress>
      </div>
    </div>

    <h4 v-if="status === 'OK'" id="ok">Firmware successfully updated</h4>

    <div v-show="status === 'Serial connection lost' || status === 'OK'" id="reconnect">
      <q-btn @click="reconnect('serial')" :icon="evaRefreshOutline" flat>
        Reconnect
      </q-btn>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { WebDFU } from 'dfu'
import * as semver from 'semver'
import { evaArrowBackOutline, evaArrowUpwardOutline, evaAlertCircleOutline, evaRefreshOutline } from '@quasar/extras/eva-icons'

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

export default defineComponent({
  name: 'Updater',
  props: {
    userAgent: Object,
    latest: Object
  },
  setup () {
    return {
      error: ref({
        isError: false,
        msg: '',
        button: ''
      }),
      status: ref('Connect Flipper'),
      port: ref(undefined),
      webdfu: ref(undefined),
      startAddress: ref(''),
      progress: ref({
        current: 0,
        max: 0,
        stage: 0
      }),
      firmwareFile: ref(undefined),
      firmwareFileName: ref(''),
      displayArrows: ref(false),
      displaySerialMenu: ref(false),
      commands: ['version', 'uid', 'hw_info', 'power_info', 'power_test', 'device_info'],
      flipper: ref({
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
      }),
      hwLatest: ref(''),
      isOutdated: ref(false),
      newerThanLTS: ref(false),
      disconnectTime: ref(''),
      arrowText: ref('Find your Flipper in dropdown menu')
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
          baudRate: 1
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
      this.hwLatest = this.latest.version
      if (semver.eq((this.flipper.firmwareVer === 'undefined' ? '0.0.0' : this.flipper.firmwareVer), this.latest.version)) {
        this.isOutdated = false
      } else if (semver.gt((this.flipper.firmwareVer === 'undefined' ? '0.0.0' : this.flipper.firmwareVer), this.latest.version)) {
        this.isOutdated = false
        this.newerThanLTS = true
      } else {
        this.isOutdated = true
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
      for (const p in this.flipper) {
        this.flipper[p] = 'undefined'
      }
      this.newerThanLTS = false
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
  created () {
    this.evaArrowBackOutline = evaArrowBackOutline
    this.evaArrowUpwardOutline = evaArrowUpwardOutline
    this.evaAlertCircleOutline = evaAlertCircleOutline
    this.evaRefreshOutline = evaRefreshOutline
  },
  mounted () {
    this.connectSerial()
  }
})
</script>

<style lang="scss" src="../css/updater.scss"></style>
