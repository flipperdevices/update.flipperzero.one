<template>
  <div id="updater-container" class="flex column flex-center">
    <div v-show="showOverlay" class="popup-overlay">
      <div class="absolute-top-right q-ma-md text-white">
        <q-btn
          flat
          round
          :icon="evaCloseOutline"
          :size="!$q.screen.xs ? '24px' : '18px'"
          @click="showOverlay = false"
        ></q-btn>
        <p>Close</p>
      </div>
      <q-card v-show="error.isError" flat bordered dark style="background: none;" id="error">
        <q-card-section class="text-white text-left">
          <div class="text-h6"><q-icon :name="evaAlertCircleOutline" color="negative"></q-icon> Error</div>
          <div class="text-subtitle2">{{ error.message }}<a v-if="error.message.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
        </q-card-section>

        <q-separator dark v-if="error.button.length"></q-separator>

        <q-card-actions v-if="error.button.length" align="right" class="text-white">
        <q-btn flat v-if="error.button === 'serial'" @click="error.isError = false; connectAndGetData()">Reconnect</q-btn>
        <q-btn flat v-if="error.button === 'usb'" @click="error.isError = false; connectAndGetData()">{{ this.mode === 'serial' ? 'Recovery mode' : 'Reconnect' }}</q-btn>
        </q-card-actions>
      </q-card>
      <div class="absolute-bottom-right q-mr-lg text-white text-right">
        <div v-if="error.isError" style="min-width: 200px">
          <q-btn
            :disabled="flipper.state.connection === 3 && flipper.state.status === 3"
            outline
            color="white"
            size="13px"
            class="q-ma-sm"
            @click="error.isError = false; changeMode(false)"
          >{{mode == 'serial' ? 'Recovery mode' : 'Normal mode'}}</q-btn>
        </div>
        <p v-if="userAgent.os === 'Windows'">
          Can't find your Flipper?
          Connect Flipper in DFU mode and install WinUSB driver. You can use <a :href="qFlipperInstaller">qFlipper installer</a> for that..
        </p>
        <p v-if="userAgent.os === 'Linux'" class="q-mb-sm">
          Can't find your Flipper?
          On Linux you need to allow WebUSB to access devices first. Download and run <a href="https://raw.githubusercontent.com/Flipper-Zero/update.flipperzero.one/main/setup_rules.sh" target="blank">this script</a>.
        </p>
      </div>
    </div>

    <div v-show="showArrows && !$q.screen.xs" class="arrows">
      <div id="arrow-1">
        <q-icon :name="evaArrowBackOutline"></q-icon>
        <div>
          <span class="q-pl-sm">1. {{ arrowText }}</span>
          <div v-if="!error.isError && arrowText === 'Find your Flipper in recovery mode (DFU in FS Mode)'" class="flex flex-center flipper q-mt-lg">
            <img src="../assets/flipper-dfu-overlay.png" class="absolute"/>
            <img src="../assets/flipper-transparent.png" />
          </div>
        </div>
      </div>
      <div id="arrow-2">
        <q-icon :name="evaArrowUpwardOutline"></q-icon>
        <span class="q-pl-sm q-pt-xs">2. Press "Connect"</span>
      </div>
    </div>

    <q-card v-show="error.isError && !showOverlay" id="error">
      <q-card-section class="bg-negative text-white text-left">
        <div class="text-h6"><q-icon :name="evaAlertCircleOutline"></q-icon> Error</div>
        <div class="text-subtitle2">{{ error.message }}<a v-if="error.message.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
      </q-card-section>

      <q-separator v-if="error.button.length"></q-separator>

      <q-card-actions v-if="error.button.length" align="right">
        <q-btn flat v-if="error.button === 'serial'" @click="error.isError = false; connectAndGetData()">Reconnect</q-btn>
        <q-btn flat v-if="error.button === 'usb'" @click="error.isError = false; connectAndGetData()">Recovery mode</q-btn>
      </q-card-actions>
    </q-card>

    <div v-show="!error.isError" class="connected q-mt-sm">
      <q-card flat>
        <q-card-section horizontal class="text-left">
          <div class="col-6 flex flex-center flipper">
            <img v-if="flipper.state.connection === 3" src="../assets/flipper-dfu-overlay.png" class="absolute"/>
            <img v-if="flipper.properties.bodyColor === 'white' || flipper.properties.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
            <img v-if="flipper.properties.bodyColor === 'black'" src="../assets/flipper-black.png" />
          </div>
          <div class="col-6 q-ml-xl" style="white-space: nowrap;">
            <h5>
              <b>{{ flipper.properties.name }}&nbsp;</b>
              <span v-if="flipper.state.connection">connected
                <span v-if="flipper.state.connection === 3">
                  <br />in recovery mode
                </span>
              </span>
              <span v-else-if="reconnecting">reconnecting...</span>
              <span v-else class="text-accent">disconnected</span>
            </h5>
            <h5 v-if="mode === 'serial'">
              Battery: <span :style="'color: ' + batteryColor">{{ flipper.properties.battery }}</span>
            </h5>
          </div>
        </q-card-section>
        <q-card-section v-if="mode === 'serial' && flipper.state.connection !== 1" horizontal class="text-left q-ma-md">
          <q-card flat class="col-6">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Device type:</b></div><div>{{ flipper.properties.type }}</div>
                <div><b>Device name:</b></div><div>{{ flipper.properties.name }}</div>
                <div><b>Stm32 serial:</b></div><div>{{ flipper.properties.stm32Serial }}</div>
                <div><b>Hardware revision:</b></div><div>{{ flipper.properties.hardwareVer }}</div>
                <div><b>Hardware target:</b></div><div>{{ flipper.properties.target }}</div>
                <div><b>Bluetooth mac:</b></div><div>{{ flipper.properties.btMac }}</div>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat class="col-6 q-ml-xl">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Firmware version:</b></div><div>{{ flipper.properties.firmwareVer !== 'unknown' ? flipper.properties.firmwareVer : flipper.properties.firmwareCommit }}</div>
                <div><b>Firmware build:</b></div><div>{{ flipper.properties.firmwareBuild }}</div>
                <div><b>Bootloader version:</b></div><div>{{ flipper.properties.bootloaderVer !== 'unknown' ? flipper.properties.bootloaderVer : flipper.properties.bootloaderCommit }}</div>
                <div><b>Bootloader build:</b></div><div>{{ flipper.properties.bootloaderBuild }}</div>
                <div><b>FUS version:</b></div><div>{{ flipper.properties.radioFusFirmware }}</div>
                <div><b>Radio stack version:</b></div><div>{{ flipper.properties.radioFirmware }}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-section v-if="mode === 'usb' && flipper.state.connection === 3" horizontal class="text-left q-ma-md">
          <q-card flat class="col-6">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Hardware revision:</b></div><div>{{ flipper.properties.hardwareVer }}</div>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat class="col-6 q-ml-xl">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Hardware target:</b></div><div>{{ flipper.properties.target }}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <div v-if="isOutdated && flipper.state.connection === 2" id="outdated">
        <p v-if="!firmware.fileName.length">
          Your firmware is outdated, latest release is <b>{{ release.version }}</b>
        </p>
      </div>
      <div v-if="isOutdated === false && flipper.state.connection === 2" id="up-to-date">
        <p v-if="!firmware.fileName.length && !newerThanLTS">
          Your firmware is up to date.
        </p>
        <p v-if="!firmware.fileName.length && newerThanLTS">
          Your firmware version is ahead of latest release.
        </p>
      </div>

      <div v-if="!checks.sha256" class="alert">
        <p><q-icon :name="evaAlertCircleOutline"></q-icon> sha256 check has failed for <b>{{ fwModel.value }}</b>!</p>
        Check your connection and try again.
      </div>

      <div v-if="!firmware.fileName.length && flipper.state.status === 1">
        <div v-if="fwModel.value === 'custom'" class="alert">
          <p class="ellipsis">
            <q-icon :name="evaAlertCircleOutline"></q-icon> You are installing <b>unofficial</b> firmware from<br/>{{ this['custom'].url }}!
          </p>
          This firmware might be <b>malicious</b> and might <b>break your device</b>!
        </div>

        <div v-if="checks.sha256 && flipper.state.connection !== 0" class="flex flex-center">
          <q-select
            v-model="fwModel"
            :options="fwOptions"
            label="Choose firmware"
            :suffix="fwOptions.find(({label}) => label === fwModel.label) ? fwOptions.find(({label}) => label === fwModel.label).version : ''"
            id="fw-select"
            :style="!$q.screen.xs ? 'width: 300px;' : 'width: 198px;'"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section class="items-start">
                  <q-item-label v-html="scope.opt.label" />
                </q-item-section>
                <q-item-section class="items-end">
                  <q-item-label v-html="scope.opt.version" :class="'fw-option-label ' + scope.opt.value"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-btn
            :loading="firmware.loading"
            v-if="fwModel"
            @click="update"
            color="positive"
            class="q-ml-lg"
            :class="!$q.screen.xs ? '' : 'q-mt-sm'"
            padding="12px 30px"
          >Flash</q-btn>
        </div>
      </div>

      <div v-if="firmware.fileName.length">
        <div v-if="!checks.crc32" class="alert">
          <span><q-icon :name="evaAlertCircleOutline"></q-icon> Crc32 check has failed for <b>{{ firmware.fileName }}</b>!</span>
        </div>

        <div v-if="!checks.target" class="alert">
          <p>
              <q-icon :name="evaAlertCircleOutline"></q-icon> Looks like <b> {{ firmware.fileName }}</b>  is incompatible with your Flipper&nbsp;Zero hardware revision.
          </p>
          This firmware might break your device!
        </div>
      </div>

      <div v-if="flipper.state.connection !== 0 && flipper.state.status === 1" class="flex flex-center q-mt-md">
        <p v-if="!firmware.fileName.length" class="q-mt-xl">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu" class="q-ml-sm"/>
        </p>
        <q-btn
          v-if="firmware.fileName.length && checks.crc32 && checks.target"
          @click="update"
          color="positive"
          padding="12px 30px"
        >Flash {{ firmware.fileName }}</q-btn>
        <q-btn
          v-if="firmware.fileName.length"
          @click="cancelUpload"
          :flat="checks.target"
          :color="checks.target ? '' : 'positive'"
          :class="checks.crc32 ? 'q-ml-lg' : ''"
          padding="12px 30px"
        >Cancel</q-btn>
        <q-btn
          v-if="!checks.target"
          flat
          color="grey-8"
          @click="update"
          padding="12px 30px"
          class="q-ml-lg"
        >Flash anyway</q-btn>
      </div>

      <div v-if="flipper.state.connection === 0 && !reconnecting" class="alert">
        <span>Information is valid on {{ disconnectTime }}</span>
        <q-btn
          flat
          color="grey-8"
          size="13px"
          class="absolute-bottom q-ma-sm"
          @click="connectAndGetData"
        >
          Reconnect
        </q-btn>
      </div>

      <div v-if="reconnecting" class="flex column flex-center q-ma-lg">
        <q-spinner
          color="accent"
          size="3em"
        ></q-spinner>
        <p class="q-ma-sm">Preparing Flipper...</p>
      </div>

      <div v-show="flipper.state.connection === 3 && flipper.state.status === 3">
        <div class="alert">
          <h5>Flashing firmware</h5>
          <p class="q-mb-md">Don't disconnect your Flipper</p>
        </div>
        <q-linear-progress
          rounded
          size="2.25rem"
          :value="flipper.writeProgress.current / flipper.writeProgress.max"
          color="positive"
          class="q-mt-sm q-mb-lg"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="positive" :label="flipper.writeProgress.stage === 0 ? 'Erasing device memory' : 'Writing data'"></q-badge>
          </div>
        </q-linear-progress>
      </div>
    </div>

    <q-btn
      :disabled="flipper.state.connection === 3 && flipper.state.status === 3"
      flat
      color="grey-8"
      size="13px"
      class="absolute-bottom-right q-ma-sm"
      @click="changeMode(true)"
    >{{mode == 'serial' ? 'Recovery mode' : 'Normal mode'}}</q-btn>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { Flipper } from './updater/core'
