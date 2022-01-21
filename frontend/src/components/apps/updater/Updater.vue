<template>
  <div id="updater-container" class="flex column flex-center">
    <div v-show="!updateSuccess" class="connected q-mt-sm">
      <q-card flat>
        <q-card-section horizontal class="text-left">
          <div class="col-6 flex flex-center flipper">
            <img v-if="connection === 3" src="../../../assets/screens/dfu.svg" class="absolute"/>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="0 0 360 156" style="enable-background:new 0 0 360 156;" xml:space="preserve" class="led absolute">
              <g>
                <path :style="'opacity: 0.5; fill:' + ledColor" d="M238.5,98c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S240.4,98,238.5,98z M238.5,92 c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S239.9,92,238.5,92z"/>
              </g>
              <circle :style="'fill:' + ledColor" cx="238.5" cy="94.5" r="2.5"/>
            </svg>
            <img v-if="bodyColor === 'white' || bodyColor === 'unknown'" src="../../../assets/flipper_w.svg" />
            <img v-if="bodyColor === 'black'" src="../../../assets/flipper_b.svg" />
          </div>
          <div class="col-6 q-ml-xl" style="white-space: nowrap;">
            <h5 class="q-mb-none">
              <b>{{ flipper.properties.hardware_name }}&nbsp;</b>
              <span v-if="ui.reconnecting">reconnecting...</span>
              <span v-else-if="connection">connected
                <span v-if="connection === 3">
                  <br />in recovery mode
                </span>
              </span>
              <span v-else class="text-accent">disconnected</span>
            </h5>
            <h5 v-if="mode === 'serial' && flipper.properties.battery">
              Battery: <span :style="'color: ' + batteryColor">{{ flipper.properties.battery ? flipper.properties.battery : 'undefined' }}</span>
            </h5>
          </div>
        </q-card-section>
        <q-card-section v-if="mode === 'serial' && connection !== 1 && !ui.reconnecting" horizontal class="text-left q-ma-md">
          <q-card flat class="col-6">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Stm32 serial:</b></div><div>{{ flipper.properties.hardware_uid }}</div>
                <div><b>Hardware revision:</b></div><div>{{ flipper.properties.hardware_ver }}</div>
                <div><b>Hardware target:</b></div><div>{{ flipper.properties.hardware_target }}</div>
                <div><b>Bluetooth mac:</b></div><div>{{ flipper.properties.radio_ble_mac }}</div>
                <div><b>Region:</b></div><div>{{ region }}</div>
                <div><b>SD card:</b></div><div>{{ flipper.properties.sdCardMounted ? 'mounted' : 'missing' }}</div>
                <template v-if="flipper.properties.databasesPresent !== undefined">
                  <div><b>Databases:</b></div><div>{{ flipper.properties.databasesPresent ? 'present' : 'missing' }}</div>
                </template>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat class="col-6 q-ml-xl">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Firmware version:</b></div><div>{{ flipper.properties.firmware_version !== 'unknown' ? flipper.properties.firmware_version : flipper.properties.firmware_commit }}</div>
                <div><b>Firmware build:</b></div><div>{{ flipper.properties.firmware_build_date }}</div>
                <div><b>Bootloader version:</b></div><div>{{ flipper.properties.bootloader_version !== 'unknown' ? flipper.properties.bootloader_version : flipper.properties.bootloader_commit }}</div>
                <div><b>Bootloader build:</b></div><div>{{ flipper.properties.bootloader_build_date }}</div>
                <div><b>FUS version:</b></div>
                <div v-if="flipper.properties.radio_alive === 'true'">{{ flipper.properties.radio_fus_major + '.' + flipper.properties.radio_fus_minor + '.' + flipper.properties.radio_fus_sub }}</div>
                <div v-else><b>corrupted</b></div>
                <div><b>Radio stack version:</b></div>
                <div v-if="flipper.properties.radio_alive === 'true'">{{ flipper.properties.radio_stack_major + '.' + flipper.properties.radio_stack_minor + '.' + flipper.properties.radio_stack_sub }}</div>
                <div v-else><b>corrupted</b></div>
                <div><b>OTP version:</b></div><div>{{ flipper.properties.hardware_otp_ver }}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-section v-if="mode === 'usb' && connection === 3 && !ui.reconnecting" horizontal class="text-left q-ma-md">
          <q-card flat class="col-6">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Hardware revision:</b></div><div>{{ flipper.properties.hardware_ver }}</div>
                <div><b>Region:</b></div><div>{{ region }}</div>
              </div>
            </q-card-section>
          </q-card>
          <q-card flat class="col-6 q-ml-xl">
            <q-card-section horizontal>
              <div class="properties">
                <div><b>Hardware target:</b></div><div>{{ flipper.properties.hardware_target }}</div>
                <div><b>OTP version:</b></div><div>{{ flipper.properties.hardware_otp_ver }}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <template v-if="checks.radio">
        <template v-if="!isUpdating">
          <template v-if="!ui.reconnecting">
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

            <div v-if="!firmware.fileName.length && status === 1">
              <div v-if="fwModel.value === 'custom'" class="alert">
                <p>
                  <q-icon :name="evaAlertCircleOutline"></q-icon> You are installing <b>unofficial</b> firmware from<br/><b style="word-break: break-all;">{{ this['custom'].url }}</b>
                </p>
                This firmware might be <b>malicious</b> and might <b>break your device</b>!
              </div>

              <div v-if="!checks.target" class="alert">
                <p>
                    <q-icon :name="evaAlertCircleOutline"></q-icon> Looks like <b> {{ firmware.fileName || custom.channel }}</b>  is incompatible with your Flipper&nbsp;Zero hardware revision.<span v-if="custom && custom.files[0].target"> Firmware target: <b>{{ custom.files[0].target }}</b>, Flipper hardware target: <b>f{{ flipper.properties.hardware_target }}</b></span>
                </p>
                This firmware might break your device!
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
                v-if="firmware.fileName.length && !checks.target"
                flat
                color="grey-8"
                @click="update"
                padding="12px 30px"
                class="q-ml-lg"
              >Flash anyway</q-btn>
            </div>

            <div v-if="connection === 0 && !ui.reconnecting" class="flex column flex-center">
              <q-btn
                color="positive"
                padding="12px 30px"
                size="13px"
                class="q-ma-sm"
                @click="$emit('connect')"
              >
                Reconnect
              </q-btn>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="alert" v-if="checks.sha256">
            <h5>Installing firmware (step {{ updateStage }} of {{ mode === 'serial' && (flipper.properties.sdCardMounted || internalStorageFiles) ? '3' : 2 }})</h5>
            <p class="q-mb-md">Don't disconnect your Flipper</p>
          </div>
          <div v-else class="alert">
            <p><q-icon :name="evaAlertCircleOutline"></q-icon> sha256 check has failed for <b>{{ fwModel.value }}</b>!</p>
            Check your connection and try again.
          </div>
          <div v-if="showUsbRecognizeButton">
            <q-btn color="positive" padding="12px 30px" @click="$emit('recognizeDevice', 'usb')">Continue</q-btn>
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
        </template>
      </template>
      <div v-else class="alert">
        <p><q-icon :name="evaAlertCircleOutline"></q-icon> <b>Radio stack on your Flipper is {{ this.flipper.properties.radio_alive === 'true' ? 'outdated' : 'corrupted or missing' }}.</b></p>
        Please update it with <a :href="qFlipperLink">qFlipper</a> (the desktop app).
      </div>

      <div v-if="ui.reconnecting && connection < 2 || rpcStatus.isSession && rpcStatus.operation" class="flex column flex-center q-ma-lg">
        <q-spinner
          v-if="!isUpdating"
          color="accent"
          size="3em"
        ></q-spinner>
        <p v-if="ui.reconnecting && !showUsbRecognizeButton" class="q-ma-sm"><code>Preparing Flipper...</code></p>
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
    <div v-if="updateSuccess">
      <h2>Success!</h2>
      <q-btn color="positive" padding="12px 30px" @click="updateSuccess = false; $emit('connect')">Continue</q-btn>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { emitter } from '../../core/core'

