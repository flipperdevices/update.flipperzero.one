<template>
  <div id="updater-container" class="flex column flex-center">
    <div v-show="showOverlay" class="popup-overlay z-max">
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
          <div class="text-subtitle2">{{ error.message }}<a v-if="error.message && error.message.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
        </q-card-section>

        <q-separator dark v-if="error.button.length"></q-separator>

        <q-card-actions v-if="error.button.length" align="right" class="text-white">
        <q-btn flat @click="error.isError = false; connect()">Reconnect</q-btn>
        </q-card-actions>
      </q-card>
      <div class="absolute-bottom-right q-mr-lg text-white text-right">
        <div v-if="error.isError" style="min-width: 200px">
          <q-btn
            :disabled="connection === 3 && status === 3"
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

    <div v-show="showArrows && !$q.screen.xs" class="arrows z-max">
      <div id="arrow-1">
        <q-icon :name="evaArrowBackOutline"></q-icon>
        <div>
          <span class="q-pl-sm">1. {{ mode === 'serial' ? 'Find your Flipper in dropdown menu' : 'Find your Flipper in recovery mode (DFU in FS Mode)' }}</span>
          <div v-if="!error.isError && mode === 'usb'" class="flex flex-center flipper q-mt-lg">
            <img src="../assets/screens/dfu.svg" class="absolute"/>
            <img src="../assets/flipper_w.svg" />
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="0 0 360 156" style="enable-background:new 0 0 360 156;" xml:space="preserve" class="led absolute">
              <g>
                <path style="opacity: 0.5; fill: #007eff;" d="M238.5,98c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S240.4,98,238.5,98z M238.5,92 c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S239.9,92,238.5,92z"/>
              </g>
              <circle style="fill: #007eff;" cx="238.5" cy="94.5" r="2.5"/>
            </svg>
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
        <div class="text-subtitle2">{{ error.message }}<a v-if="error.message && error.message.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
      </q-card-section>

      <q-separator v-if="error.button.length"></q-separator>

      <q-card-actions v-if="error.button.length" align="right">
        <q-btn flat @click="error.isError = false; connect()">Reconnect</q-btn>
      </q-card-actions>
    </q-card>

    <div v-show="!error.isError" class="connected q-mt-sm">
      <div v-if="flipperResponds">
        <q-card flat>
          <q-card-section horizontal class="text-left">
            <div class="col-6 flex flex-center flipper">
              <img v-if="connection === 3" src="../assets/screens/dfu.svg" class="absolute"/>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 360 156" style="enable-background:new 0 0 360 156;" xml:space="preserve" class="led absolute">
                <g>
                  <path :style="'opacity: 0.5; fill:' + ledColor" d="M238.5,98c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S240.4,98,238.5,98z M238.5,92 c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S239.9,92,238.5,92z"/>
                </g>
                <circle :style="'fill:' + ledColor" cx="238.5" cy="94.5" r="2.5"/>
              </svg>
              <img v-if="flipper.properties.bodyColor === 'white' || flipper.properties.bodyColor === 'unknown'" src="../assets/flipper_w.svg" />
              <img v-if="flipper.properties.bodyColor === 'black'" src="../assets/flipper_b.svg" />
            </div>
            <div class="col-6 q-ml-xl" style="white-space: nowrap;">
              <h5 class="q-mb-none">
                <b>{{ flipper.properties.name }}&nbsp;</b>
                <span v-if="reconnecting">reconnecting...</span>
                <span v-else-if="connection">connected
                  <span v-if="connection === 3">
                    <br />in recovery mode
                  </span>
                </span>
                <span v-else class="text-accent">disconnected</span>
              </h5>
              <q-toggle
                v-model="autoReconnectEnabled"
                color="positive"
                label="Auto-reconnect"
                left-label
              ></q-toggle>
              <h5 v-if="mode === 'serial'">
                Battery: <span :style="'color: ' + batteryColor">{{ flipper.properties.battery }}</span>
              </h5>
            </div>
          </q-card-section>
          <q-card-section v-if="mode === 'serial' && connection !== 1 && !reconnecting" horizontal class="text-left q-ma-md">
            <q-card flat class="col-6">
              <q-card-section horizontal>
                <div class="properties">
                  <div><b>Device type:</b></div><div>{{ flipper.properties.type }}</div>
                  <div><b>Device name:</b></div><div>{{ flipper.properties.name }}</div>
                  <div><b>Stm32 serial:</b></div><div>{{ flipper.properties.stm32Serial }}</div>
                  <div><b>Hardware revision:</b></div><div>{{ flipper.properties.hardwareVer }}</div>
                  <div><b>Hardware target:</b></div><div>{{ flipper.properties.target }}</div>
                  <div><b>Bluetooth mac:</b></div><div>{{ flipper.properties.btMac }}</div>
                  <div><b>Region:</b></div><div>{{ flipper.properties.region }}</div>
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
                  <div><b>OTP version:</b></div><div>{{ flipper.properties.otpVer }}</div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
          <q-card-section v-if="mode === 'usb' && connection === 3 && !reconnecting" horizontal class="text-left q-ma-md">
            <q-card flat class="col-6">
              <q-card-section horizontal>
                <div class="properties">
                  <div><b>Hardware revision:</b></div><div>{{ flipper.properties.hardwareVer }}</div>
                  <div><b>Region:</b></div><div>{{ flipper.properties.region }}</div>
                </div>
              </q-card-section>
            </q-card>
            <q-card flat class="col-6 q-ml-xl">
              <q-card-section horizontal>
                <div class="properties">
                  <div><b>Hardware target:</b></div><div>{{ flipper.properties.target }}</div>
                  <div><b>OTP version:</b></div><div>{{ flipper.properties.otpVer }}</div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>

        <div v-if="!isUpdating">
          <div v-if="!reconnecting">
            <div v-if="isOutdated && connection === 2" id="outdated">
              <p v-if="!firmware.fileName.length">
                Your firmware is outdated, latest release is <b>{{ release.version }}</b>
              </p>
            </div>
            <div v-if="isOutdated === false && connection === 2" id="up-to-date">
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

            <div v-if="!firmware.fileName.length && status === 1">
              <div v-if="fwModel.value === 'custom'" class="alert">
                <p class="ellipsis">
                  <q-icon :name="evaAlertCircleOutline"></q-icon> You are installing <b>unofficial</b> firmware from<br/>{{ this['custom'].url }}!
                </p>
                This firmware might be <b>malicious</b> and might <b>break your device</b>!
              </div>

              <div v-if="checks.sha256 && connection !== 0" class="flex flex-center">
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
                  padding="12px 30px"
                  class="q-ml-lg"
                  :class="!$q.screen.xs ? '' : 'q-mt-sm'"
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

            <div v-if="connection !== 0 && status === 1" class="flex flex-center q-mt-md">
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

            <div v-if="connection === 0 && !reconnecting" class="flex column flex-center alert">
              <span>Information is valid on {{ disconnectTime }}</span>
              <q-btn
                color="positive"
                padding="12px 30px"
                size="13px"
                class="q-ma-sm"
                @click="connect"
              >
                Reconnect
              </q-btn>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="alert">
            <h5>Installing firmware (step {{ updateStage }} of {{ mode === 'serial' && (flipper.properties.sdCardMounted || internalStorageFiles) ? '3' : 2 }})</h5>
            <p class="q-mb-md">Don't disconnect your Flipper</p>
          </div>
          <div v-if="showUsbRecognizeButton">
            <q-btn color="positive" padding="12px 30px" @click="recognizeDevice('usb')">Continue</q-btn>
          </div>
          <div v-show="connection === 3 && status === 3 && !showUsbRecognizeButton">
            <q-linear-progress
              rounded
              size="2.25rem"
              :value="progress.current / progress.max"
              color="positive"
              class="q-mt-sm q-mb-lg"
            >
              <div class="absolute-full flex flex-center">
                <q-badge color="white" text-color="positive" :label="progress.stage === 0 ? 'Erasing device memory' : 'Writing data'"></q-badge>
              </div>
            </q-linear-progress>
          </div>
        </div>

        <div v-if="reconnecting && connection < 2 || rpcStatus.isSession && rpcStatus.operation" class="flex column flex-center q-ma-lg">
          <q-spinner
            v-if="!isUpdating"
            color="accent"
            size="3em"
          ></q-spinner>
          <p v-if="reconnecting && !showUsbRecognizeButton" class="q-ma-sm"><code>Preparing Flipper...</code></p>
          <p v-else-if="rpcStatus.operation" class="q-ma-sm">
              <code>
                {{ rpcStatus.operation }}
                <span v-if="rpcStatus.command">
                  :&nbsp; {{ rpcStatus.command.name + ' ' +  rpcStatus.command.path }}
                </span>
              </code>
          </p>
        </div>
      </div>
      <q-spinner
        v-else
        color="accent"
        size="3em"
      ></q-spinner>
    </div>

    <div class="absolute-top-right" v-if="!this.error.isError && flipperResponds">
      <q-btn
        v-if="!showPaint && connection === 2"
        flat
        dense
        :color="showTerminal ? 'grey-2' : 'grey-7'"
        :icon="showTerminal ? evaCloseOutline : mdiConsole"
        size="16px"
        class="q-ma-sm"
        :class="showTerminal ? 'z-max' : 'z-top'"
        :style="showTerminal ? 'position: fixed; right: 0; top: 0;' : ''"
        @click="toggleTerminal"
      ></q-btn>

      <q-btn
        v-if="paintEnabled && connection === 2"
        flat
        dense
        color="grey-7"
        :icon="showPaint ? evaCloseOutline : evaBrushOutline"
        size="16px"
        class="q-ma-sm"
        :class="showPaint ? 'z-max' : 'z-top'"
        @click="togglePaint"
      ></q-btn>
    </div>

    <q-btn
      :disabled="connection === 3 && status === 3"
      flat
      color="grey-8"
      size="13px"
      class="absolute-bottom-right q-ma-sm"
      @click="changeMode(!!(true * this.flipper.state.connection))"
    >{{mode == 'serial' ? 'Recovery mode' : 'Normal mode'}}</q-btn>

    <Terminal
      v-if="terminalEnabled"
      v-show="showTerminal"
      :flipper="flipper"
      ref="Terminal"
    />

    <Paint
      v-if="paintEnabled && showPaint"
      :flipper="flipper"
    />
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import Terminal from './Terminal.vue'
import Paint from './Paint.vue'
import { Flipper, emitter } from './updater/core'