import {
  fetchFirmwareFile,
  loadFirmwareFile
} from './updater/firmwareLoader'
import semver from 'semver'
import { waitForDevice } from './updater/util'

import { mdiChevronDown } from '@quasar/extras/mdi-v5'
import {
  evaArrowBackOutline,
  evaArrowUpwardOutline,
  evaAlertCircleOutline,
  evaRefreshOutline,
  evaCloseOutline
} from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'Updater',
  props: {
    custom: Object,
    dev: Object,
    initialMode: String,
    qFlipperInstaller: String,
    release: Object,
    rc: Object,
    userAgent: Object
  },
  setup () {
    return {
      arrowText: ref('Find your Flipper in dropdown menu'),
      checks: ref({
        crc32: true,
        sha256: true,
        target: true
      }),
      disconnectTime: ref(''),
      error: ref({
        isError: false,
        message: '',
        button: ''
      }),
      firmware: ref({
        fileName: '',
        loading: false,
        binary: undefined
      }),
      flipper: ref(new Flipper()),
      fwModel: ref({
        label: 'Release', value: 'release', version: ''
      }),
      fwOptions: ref([
        {
          label: 'Release', value: 'release', version: ''
        },
        {
          label: 'Release-candidate', value: 'rc', version: ''
        },
        {
          label: 'Dev (unstable)', value: 'dev', version: ''
        }
      ]),
      isOutdated: ref(false),
      mode: ref('serial'),
      newerThanLTS: ref(false),
      reconnecting: ref(false),
      showArrows: ref(false),
      showOverlay: ref(false)
    }
  },
  computed: {
    batteryColor () {
      let color = ''
      const b = parseInt(this.flipper.properties.battery)
      if (!isNaN(b)) {
        if (b > 50) {
          color = '#49c74a'
        } else if (b < 50 && b > 20) {
          color = '#ff9e29'
        } else {
          color = '#e23e3e'
        }
      }
      return color
    }
  },
  methods: {
    async connectAndGetData () {
      try {
        this.init()

        // Connect
        await this.flipper.connect(this.mode)
          .then(() => {
            if (this.flipper.state.connection === 0) {
              throw new Error('No device selected')
            }
          })
          .catch(async error => {
            if (error.message.includes('No known')) {
              await this.recognizeDevice(this.mode)
            }
          })

        // Get data
        if (!this.error.isError) {
          await this.flipper.readProperties()
          this.compareVersions()
        }
      } catch (error) {
        this.showArrows = false
        this.error.isError = true
        this.error.message = error.message || error
        this.error.button = this.mode
      }
    },

    async update () {
      if (!this.firmware.fileName.length) {
        console.log('fw file downloading')
        this.firmware.loading = true
        await this.fetchFirmwareFile(this.fwModel.value)
        this.firmware.loading = false
        console.log('fw file downloaded')
      }

      this.reconnecting = true
      if (this.mode === 'serial') {
        console.log('rebooting flipper')
        await this.flipper.reboot()
        console.log('flipper rebooted')
      }
      console.log('recognizing device')
      await this.recognizeDevice('usb')
      console.log('recognized device, waiting for device')
      await waitForDevice('rebooted to usb')
      console.log('device ready')
      this.reconnecting = false
      function preventTabClose (event) {
        event.returnValue = ''
      }
      window.addEventListener('beforeunload', preventTabClose)

      await this.flipper.writeFirmware({ file: this.firmware.binary, startAddress: this.firmware.startAddress })

      window.removeEventListener('beforeunload', preventTabClose)
      if (this.mode === 'usb') {
        this.mode = 'serial'
      }
      this.reconnecting = true
      await waitForDevice('rebooted to serial')
      this.reconnecting = false

      await this.connectAndGetData()
    },

    async fetchFirmwareFile (channel) {
      await fetchFirmwareFile(channel, this[channel.toLowerCase()].files, this.flipper.properties.target)
        .then(({ binary, startAddress, targetCheck, crc32Check }) => {
          this.firmware.binary = binary
          this.firmware.startAddress = startAddress
          this.checks.target = targetCheck
          this.checks.crc32 = crc32Check
        })
    },

    async loadFirmwareFile (event) {
      this.firmware.fileName = event.target.files[0].name
      await loadFirmwareFile(event.target.files[0], this.flipper.properties.target)
        .then(({ binary, startAddress, targetCheck, crc32Check }) => {
          this.firmware.binary = binary
          this.firmware.startAddress = startAddress
          this.checks.target = targetCheck
          this.checks.crc32 = crc32Check
        })
    },

    async changeMode (reboot) {
      if (this.mode === 'serial') {
        this.mode = 'usb'
      } else if (this.mode === 'usb') {
        this.mode = 'serial'
      }

      if (reboot) {
        this.reconnecting = true
        await this.flipper.reboot()
        await waitForDevice('rebooted to ' + this.mode)
        this.reconnecting = false
      }

      if (await this.recognizeDevice(this.mode)) {
        await this.connectAndGetData()
      }
    },

    // Utils
    async init () {
      this.error.isError = false
      this.firmware = {
        fileName: '',
        loading: false,
        binary: undefined
      }
      this.flipper.state = {
        connection: 0,
        status: 1
      }
      this.flipper.properties = {
        type: undefined,
        battery: undefined,
        name: undefined,
        stm32Serial: undefined,
        bodyColor: undefined,
        region: undefined,
        hardwareVer: undefined,
        target: undefined,
        firmwareVer: undefined,
        firmwareCommit: undefined,
        firmwareBuild: undefined,
        bootloaderVer: undefined,
        bootloaderCommit: undefined,
        bootloaderBuild: undefined,
        radioFusFirmware: {
          major: undefined,
          minor: undefined,
          sub: undefined
        },
        radioFirmware: {
          major: undefined,
          minor: undefined,
          sub: undefined
        },
        btMac: undefined
      }
      this.isOutdated = undefined
      this.newerThanLTS = false
      this.reconnecting = false
      this.showArrows = false
      this.showOverlay = false
    },

    async recognizeDevice (mode) {
      try {
        if (mode === 'serial') {
          const filters = [
            { usbVendorId: 0x0483, usbProductId: 0x5740 }
          ]
          const ports = await navigator.serial.getPorts({ filters })
          if (ports.length === 0) {
            this.adjustArrows()
            this.showArrows = true
            this.showOverlay = true
            await navigator.serial.requestPort({ filters })
              .then(() => {
                this.error.isError = false
                this.showOverlay = false
                this.showArrows = false
                return true
              })
          }
        } else if (mode === 'usb') {
          const filters = [
            { vendorId: 0x0483, productId: 0xdf11 }
          ]
          const ports = await navigator.usb.getDevices({ filters })
          if (ports.length === 0) {
            this.adjustArrows()
            this.showOverlay = true
            this.showArrows = true
            await navigator.usb.requestDevice({ filters })
              .then(() => {
                this.error.isError = false
                this.showOverlay = false
                this.showArrows = false
              })
          }
        }
      } catch (error) {
        this.showArrows = false
        this.error.isError = true
        this.error.message = error.message || error
        this.error.button = this.mode
        return false
      }
    },

    compareVersions () {
      if (this.flipper.properties.firmwareVer) {
        if (this.flipper.properties.firmwareVer !== 'unknown') {
          if (semver.eq(this.flipper.properties.firmwareVer, this.release.version)) {
            this.isOutdated = false
          } else if (semver.gt(this.flipper.properties.firmwareVer, this.release.version)) {
            this.isOutdated = false
            this.newerThanLTS = true
          } else {
            this.isOutdated = true
          }
        } else {
          this.isOutdated = undefined
        }
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

    cancelUpload () {
      this.firmwareFile = undefined
      this.firmware.fileName = ''
      this.crc32Check = true
      this.firmwareTargetCheck = true
    },

    onDisconnect () {
      const d = new Date(Date.now())
      this.disconnectTime = d.toTimeString().slice(0, 5) + ' ' + d.toLocaleDateString('en-US')
      this.flipper.state.connection = 0

      if (this.mode === 'serial') {
        this.flipper.disconnect()
      }
    }
  },
  created () {
    this.mdiChevronDown = mdiChevronDown
    this.evaArrowBackOutline = evaArrowBackOutline
    this.evaArrowUpwardOutline = evaArrowUpwardOutline
    this.evaAlertCircleOutline = evaAlertCircleOutline
    this.evaRefreshOutline = evaRefreshOutline
    this.evaCloseOutline = evaCloseOutline
  },
  mounted () {
    this.fwOptions[0].version = this.release.version
    this.fwOptions[1].version = this.rc.version
    this.fwOptions[2].version = this.dev.version
    if (this.custom) {
      this.fwOptions.unshift({
        label: this.custom.channel || 'Custom', value: 'custom', version: this.custom.version || 'unknown'
      })
    }
    this.fwModel = this.fwOptions[0]

    if (this.initialMode) {
      this.mode = this.initialMode
    }
    this.connectAndGetData()

    navigator.serial.addEventListener('disconnect', this.onDisconnect)
    navigator.usb.addEventListener('disconnect', this.onDisconnect)
  }
})
</script>

<style lang="scss" src="../css/updater.scss"></style>