import {
  fetchFirmwareFile,
  loadFirmwareFile
} from './firmwareLoader'

import {
  fetchCopro,
  fetchResources,
  parseManifest,
  compareManifests,
  commandQueue,
  readInternalStorage,
  writeInternalStorage
} from './resourceLoader'
import * as commands from './protobuf/commands/commands'
import xbms from './protobuf/xbms'

import semver from 'semver'
import { sleep, waitForDevice } from '../../util'

import {
  evaAlertCircleOutline
} from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'Updater',

  props: {
    initialMode: String,
    flipper: Object
  },

  setup () {
    return {
      checks: ref({
        crc32: true,
        sha256: true,
        target: true,
        radio: true
      }),
      fetchedManifest: ref(undefined),
      firmware: ref({
        fileName: '',
        loading: false,
        binary: undefined
      }),
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
      newerThanLTS: ref(false),
      progress: ref({
        current: 0,
        max: 1,
        stage: 0
      }),
      resources: ref(undefined),
      rpcStatus: ref({
        isSession: false,
        operation: undefined,
        command: undefined
      }),
      showUsbRecognizeButton: ref(false),
      updateStage: ref(1),
      updateSuccess: ref(false)
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
    bodyColor () {
      switch (Number(this.flipper.properties.hardware_color)) {
        case 1:
          return 'black'
        case 2:
          return 'white'
        default:
          return 'unknown'
      }
    },
    region () {
      switch (Number(this.flipper.properties.hardware_region)) {
        case 1:
          return 'EuRu'
        case 2:
          return 'UsCaAu'
        case 3:
          return 'Jp'
        default:
          return 'unknown'
      }
    },
    connection () {
      return this.flipper.state.connection
    },
    status () {
      return this.flipper.state.status
    },
    mode () {
      return this.$store.state.mode
    },
    userAgent () {
      return this.$store.state.userAgent
    },
    release () {
      return this.$store.state.firmwareChannels.release
    },
    rc () {
      return this.$store.state.firmwareChannels.rc
    },
    dev () {
      return this.$store.state.firmwareChannels.dev
    },
    custom () {
      return this.$store.state.firmwareChannels.custom
    },
    ui () {
      return this.$store.state.ui
    },
    error () {
      return this.$store.state.ui.error
    },
    updateCounter () {
      return this.$store.state.updateCounter
    },
    qFlipperLink () {
      return this.$store.state.qFlipperLink
    }
  },

  methods: {
    // Update sequence
    async update () {
      this.isUpdating = true
      this.updateSuccess = false
      function preventTabClose (event) {
        event.returnValue = ''
      }
      if (this.updateStage === 1) {
        this.$store.commit({
          type: 'incrementUpdateCounter'
        })
        console.log('⎡ Update #' + this.updateCounter, 'started')
        console.log('⎢ Stage 1')

        this.$store.commit({
          type: 'setUiFlag',
          flag: {
            name: 'blockButtons',
            value: true
          }
        })
        window.addEventListener('beforeunload', preventTabClose)
        if (!this.firmware.fileName.length) {
          this.firmware.loading = true
          await this.fetchFirmwareFile(this.fwModel.value)
            .then(() => {
              if (!this.firmware.binary) {
                throw new Error('Failed to fetch firmware')
              }
            })
            .catch(error => {
              console.log('⎣ Update #' + this.updateCounter, 'failed')
              window.removeEventListener('beforeunload', preventTabClose)
              document.title = 'Flipper Zero Update Page'
              this.error.isError = true
              this.error.message = error.message
              this.error.button = 'serial'
              this.$store.commit({
                type: 'setMode',
                mode: 'serial'
              })
              this.$store.commit({
                type: 'setUiFlag',
                flag: {
                  name: 'reconnecting',
                  value: true
                }
              })
              this.updateStage = 1
              this.isUpdating = false
            })
          if (!this.checks.sha256) {
            return
          }
          this.firmware.loading = false
        }

        if (!this.error.isError) {
          if (this.mode === 'serial') {
            await this.backupSettings()
              .catch(async error => {
                console.log('⎣ Update #' + this.updateCounter, 'failed')
                console.log(error)
                document.title = 'Flipper Zero Update Page'
                this.error.isError = true
                this.error.message = error.message
                this.error.button = 'serial'
                this.$store.commit({
                  type: 'setMode',
                  mode: 'serial'
                })
                this.$store.commit({
                  type: 'setUiFlag',
                  flag: {
                    name: 'reconnecting',
                    value: true
                  }
                })
                this.updateStage = 1
                this.isUpdating = false
              })

            await sleep(500)

            this.$store.commit({
              type: 'setUiFlag',
              flag: {
                name: 'reconnecting',
                value: true
              }
            })
            await this.flipper.reboot()
              .then(() => {
                this.updateStage = 2
              })
              .catch(async error => {
                if (error.toString().includes('No known')) {
                  this.showUsbRecognizeButton = true
                } else {
                  console.log(error)
                }
              })
          } else {
            console.log('⎢ Skipped in recovery mode')
            this.updateStage = 2
          }
          this.$store.commit({
            type: 'setUiFlag',
            flag: {
              name: 'blockButtons',
              value: false
            }
          })
          window.removeEventListener('beforeunload', preventTabClose)
        }
      }

      if (this.updateStage === 2) {
        this.$store.commit({
          type: 'setUiFlag',
          flag: {
            name: 'blockButtons',
            value: true
          }
        })
        window.addEventListener('beforeunload', preventTabClose)
        this.flipper.restartWorker('serial')
        this.showUsbRecognizeButton = false
        await this.flipper.connect('usb')
          .catch(error => {
            if (error.toString().includes('No known')) {
              this.showUsbRecognizeButton = true
            } else {
              console.error(error)
            }
          })
        if (this.flipper.state.connection !== 3) {
          return
        }
        this.$store.commit({
          type: 'setUiFlag',
          flag: {
            name: 'reconnecting',
            value: false
          }
        })
        console.log('⎢ Stage 2')

        const unbind = emitter.on('log progress', progress => {
          this.progress = progress
        })

        console.log('⎢ ⎡ Begin writing firmware')
        await this.flipper.writeFirmware({ file: this.firmware.binary, startAddress: this.firmware.startAddress })
          .then(async () => {
            console.log('⎢ ⎣ End writing firmware')
            unbind()
            console.log('⎢ ⎡ Rebooting to serial')
            if (this.mode === 'usb') {
              this.$store.commit({
                type: 'setMode',
                mode: 'serial'
              })
              this.flipper.restartWorker('usb')
            }
            this.$store.commit({
              type: 'setUiFlag',
              flag: {
                name: 'reconnecting',
                value: true
              }
            })
            await waitForDevice('rebooted to serial')
            console.log('⎢ ⎣ Rebooted to serial')
            document.title = 'Flipper Zero Update Page'
            this.$store.commit({
              type: 'setUiFlag',
              flag: {
                name: 'reconnecting',
                value: false
              }
            })

            console.log('⎢ ⎡ Connecting')
            await this.rawConnect()
            if (this.connection !== 2) {
              throw new Error('reconnection timeout')
            }
            console.log('⎢ ⎣ Connected')

            if (this.flipper.properties.sdCardMounted === undefined) {
              console.log('⎢ ⎡ Reading properties')
              this.$emit('read-properties')
              for (let i = 0; i < 20; i++) {
                if (this.flipper.properties.sdCardMounted) {
                  break
                }
                await sleep(500)
              }
              this.flipper.restartWorker()
              await this.rawConnect()
              console.log('⎢ ⎣ Read properties')
            }

            if (this.mode === 'serial') {
              if (this.flipper.properties.sdCardMounted) {
                if (!this.resources) {
                  await this.fetchResources('dev')
                }
                await sleep(500)
                this.updateStage = 3
                console.log('⎢ Stage 3')
                await this.updateResources()
              } else if (this.internalStorageFiles) {
                await sleep(500)
                console.log('⎢ Stage 3')
                this.updateStage = 3
                await this.restoreSettings()
              }
            }

            await sleep(500)
            this.flipper.write('cli/delimited', 'reboot')
            await waitForDevice('rebooted to serial')
            this.updateSuccess = true

            this.$store.commit({
              type: 'setUiFlag',
              flag: {
                name: 'blockButtons',
                value: false
              }
            })
            window.removeEventListener('beforeunload', preventTabClose)
            this.updateStage = 1
            this.isUpdating = false

            console.log('⎣ Update #' + this.updateCounter, 'finished')

            if (document.location.search.includes('infinite=true')) {
              await sleep(5000)
              this.updateSuccess = false
              return this.update()
            }
          })
          .catch(async error => {
            console.log('⎣ Update #' + this.updateCounter, 'failed')
            console.error(error)
            unbind()
            document.title = 'Flipper Zero Update Page'
            this.error.isError = true
            if (error.toString().includes('stall')) {
              this.error.message = 'Flipper USB port may be occupied by another process. Close it and try again.'
            } else {
              this.error.message = error
            }
            this.error.button = 'dfu'
            await this.flipper.disconnect()
            this.$store.commit({
              type: 'setMode',
              mode: 'serial'
            })
            this.$store.commit({
              type: 'setUiFlag',
              flag: {
                name: 'reconnecting',
                value: true
              }
            })
            this.updateStage = 1
            this.isUpdating = false
          })
      }
    },

    async fetchFirmwareFile (channel) {
      await fetchFirmwareFile(channel, this[channel.toLowerCase()].files, this.flipper.properties.hardware_target)
        .then(({ binary, startAddress, targetCheck, crc32Check }) => {
          this.firmware.binary = binary
          this.firmware.startAddress = startAddress
          this.checks.target = targetCheck
          this.checks.crc32 = crc32Check
        })
        .catch(error => {
          if (error.message && error.message === 'SHA256 check failed') {
            this.checks.sha256 = false
          } else {
            throw error
          }
        })
    },

    async loadFirmwareFile (event) {
      this.firmware.fileName = event.target.files[0].name
      await loadFirmwareFile(event.target.files[0], this.flipper.properties.hardware_target)
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
      console.log('⎢ ⎡ Begin settings backup')
      const startPing = await commands.startRpcSession(this.flipper)
      if (!startPing.resolved || startPing.error) {
        throw new Error('Couldn\'t start rpc session')
      }
      this.rpcStatus.isSession = true

      const startVirtualDisplay = await commands.gui.startVirtualDisplay({ data: new Uint8Array(xbms.updating) })
      if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
        console.error('Couldn\'t start virtual display session')
      } else {
        const data = new Uint8Array(xbms.updating)
        await commands.gui.screenFrame(data)
      }

      const unbind = emitter.on('readInternalStorage', status => {
        if (status === 'start') {
          this.rpcStatus.operation = 'Settings backup in progress'
        } else {
          this.rpcStatus.operation = undefined
        }
      })

      const unbindCQ = emitter.on('storageRead', c => {
        const corner = c.status === 'ok' ? '⎣ ' : '⎡ '
        console.log('⎢ ⎢ ' + corner + 'read', c.path, 'status:', c.status)
      })

      this.internalStorageFiles = await readInternalStorage()
      await sleep(500)

      await commands.stopRpcSession()
      unbind()
      unbindCQ()
      console.log('⎢ ⎣ End settings backup')
    },

    async restoreSettings (isVirtualDisplaySession) {
      const nested = isVirtualDisplaySession ? '⎢ ' : ''
      console.log('⎢ ' + nested + '⎡ Begin restoring settings')
      if (!isVirtualDisplaySession) {
        const startPing = await commands.startRpcSession(this.flipper)
        if (!startPing.resolved || startPing.error) {
          throw new Error('Couldn\'t start rpc session')
        }

        const startVirtualDisplay = await commands.gui.startVirtualDisplay({ data: new Uint8Array(xbms.updating) })
        if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
          console.error('Couldn\'t start virtual display session')
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

      const unbindCQ = emitter.on('commandQueue/progress', c => {
        const corner = c.status === 'ok' ? '⎣ ' : '⎡ '
        console.log('⎢ ' + nested + '⎢ ' + corner + c.name, c.path || '', 'status:', c.status)
      })

      await writeInternalStorage(this.internalStorageFiles)

      await commands.gui.stopVirtualDisplay()
      await commands.stopRpcSession()

      unbind()
      unbindCQ()
      console.log('⎢ ' + nested + '⎣ End restoring settings')
    },

    async updateResources () {
      console.log('⎢ ⎡ Begin updating databases')
      const startPing = await commands.startRpcSession(this.flipper)
      if (!startPing.resolved || startPing.error) {
        throw new Error('Couldn\'t start rpc session')
      }

      const startVirtualDisplay = await commands.gui.startVirtualDisplay({ data: new Uint8Array(xbms.updating) })
      if (!startVirtualDisplay.resolved || startVirtualDisplay.error) {
        console.error('Couldn\'t start virtual display session')
      }

      const empty = {
        version: undefined,
        timestamp: undefined,
        storage: {}
      }
      const manifest = await commands.storage.read('/ext/Manifest')
        .then(async res => {
          const parsed = parseManifest(res)
          if (parsed === 'invalid manifest') {
            await commands.storage.remove('/ext/Manifest')
            return empty
          }
          return parsed
        })
        .catch(error => {
          if (error === 'ERROR_STORAGE_NOT_EXIST') {
            return empty
          }
        })
      this.$emit('setManifest', manifest)

      try {
        const queue = compareManifests(this.flipper.manifest, this.fetchedManifest, this.resources)
        const unbind = emitter.on('commandQueue/progress', c => {
          this.rpcStatus.operation = 'Writing static resources'
          this.rpcStatus.command = c
          const corner = c.status === 'ok' ? '⎣ ' : '⎡ '
          console.log('⎢ ⎢ ' + corner + c.name, c.path, 'status:', c.status)
        })
        const globalStart = Date.now()
        await commandQueue(queue)
        console.log('⎢ ⎢  Databases updated in ' + (Date.now() - globalStart) + ' ms')
        unbind()
        if (this.internalStorageFiles) {
          await this.restoreSettings(true)
        }
        console.log('⎢ ⎣ End updating databases')
      } catch (error) {
        console.log(error)
        await commands.stopRpcSession()
        console.log('⎢ ⎣ Error while updating databases')
      }
    },

    // Utils
    async rawConnect () {
      await this.flipper.connect('serial')
      for (let i = 0; i < 30; i++) {
        if (this.connection === 2) {
          break
        }
        await sleep(200)
      }
    },

    compareVersions () {
      if (this.flipper.properties.firmware_version) {
        if (this.flipper.properties.firmware_version !== 'unknown') {
          if (semver.eq(this.flipper.properties.firmware_version, this.release.version)) {
            this.isOutdated = false
          } else if (semver.gt(this.flipper.properties.firmware_version, this.release.version)) {
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

    cancelUpload () {
      this.firmwareFile = undefined
      this.firmware.fileName = ''
      this.crc32Check = true
      this.firmwareTargetCheck = true
    }
  },

  created () {
    this.evaAlertCircleOutline = evaAlertCircleOutline
  },

  async mounted () {
    this.fwOptions[0].version = this.release.version
    this.fwOptions[1].version = this.rc.version
    this.fwOptions[2].version = this.dev.version
    if (this.custom) {
      this.fwOptions.unshift({
        label: this.custom.channel || 'Custom', value: 'custom', version: this.custom.version || 'unknown'
      })
    }
    this.fwModel = this.fwOptions[0]

    this.compareVersions()
    if (this.custom && this.custom.files[0].target) {
      this.checks.target = 'f' + this.flipper.properties.hardware_target === this.custom.files[0].target
    }

    if (this.flipper.properties.radio_alive === 'true') {
      const channel = this.fwModel.value
      const coproManifest = await fetchCopro(channel, this[channel.toLowerCase()].files)
      const manifestVersion = coproManifest.copro.radio.version.major + '.' + coproManifest.copro.radio.version.minor + '.' + coproManifest.copro.radio.version.sub
      const flipperVersion = this.flipper.properties.radio_stack_major + '.' + this.flipper.properties.radio_stack_minor + '.' + this.flipper.properties.radio_stack_sub
      this.checks.radio = !semver.lt(flipperVersion, manifestVersion)
    } else if (this.mode === 'serial') {
      this.checks.radio = false
    }
  }
})
</script>

<style lang="scss" src="../../../css/updater.scss"></style>