import {
  fetchFirmwareFile,
  loadFirmwareFile
} from './updater/firmwareLoader'

import {
  fetchResources,
  parseManifest,
  compareManifests,
  commandQueue,
  readInternalStorage,
  writeInternalStorage
} from './updater/resourceLoader'
import * as pbCommands from './updater/protobuf/commands'
import xbms from './updater/protobuf/xbms'

import semver from 'semver'
import { sleep, waitForDevice } from './updater/util'

import {
  mdiChevronDown,
  mdiConsole
} from '@quasar/extras/mdi-v5'
import {
  evaArrowBackOutline,
  evaArrowUpwardOutline,
  evaAlertCircleOutline,
  evaRefreshOutline,
  evaCloseOutline,
  evaBrushOutline
} from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'Updater',

  components: {
    Terminal,
    Paint
  },

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
    const autoReconnectEnabled = ref(false)
    watch(
      () => autoReconnectEnabled.value,
      (state) => {
        localStorage.setItem('autoReconnectEnabled', Number(state))
      }
    )
    return {
      autoReconnectEnabled,
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
      fetchedManifest: ref(undefined),
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
      internalStorageFiles: ref(undefined),
      isOutdated: ref(false),
      isUpdating: ref(false),
      mode: ref('serial'),
      newerThanLTS: ref(false),
      paintEnabled: ref(false),
      progress: ref({
        current: 0,
        max: 1,
        stage: 0
      }),
      reconnecting: ref(false),
      reconnectLoop: ref(undefined),
      resources: ref(undefined),
      rpcStatus: ref({
        isSession: false,
        operation: undefined,
        command: undefined
      }),
      showArrows: ref(false),
      showOverlay: ref(false),
      showPaint: ref(false),
      showTerminal: ref(false),
      showUsbRecognizeButton: ref(false),
      terminalEnabled: ref(false),
      updateStage: ref(1)
    }
  },

  computed: {
    batteryColor () {
      let color = ''
      const b = parseInt(this.flipper.properties.battery)
      if (!isNaN(b)) {
        if (b > 50) {
          color = '#49c74a'
        } else if (b <= 50 && b > 20) {
          color = '#ff9e29'
        } else {
          color = '#e23e3e'
        }
      }
      return color
    },
    ledColor () {
      let color = ''
      if (this.flipper.state.connection === 3) {
        color = '#007eff'
      } else {
        const b = parseInt(this.flipper.properties.battery)
        if (!isNaN(b)) {
          if (b === 100) {
            color = '#49c74a'
          } else {
            color = '#e23e3e'
          }
        }
      }
      return color
    },
    connection () {
      return this.flipper.state.connection
    },
    status () {
      return this.flipper.state.status
    },
    flipperResponds () {
      return !!this.flipper.properties.name
    }
  },

  methods: {
    // Startup
    async connect () {
      if (this.reconnectLoop) {
        clearInterval(this.reconnectLoop)
      }
      try {
        this.init()

        await this.flipper.connect(this.mode)
          .then(() => {
            if (this.flipper.state.connection === 0) {
              throw new Error('No device selected')
            }
          })
          .catch(async error => {
            if (error.message && error.message.includes('No known')) {
              return this.recognizeDevice(this.mode)
            } else {
              if (error.message && error.message.includes('Failed to open')) {
                throw new Error('Flipper serial port may be occupied by another process, close it and try again.')
              } else if (error.message && error.message.includes("'open' on 'SerialPort'")) {
                this.flipper.restartWorker()
                return this.connect()
              } else {
                console.log(error)
              }
              throw error
            }
          })

        if (!this.error.isError && !this.reconnecting) {
          return this.readProperties()
        }
      } catch (error) {
        this.showArrows = false
        this.error.isError = true
        this.error.message = error.message || error
        this.error.button = this.mode
      }
    },

    async readProperties () {
      const responseCheck = setTimeout(() => {
        if (!this.flipper.properties.name) {
          this.error.isError = true
          this.error.message = 'Flipper does not respond to CLI commands. Try reconnecting/rebooting.'
          this.error.button = this.mode
        }
      }, 2000)
      await this.flipper.readProperties()
      clearTimeout(responseCheck)
      if (!this.error.isError) {
        this.compareVersions()
      }
    },

    // Update sequence
    async update () {
      this.isUpdating = true
      if (this.updateStage === 1) {
        if (!this.firmware.fileName.length) {
          this.firmware.loading = true
          await this.fetchFirmwareFile(this.fwModel.value)
          this.firmware.loading = false
        }

        if (this.mode === 'serial') {
          if (!this.resources && this.flipper.properties.sdCardMounted) {
            await this.fetchResources('dev')
          }
          await this.backupSettings()
          await sleep(500)

          this.reconnecting = true
          await this.flipper.reboot()
            .then(() => {
              this.updateStage = 2
            })
            .catch(async error => {
              if (error.message && error.message.includes('No known')) {
                this.showUsbRecognizeButton = true
              } else {
                console.log(error)
              }
            })
        } else {
          this.updateStage = 2
        }
      }

      if (this.updateStage === 2) {
        this.showUsbRecognizeButton = false
        await this.flipper.connect('usb')
        this.reconnecting = false
        function preventTabClose (event) {
          event.returnValue = ''
        }
        window.addEventListener('beforeunload', preventTabClose)

        const unbind = emitter.on('log progress', progress => {
          this.progress = progress
        })

        await this.flipper.writeFirmware({ file: this.firmware.binary, startAddress: this.firmware.startAddress })
          .then(async () => {
            window.removeEventListener('beforeunload', preventTabClose)
            if (this.mode === 'usb') {
              this.mode = 'serial'
            }
            this.reconnecting = true
            await waitForDevice('rebooted to serial')
            this.reconnecting = false

            unbind()

            await this.connect()

            if (this.mode === 'serial') {
              if (this.resources && this.flipper.properties.sdCardMounted) {
                await sleep(500)
                this.updateStage = 3
                await this.updateResources()
              } else if (this.internalStorageFiles) {
                await sleep(500)
                this.updateStage = 3
                await this.restoreSettings()
              } else {
                console.log('this.resources:', this.resources, 'sdCard:', this.flipper.properties.sdCardMounted)
              }
            }

            document.title = 'Flipper Zero Update Page'

            this.updateStage = 1
            this.isUpdating = false
          })
          .catch(async error => {
            console.log(error)
            this.error.isError = true
            if (error.message && error.message.includes('stall')) {
              this.error.message = 'Flipper USB port may be occupied by another process. Close it and try again.'
            } else {
              this.error.message = error
            }
            this.error.button = 'dfu'
            await this.flipper.disconnect()
            this.mode = 'serial'
            this.reconnecting = true
          })
      }
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

    // Resourses update
    async fetchResources (channel) {
      await fetchResources(channel, this[channel.toLowerCase()].files)
        .then(files => {
          files.forEach(f => {
            f.name = f.name.replace('resources/', '')
          })
          this.resources = files
          return parseManifest(files.find(e => e.name === 'Manifest').buffer)
        })
        .then(manifest => {
          this.fetchedManifest = manifest
        })
        .catch(error => {
          console.log(error)
        })
    },

    async backupSettings () {
      const startPing = await pbCommands.startRpcSession(this.flipper)
      if (!startPing.resolved || startPing.error) {
        console.log('Couldn\'t start rpc session:', startPing.error)
        return
      }
      this.rpcStatus.isSession = true

      const startVirtualDisplay = await pbCommands.guiStartVirtualDisplay()
      if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
        console.log('Couldn\'t start virtual display session:', startVirtualDisplay.error)
      } else {
        const data = new Uint8Array(xbms.pngtest)
        await pbCommands.guiScreenFrame(data)
      }

      const unbind = emitter.on('readInternalStorage', status => {
        if (status === 'start') {
          this.rpcStatus.operation = 'Settings backup in progress'
        } else {
          this.rpcStatus.operation = undefined
        }
      })
      this.internalStorageFiles = await readInternalStorage()
      await sleep(500)

      await pbCommands.stopRpcSession()
      unbind()
    },

    async restoreSettings (isVirtualDisplaySession) {
      if (!isVirtualDisplaySession) {
        const startVirtualDisplay = await pbCommands.guiStartVirtualDisplay()
        if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
          console.log('Couldn\'t start virtual display session:', startVirtualDisplay.error)
        } else {
          const data = new Uint8Array(xbms.pngtest)
          await pbCommands.guiScreenFrame(data)
        }
      }

      this.rpcStatus.command = undefined
      const unbind = emitter.on('writeInternalStorage', status => {
        if (status === 'start') {
          this.rpcStatus.operation = 'Restoring settings'
        } else {
          this.rpcStatus.operation = undefined
        }
      })
      await writeInternalStorage(this.internalStorageFiles)

      await pbCommands.guiStopVirtualDisplay()

      unbind()
    },

    async updateResources () {
      const startPing = await pbCommands.startRpcSession(this.flipper)
      if (!startPing.resolved || startPing.error) {
        console.log('Couldn\'t start rpc session:', startPing.error)
        return
      }

      const startVirtualDisplay = await pbCommands.guiStartVirtualDisplay()
      if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
        console.log('Couldn\'t start virtual display session:', startVirtualDisplay.error)
      } else {
        const data = new Uint8Array(xbms.pngtest)
        await pbCommands.guiScreenFrame(data)
      }

      const empty = {
        version: undefined,
        timestamp: undefined,
        storage: {}
      }
      this.flipper.manifest = await pbCommands.storageRead('/ext/Manifest')
        .then(async res => {
          const parsed = parseManifest(res)
          if (parsed === 'invalid manifest') {
            await pbCommands.storageDelete('/ext/Manifest')
            return empty
          }
          return parsed
        })
        .catch(error => {
          if (error === 'ERROR_STORAGE_NOT_EXIST') {
            return empty
          }
        })

      try {
        const queue = compareManifests(this.flipper.manifest, this.fetchedManifest, this.resources)
        const unbind = emitter.on('commandQueue/progress', c => {
          this.rpcStatus.operation = 'Writing static resources'
          this.rpcStatus.command = c
        })
        const globalStart = Date.now()
        await commandQueue(queue)
        console.log('Resources updated in ' + (Date.now() - globalStart) + ' ms')
        unbind()
        await this.restoreSettings(true)
      } catch (error) {
        console.log(error)
        await pbCommands.stopRpcSession()
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
        btMac: undefined,
        otpVer: undefined
      }
      this.isOutdated = undefined
      this.newerThanLTS = false
      this.reconnecting = false
      this.showArrows = false
      this.showOverlay = false
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
          .catch(async error => {
            if (error.message && error.message.includes('No known')) {
              this.recognizeDevice(this.mode)
            }
          })
        await waitForDevice('rebooted to ' + this.mode)
        this.reconnecting = false
        await this.readProperties()
      } else {
        await this.connect()
      }
    },

    async recognizeDevice (mode) {
      if (this.reconnectLoop) {
        clearInterval(this.reconnectLoop)
      }
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
                return this.connect()
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
                if (this.mode === mode) {
                  return this.connect()
                } else {
                  this.updateStage = 2
                  return this.update()
                }
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
        document.getElementById('arrow-2').style.top = '399px'
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
      if (this.showTerminal) {
        this.toggleTerminal()
      }

      const d = new Date(Date.now())
      this.disconnectTime = d.toTimeString().slice(0, 5) + ' ' + d.toLocaleDateString('en-US')
      this.flipper.state.connection = 0

      if (this.mode === 'serial' && !this.reconnecting) {
        this.flipper.disconnect()
      }

      if (!this.reconnecting) {
        this.autoReconnect()
      }
    },

    autoReconnect () {
      if (this.reconnectLoop) {
        clearInterval(this.reconnectLoop)
        this.reconnectLoop = undefined
      }
      if (this.autoReconnectEnabled) {
        this.reconnectLoop = setInterval(async () => {
          if (!this.reconnecting) {
            let ports, filters
            if (this.mode === 'serial') {
              filters = [
                { usbVendorId: 0x0483, usbProductId: 0x5740 }
              ]
              ports = await navigator.serial.getPorts({ filters })
            } else if (this.mode === 'usb') {
              filters = [
                { vendorId: 0x0483, productId: 0xdf11 }
              ]
              ports = await navigator.usb.getDevices({ filters })
            }
            if (ports && ports.length > 0) {
              clearInterval(this.reconnectLoop)
              this.reconnectLoop = undefined
              return await this.connect()
            }
          }
        }, 3000)
      }
    },

    async toggleTerminal () {
      if (this.flipper.state.connection === 2 && this.flipper.state.status === 2) {
        await this.flipper.closeReader()
      }

      if (!this.terminalEnabled) {
        this.terminalEnabled = true
      } else {
        if (!this.showTerminal) {
          this.$refs.Terminal.read()
        }
      }

      this.showTerminal = !this.showTerminal
      document.querySelector('body').style.overflowY = this.showTerminal ? 'hidden' : 'auto'
    },

    async togglePaint () {
      if (this.flipper.state.connection === 2 && this.flipper.state.status === 2) {
        await this.flipper.closeReader()
      }

      this.showPaint = !this.showPaint
    }
  },

  created () {
    this.mdiChevronDown = mdiChevronDown
    this.mdiConsole = mdiConsole
    this.evaArrowBackOutline = evaArrowBackOutline
    this.evaArrowUpwardOutline = evaArrowUpwardOutline
    this.evaAlertCircleOutline = evaAlertCircleOutline
    this.evaRefreshOutline = evaRefreshOutline
    this.evaCloseOutline = evaCloseOutline
    this.evaBrushOutline = evaBrushOutline

    window.addEventListener('keydown', (e) => {
      if (!this.showTerminal && e.key === 'Escape') {
        this.showOverlay = false
      }
    })
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

    const stored = parseInt(localStorage.getItem('autoReconnectEnabled'))
    if (!isNaN(stored)) {
      this.autoReconnectEnabled = !!stored
    } else {
      this.autoReconnectEnabled = true
      localStorage.setItem('autoReconnectEnabled', '1')
    }

    this.paintEnabled = document.location.search.includes('paint=true')

    this.connect()

    navigator.serial.addEventListener('disconnect', this.onDisconnect)
    navigator.usb.addEventListener('disconnect', this.onDisconnect)
  }
})
</script>

<style lang="scss" src="../css/updater.scss"></style>
