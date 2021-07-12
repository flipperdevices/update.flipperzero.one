<template>
  <div id="dfu-container">
    <button id="back" :disabled="status === 'Writing firmware'" @click="$emit('clickHome')">
      <i data-eva="arrow-ios-back-outline" data-eva-fill="#6b6b6b"></i> Back
    </button>
    <div v-show="displayArrows" class="arrows">
      <div id="arrow-1">
        <div class="svg-container">
          <i data-eva="arrow-circle-left-outline" data-eva-fill="#000000cc" data-eva-height="32px"></i>
        </div>
        <span>1. Find your Flipper in dropdown menu</span>
      </div>
      <div id="arrow-2">
        <div class="svg-container">
          <i data-eva="arrow-circle-up-outline" data-eva-fill="#000000cc" data-eva-height="32px"></i>
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
      <button v-if="error.button === 'connectSerial'" class="btn primary" @click="connectSerial">Try again</button>
      <button v-else-if="error.button === 'connectDFU'" class="btn primary" @click="connectDFU">Try again</button>
    </div>
    <div v-if="displaySerialMenu" id="connected-serial">
      <h2>Connected!</h2>
      <div class="card">
        <div class="card-banner">
          <img v-if="flipper.bodyColor === 'white' || flipper.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
          <img v-if="flipper.bodyColor === 'black'" src="../assets/flipper-black.png" />
        </div>
        <div class="card-desc">
          <pre>
            <b>battery</b>: {{ flipper.battery }}
            <b>device_name</b>: {{ flipper.name }}
            <b>stm32_serial</b>: {{ flipper.stm32Serial }}
            <b>body_color</b>: {{ flipper.bodyColor }}
            <b>hardware_ver</b>: {{ flipper.hardwareVer }}
            <b>firmware_target</b>: {{ flipper.target }}
            <b>firmware_version</b>: {{ flipper.firmwareVer }}
            <b>firmware_build</b>: {{ flipper.firmwareBuild }}
            <b>bootloader_version</b>: {{ flipper.bootloaderVer }}
            <b>bootloader_build</b>: {{ flipper.bootloaderBuild }}
            <b>radio_firmware</b>: {{ flipper.radioFirmware }}
            <b>bluetooth_mac</b>: {{ flipper.btMac }}
          </pre>
        </div>
      </div>
      <div v-if="isOutdated" id="outdated">
        <p>
          Your firmware is outdated, latest release is <b>{{ hwLatest }}</b>
        </p>
        <button class="btn primary" @click="fetchFirmwareFile">Update firmware to {{ hwLatest }}</button>
        <p class="alternative">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile"/>
        </p>
      </div>
      <div v-if="!isOutdated" id="up-to-date">
        <p>
          Your firmware is up to date.
        </p>
        <p class="alternative">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".bin"/>
        </p>
      </div>
    </div>
    <div v-show="status === 'Writing firmware'" id="connection-spinner">
      <svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg>
      <p>
        Writing firmware...
      </p>
    </div>
    <h2 v-if="status === 'OK, reboot Flipper'">Firmware successfully updated. You may need to restart your Flipper.</h2>
  </div>
</template>

<script>
import { WebDFU } from 'dfu'
import * as semver from 'semver'
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
    userAgent: Object
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
      firmwareFile: undefined,
      displayArrows: false,
      displaySerialMenu: false,
      commands: ['version', 'uid', 'hw_info', 'power_info', 'power_test'],
      flipper: {
        battery: 'undefined',
        name: 'undefined',
        stm32Serial: 'undefined',
        bodyColor: 'undefined',
        hardwareVer: 'undefined',
        target: 'f6',
        firmwareVer: 'undefined',
        firmwareBuild: 'undefined',
        bootloaderVer: 'undefined',
        bootloaderBuild: 'undefined',
        radioFirmware: 'undefined',
        btMac: 'undefined'
      },
      versions: {
        flipper: {
          firmware: {
            version: '',
            date: '',
            timestamp: ''
          },
          bootloader: {
            version: '',
            date: '',
            timestamp: ''
          }
        },
        release: {
          version: '',
          timestamp: '',
          url: ''
        },
        master: {
          version: '',
          timestamp: ''
        }
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
      setTimeout(this.fetchVersions, 300)
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
            if (done || Date.now() - begin > 2000) {
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
        writer.write(line + '\r')
      })
      writer.close()
    },
    parseReadValue (value) {
      if (value.includes('Version:')) {
        if (this.flipper.bootloaderVer === 'undefined') {
          this.flipper.bootloaderVer = value.slice(value.match(/Version:(\s)*/g)[0].length + 1)
          this.versions.flipper.bootloader.version = this.flipper.bootloaderVer
        } else {
          this.flipper.firmwareVer = value.slice(value.match(/Version:(\s)*/g)[0].length + 1)
          this.versions.flipper.firmware.version = this.flipper.firmwareVer
        }
      }
      if (value.includes('Build date:')) {
        if (this.flipper.bootloaderBuild === 'undefined') {
          this.flipper.bootloaderBuild = value.slice(-10)
          this.versions.flipper.bootloader.date = this.flipper.bootloaderBuild
        } else {
          this.flipper.firmwareBuild = value.slice(-10)
          this.versions.flipper.firmware.date = this.flipper.firmwareBuild
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
      if (value.includes('State of Charge: ')) {
        this.flipper.battery = value.match(/State of Charge: (\d){1,3}%/g)[0].slice(-4).trim()
      }
    },
    async fetchVersions () {
      fetch('https://update.flipperzero.one/directory.json')
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          const versions = data.channels[1].versions.map((e) => {
            return e.version.slice(3)
          })
          const latest = data.channels[1].versions[(versions.indexOf(semver.maxSatisfying(versions, '*')))]

          this.versions.master.version = data.channels[0].versions[0].version
          this.versions.release.version = latest.version
          this.versions.master.timestamp = data.channels[0].versions[0].timestamp
          this.versions.release.timestamp = latest.timestamp
          this.versions.release.url = latest.files.find(file => file.target === this.flipper.target && file.type === 'full_bin').url

          if (this.versions.flipper.firmware.version === this.versions.release.version) {
            this.isOutdated = false
          } else {
            this.isOutdated = true
            this.hwLatest = this.versions.release.version
          }
        })
    },
    async loadFirmwareFile (event) {
      const buffer = await event.target.files[0].arrayBuffer()
      this.firmwareFile = new Uint8Array(buffer)
      this.gotoDFU()
    },
    async fetchFirmwareFile () {
      try {
        const buffer = await fetch(this.versions.release.url)
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
        this.webdfu = new WebDFU(selectedDevice, { forceInterfacesName: true })
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
