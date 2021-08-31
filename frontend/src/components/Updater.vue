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
          <div class="text-subtitle2">{{ error.msg }}<a v-if="error.msg.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
        </q-card-section>

        <q-separator dark v-if="error.button.length"></q-separator>

        <q-card-actions v-if="error.button.length" align="right" class="text-white">
          <q-btn flat v-if="error.button === 'connectSerial'" @click="reconnect('serial')">Reconnect</q-btn>
          <q-btn flat v-if="error.button === 'connectDFU'" @click="reconnect('dfu')">Reconnect</q-btn>
          <q-btn flat v-if="error.button === 'connectRecovery'" @click="reconnect('dfu')">Recovery mode</q-btn>
        </q-card-actions>
      </q-card>
      <div class="absolute-bottom-right q-mr-lg text-white text-right">
        <div v-if="error.isError" style="min-width: 200px">
          <q-btn
            v-if="mode !== 'dfu' && userAgent.serial"
            :disabled="status === 'Writing firmware'"
            outline
            color="white"
            size="13px"
            class="q-ma-sm"
            @click="mode = 'dfu'; gotoDFU()"
          >Recovery mode</q-btn>
          <q-btn
            v-if="mode === 'dfu' && userAgent.serial"
            :disabled="status === 'Writing firmware'"
            outline
            color="white"
            size="13px"
            class="q-ma-sm"
            @click="mode = 'serial'; connectSerial()"
          >Normal mode</q-btn>
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

    <div v-show="loadingSerial">
      <q-spinner
        color="accent"
        size="3em"
      ></q-spinner>
      <p v-if="loadingSerial">
        Connecting to Flipper...
      </p>
    </div>

    <q-card v-show="error.isError && !showOverlay" id="error">
      <q-card-section class="bg-negative text-white text-left">
        <div class="text-h6"><q-icon :name="evaAlertCircleOutline"></q-icon> Error</div>
        <div class="text-subtitle2">{{ error.msg }}<a v-if="error.msg.includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
      </q-card-section>

      <q-separator v-if="error.button.length"></q-separator>

      <q-card-actions v-if="error.button.length" align="right">
        <q-btn flat v-if="error.button === 'connectSerial'" @click="reconnect('serial')">Reconnect</q-btn>
        <q-btn flat v-if="error.button === 'connectDFU'" @click="reconnect('dfu')">Reconnect</q-btn>
        <q-btn flat v-if="error.button === 'connectRecovery'" @click="reconnect('dfu')">Recovery mode</q-btn>
      </q-card-actions>
    </q-card>

    <div v-show="showSerialMenu && mode !== 'dfu' && !error.isError && !loadingSerial" class="connected q-mt-sm">
      <q-card flat>
        <q-card-section horizontal class="text-left">
          <div class="col-6 flex flex-center flipper">
            <img v-if="status === 'Connected to Flipper in DFU mode' || status === 'Writing firmware'" src="../assets/flipper-dfu-overlay.png" class="absolute"/>
            <img v-if="flipper.bodyColor === 'white' || flipper.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
            <img v-if="flipper.bodyColor === 'black'" src="../assets/flipper-black.png" />
          </div>
          <div class="col-6 q-ml-xl" style="white-space: nowrap;">
            <h5>
              <b>{{ flipper.name }}&nbsp;</b>
              <span v-if="status !== 'Serial connection lost'">connected
                <span v-if="status === 'Connected to Flipper in DFU mode' || status === 'Writing firmware'">
                  <br />in recovery mode
                </span>!
              </span>
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
<b>Hardware revision:</b>
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
<b>FUS version:</b>
<b>Radio stack version:</b>
<b>Bluetooth mac:</b>
              </pre>
              <pre>
  {{ flipper.firmwareVer }}
  {{ flipper.firmwareBuild }}
  {{ flipper.bootloaderVer }}
  {{ flipper.bootloaderBuild }}
  {{ flipper.radioFusFirmware.major + '.' + flipper.radioFusFirmware.minor + '.' +flipper.radioFusFirmware.sub }}
  {{ flipper.radioFirmware.major + '.' + flipper.radioFirmware.minor + '.' +flipper.radioFirmware.sub }}
  {{ flipper.btMac }}
              </pre>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <div v-if="isOutdated && status !== 'Serial connection lost' && status !== 'Writing firmware'" id="outdated">
        <p v-if="!firmwareFileName.length">
          Your firmware is outdated, latest release is <b>{{ release.version }}</b>
        </p>
      </div>
      <div v-if="!isOutdated && status !== 'Serial connection lost' && status !== 'Writing firmware'" id="up-to-date">
        <p v-if="!firmwareFileName.length && !newerThanLTS">
          Your firmware is up to date.
        </p>
        <p v-if="!firmwareFileName.length && newerThanLTS">
          Your firmware version is ahead of latest release.
        </p>
      </div>

      <div v-if="!sha256Check" class="alert">
        <p><q-icon :name="evaAlertCircleOutline"></q-icon> sha256 check has failed for <b>{{ fwModel.value }}</b>!</p>
        Please contact us ASAP!
      </div>

      <div v-if="!firmwareFileName.length && fwModel.value === 'custom' && status !== 'Serial connection lost' && status !== 'Writing firmware'" class="alert">
        <p class="ellipsis">
          <q-icon :name="evaAlertCircleOutline"></q-icon> You are installing <b>unofficial</b> firmware from<br/>{{ this['custom'].url }}!
        </p>
        This firmware might be <b>malicious</b> and might <b>break your device</b>!
      </div>

      <div v-if="!firmwareFileName.length && sha256Check && status !== 'Writing firmware' && status !== 'Serial connection lost'" class="flex flex-center">
        <q-select
          v-model="fwModel"
          :options="fwOptions"
          label="Choose firmware"
          :suffix="fwOptions.find(({label}) => label === fwModel.label) ? fwOptions.find(({label}) => label === fwModel.label).version : ''"
          id="fw-select"
          style="width: 300px;"
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
        <q-btn v-if="fwModel" @click="fetchFirmwareFile(fwModel.value)" color="positive" class="q-ml-lg" padding="12px 30px">Flash</q-btn>
      </div>

      <div v-if="firmwareFileName.length && !crc32Check" class="alert">
        <span><q-icon :name="evaAlertCircleOutline"></q-icon> Crc32 check has failed for <b>{{ firmwareFileName }}</b>!</span>
      </div>

      <div v-if="firmwareFileName.length && !firmwareTargetCheck" class="alert">
        <p>
            <q-icon :name="evaAlertCircleOutline"></q-icon> Looks like <b> {{ firmwareFileName }}</b>  is incompatible with your Flipper&nbsp;Zero hardware revision.
        </p>
        This firmware might break your device!
      </div>

      <div v-if="status !== 'Writing firmware' && status !== 'Serial connection lost'" class="flex flex-center q-mt-md">
        <p v-if="!firmwareFileName.length" class="q-mt-xl">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu" class="q-ml-sm"/>
        </p>
        <q-btn
          v-if="firmwareFileName.length && crc32Check && firmwareTargetCheck"
          @click="gotoDFU"
          color="positive"
          padding="12px 30px"
        >Flash {{ firmwareFileName }}</q-btn>
        <q-btn
          v-if="firmwareFileName.length"
          @click="cancelUpload"
          :flat="firmwareTargetCheck"
          :color="firmwareTargetCheck ? '' : 'positive'"
          :class="crc32Check ? 'q-ml-lg' : ''"
          padding="12px 30px"
        >Cancel</q-btn>
        <q-btn
          v-if="!firmwareTargetCheck"
          flat
          color="grey-8"
          @click="gotoDFU"
          padding="12px 30px"
          class="q-ml-lg"
        >Flash anyway</q-btn>
      </div>

      <div v-if="status === 'Serial connection lost'" class="alert">
        <span>Information is valid on {{ disconnectTime }}</span>
      </div>
      <div v-if="status === 'DFU connection lost'" class="alert">
        <span>Information is valid on {{ disconnectTime }}</span>
      </div>

      <div v-show="status === 'Writing firmware'">
        <div class="alert">
          <h5>Flashing firmware</h5>
          <ul>
            <li>Don't disconnect your Flipper</li>
            <li>Don't leave this tab until the process is over</li>
          </ul>
        </div>
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

    <div v-show="showRecoveryMenu && mode === 'dfu' && !error.isError && !loadingSerial" class="connected q-mt-sm">
      <q-card flat>
        <q-card-section :horizontal="!$q.screen.xs" class="text-left">
          <div class="flex flex-center" :class="!$q.screen.xs ? 'col-5' : 'fit'">
            <img src="../assets/flipper-dfu-overlay.png" class="absolute"/>
            <img v-if="flipper.bodyColor === 'white' || flipper.bodyColor === 'undefined'" src="../assets/flipper-white.png" />
            <img v-if="flipper.bodyColor === 'black'" src="../assets/flipper-black.png" />
          </div>
          <div :class="!$q.screen.xs ? 'col-7 q-ml-xl' : 'fit text-center'" :style="!$q.screen.xs ? 'white-space: nowrap;' : ''">
            <h5>
              <b>{{ flipper.name }}&nbsp;</b>
              <span v-if="status !== 'DFU connection lost'">connected <br v-if="$q.screen.xs"/>in recovery mode!</span>
              <span v-else class="text-accent">disconnected!</span>
            </h5>
            <p>
              <b>Hardware revision:</b> {{ flipper.hardwareVer }}
            </p>
            <p>
              <b>Firmware target:</b> {{ flipper.target }}
            </p>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="!sha256Check" class="alert">
        <p><q-icon :name="evaAlertCircleOutline"></q-icon> sha256 check has failed for <b>{{ fwModel.value }}</b>!</p>
        Please contact us ASAP!
      </div>

      <div v-if="!firmwareFileName.length && fwModel.value === 'custom' && status !== 'DFU connection lost' && status !== 'Writing firmware'" class="alert">
        <p class="ellipsis">
          <q-icon :name="evaAlertCircleOutline"></q-icon> You are installing <b>unofficial</b> firmware from<br/>{{ this['custom'].url }}!
        </p>
        This firmware might be <b>malicious</b> and might <b>break your device</b>!
      </div>

      <div v-if="!firmwareFileName.length && sha256Check && status !== 'Writing firmware' && status !== 'DFU connection lost'" class="flex flex-center">
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
          v-if="fwModel"
          @click="fetchFirmwareFile(fwModel.value)"
          color="positive"
          class="q-ml-lg"
          :class="!$q.screen.xs ? '' : 'q-mt-sm'"
          padding="12px 30px"
        >Flash</q-btn>
      </div>

      <div v-if="firmwareFileName.length && !crc32Check" class="alert">
        <span><q-icon :name="evaAlertCircleOutline"></q-icon> Crc32 check has failed for <b>{{ firmwareFileName }}</b></span>
      </div>
      <div v-if="firmwareFileName.length && !firmwareTargetCheck" class="alert">
        <p>
            <q-icon :name="evaAlertCircleOutline"></q-icon> Looks like <b> {{ firmwareFileName }}</b>  is incompatible with your Flipper&nbsp;Zero hardware revision.
        </p>
        This firmware might break your device!
      </div>
      <div v-if="status !== 'Writing firmware' && status !== 'DFU connection lost'" class="flex flex-center q-mt-md">
        <p v-if="!firmwareFileName.length" class="q-mt-xl">
          Flash alternative firmware from local file <input type="file" @change="loadFirmwareFile" accept=".dfu" class="q-ml-sm"/>
        </p>
        <q-btn
          v-if="firmwareFileName.length && crc32Check && firmwareTargetCheck"
          @click="writeFirmware"
          color="positive"
          padding="12px 30px"
        >Flash {{ firmwareFileName }}</q-btn>
        <q-btn
          v-if="firmwareFileName.length"
          @click="cancelUpload"
          :flat="firmwareTargetCheck"
          :color="firmwareTargetCheck ? '' : 'positive'"
          :class="crc32Check ? 'q-ml-lg' : ''"
          padding="12px 30px"
        >Cancel</q-btn>
        <q-btn
          v-if="!firmwareTargetCheck"
          flat
          color="grey-8"
          @click="writeFirmware"
          padding="12px 30px"
          class="q-ml-lg"
        >Flash anyway</q-btn>
      </div>

      <div v-if="status === 'DFU connection lost'" class="alert">
        <span>Information is valid on {{ disconnectTime }}</span>
      </div>

      <div v-show="status === 'Writing firmware'">
        <div class="alert">
          <h5>Flashing firmware</h5>
          <ul>
            <li>Don't disconnect your Flipper</li>
            <li>Don't leave this tab until the process is over</li>
          </ul>
        </div>
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

    <h4 v-if="status === 'OK'" id="ok">Firmware successfully updated</h4>

    <div v-show="status === 'Serial connection lost' || status === 'OK'" id="reconnect">
      <q-btn @click="userAgent.serial ? reconnect('serial') : reconnect('dfu')" :icon="evaRefreshOutline" flat>
        Reconnect
      </q-btn>
    </div>
    <div v-show="status === 'DFU connection lost' && status !== 'OK' && !error.isError" id="reconnect">
      <q-btn @click="connectRecovery" :icon="evaRefreshOutline" flat>
        Reconnect
      </q-btn>
    </div>

    <q-btn
      v-if="mode !== 'dfu' && userAgent.serial"
      :disabled="status === 'Writing firmware'"
      flat
      color="grey-8"
      size="13px"
      class="absolute-bottom-right q-ma-sm"
      @click="mode = 'dfu'; gotoDFU()"
    >Recovery mode</q-btn>
    <q-btn
      v-if="mode === 'dfu' && userAgent.serial"
      :disabled="status === 'Writing firmware'"
      flat
      color="grey-8"
      size="13px"
      class="absolute-bottom-right q-ma-sm"
      @click="mode = 'serial'; connectSerial()"
    >Normal mode</q-btn>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { WebDFU } from 'dfu'
import * as semver from 'semver'
import * as crc32 from 'crc-32'
import * as shajs from 'sha.js'
import { mdiChevronDown } from '@quasar/extras/mdi-v5'
import { evaArrowBackOutline, evaArrowUpwardOutline, evaAlertCircleOutline, evaRefreshOutline, evaCloseOutline } from '@quasar/extras/eva-icons'

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
    release: Object,
    rc: Object,
    dev: Object,
    custom: Object,
    modeProp: String,
    qFlipperInstaller: String
  },
  setup () {
    return {
      error: ref({
        isError: false,
        msg: '',
        button: ''
      }),
      mode: 'serial',
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
      firmwareFileCropped: undefined,
      firmwareFileName: ref(''),
      crc32Check: ref('true'),
      sha256Check: ref('true'),
      firmwareTargetCheck: ref('true'),
      showArrows: ref(false),
      showOverlay: ref(false),
      loadingSerial: ref(false),
      showSerialMenu: ref(false),
      showRecoveryMenu: ref(false),
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
        radioFusFirmware: {
          major: '',
          minor: '',
          sub: ''
        },
        radioFirmware: {
          major: '',
          minor: '',
          sub: ''
        },
        btMac: 'undefined'
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
      isOutdated: ref(false),
      newerThanLTS: ref(false),
      disconnectTime: ref(''),
      arrowText: ref('Find your Flipper in dropdown menu')
    }
  },
  methods: {
    async connectSerial () {
      this.mode = 'serial'
      this.firmwareFile = undefined
      this.firmwareFileName = ''
      this.progress = {
        current: 0,
        max: 0,
        stage: 0
      }
      for (const p in this.flipper) {
        if (p === 'radioFusFirmware' || p === 'radioFirmware') {
          this.flipper[p] = {
            major: '',
            minor: '',
            sub: ''
          }
        } else {
          this.flipper[p] = 'undefined'
        }
      }
      this.newerThanLTS = false
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.showArrows = true
      this.showOverlay = true
      this.arrowText = 'Find your Flipper in serial mode (Flipper <name>)'
      this.adjustArrows()
      try {
        const filters = [
          { usbVendorId: 0x0483, usbProductId: 0x5740 }
        ]
        this.port = await navigator.serial.requestPort({ filters })
        await this.port.open({
          baudRate: 1
        })

        this.showArrows = false
        this.showOverlay = false
        this.status = 'Connected to Flipper in serial mode'

        this.getData()
      } catch (error) {
        if (error.message && error.message.includes('No port selected by the user.')) {
          this.error.msg = 'No device selected.'
        } else if (!error.message && error.message.includes('Failed to open serial port.')) {
          console.log(error.message)
          this.error.msg = error.message
        } else {
          this.error.msg = 'Can\'t connect to Flipper. It may be used by another tab or process.'
        }
        this.error.isError = true
        this.error.button = 'connectSerial'
        this.status = 'No device selected'
        this.showArrows = false
      }
    },
    async getData () {
      this.loadingSerial = true
      const connectionStartTime = Date.now()
      await new Promise((resolve, reject) => {
        const readInterval = setInterval(() => {
          if (this.flipper.firmwareVer !== 'undefined') {
            resolve()
            clearInterval(readInterval)
          }
          this.write(this.commands)
          this.read()
          if (Date.now() - connectionStartTime > 5000) {
            reject()
            clearInterval(readInterval)
          }
        }, 500)
      }).catch(() => {
        this.error.isError = true
        this.error.msg = 'Connection timeout. Are you connecting to a Flipper?'
        this.error.button = 'connectSerial'
        this.status = 'Connection timeout'
      })
      this.compareVersions()
      this.loadingSerial = false
      this.showSerialMenu = true
    },
    async read () {
      try {
        while (this.port && this.port.readable && !this.port.readable.locked) {
          // eslint-disable-next-line no-undef
          const textDecoder = new TextDecoderStream()
          this.port.readable.pipeTo(textDecoder.writable).catch(error => {
            if (error.message && error.message.includes('The device has been lost.')) {
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
        if (error.message && error.message.includes('The device has been lost.')) {
          const d = new Date(Date.now())
          this.disconnectTime = d.toTimeString().slice(0, 5) + ' ' + d.toLocaleDateString('en-US')
          this.status = 'Serial connection lost'
          document.querySelector('#battery').style.color = '#c6c6c6'
          if (this.port) {
            this.port.close().catch(error => {
              if (!error.message && error.message.includes('The port is already closed') && !error.message && error.message.includes('The device has been lost.')) {
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
      if (this.port && !this.port.writable.locked) {
        // eslint-disable-next-line no-undef
        const textEncoder = new TextEncoderStream()
        textEncoder.readable.pipeTo(this.port.writable)
        const writer = textEncoder.writable.getWriter()
        lines.forEach(line => {
          writer.write(line + '\r\n')
        })
        writer.close()
      }
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
      if (value.includes('radio_fus_major')) {
        this.flipper.radioFusFirmware.major = value.replace(/radio_fus_major\s*:\s/g, '').trim()
      }
      if (value.includes('radio_fus_minor')) {
        this.flipper.radioFusFirmware.minor = value.replace(/radio_fus_minor\s*:\s/g, '').trim()
      }
      if (value.includes('radio_fus_sub')) {
        this.flipper.radioFusFirmware.sub = value.replace(/radio_fus_sub\s*:\s/g, '').trim()
      }
      if (value.includes('radio_stack_major')) {
        this.flipper.radioFirmware.major = value.replace(/radio_stack_major\s*:\s/g, '').trim()
      }
      if (value.includes('radio_stack_minor')) {
        this.flipper.radioFirmware.minor = value.replace(/radio_stack_minor\s*:\s/g, '').trim()
      }
      if (value.includes('radio_stack_sub')) {
        this.flipper.radioFirmware.sub = value.replace(/radio_stack_sub\s*:\s/g, '').trim()
      }
      if (value.includes('radio_ble_mac')) {
        this.flipper.btMac = value.replace(/radio_ble_mac\s*:\s/g, '').trim()
      }
    },
    async compareVersions () {
      if (this.flipper.firmwareVer.includes('fw-')) {
        this.flipper.firmwareVer = this.flipper.firmwareVer.replace('fw-', '')
      }
      if (semver.eq((this.flipper.firmwareVer === 'undefined' ? '0.0.0' : this.flipper.firmwareVer), this.release.version)) {
        this.isOutdated = false
      } else if (semver.gt((this.flipper.firmwareVer === 'undefined' ? '0.0.0' : this.flipper.firmwareVer), this.release.version)) {
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
    async fetchFirmwareFile (type) {
      try {
        const file = this[type.toLowerCase()].files.find((e) => {
          if (e.type === 'full_dfu' && (e.target === 'f' + this.flipper.target || !e.target)) return e
          else return undefined
        })
        let url = file.url
        if (type === 'dev') {
          url = 'https://update.flipperzero.one/firmware/development/f6/full_dfu'
        }
        const buffer = await fetch(url)
          .then(response => {
            return response.arrayBuffer()
          })
        this.firmwareFile = new Uint8Array(buffer)
        const calculatedSha256 = await shajs('sha256').update(this.firmwareFile).digest('hex')
        if (!file.sha256 || file.sha256 === calculatedSha256) {
          this.sha256Check = true
          this.cropDFUFile()
          if (this.mode === 'serial') {
            this.gotoDFU()
          } else if (this.mode === 'dfu') {
            this.writeFirmware()
          }
        } else {
          this.sha256Check = false
        }
      } catch (error) {
        this.error.isError = true
        if (isNaN(Number(this.flipper.target))) {
          this.error.msg = 'Unknown firmware target. Try repairing your Flipper via desktop app'
          this.error.button = ''
        } else if (Number(this.flipper.target) < '6') {
          this.error.msg = 'Unsupported firmware target'
          this.error.button = ''
        } else {
          console.error(error)
          this.error.msg = 'Failed to fetch latest firmware. Try again later or flash firmware from file.'
          this.error.button = 'connectSerial'
        }
      }
    },
    cropDFUFile () {
      function toHex (f, s, e) {
        return Array.from(f.slice(s, e), (byte) => {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2)
        }).join(' ')
      }

      const parsedTarget = new TextDecoder().decode(this.firmwareFile.slice(22, 37))
      if (parsedTarget.startsWith('Flipper Zero F')) {
        if (parsedTarget.endsWith(this.flipper.target)) {
          this.firmwareTargetCheck = true
        } else {
          this.firmwareTargetCheck = false
        }
      } else {
        this.firmwareTargetCheck = undefined
      }

      this.startAddress = toHex(this.firmwareFile, 285, 289).split(' ').reverse().join('')
      const size = parseInt(toHex(this.firmwareFile, 289, 293).split(' ').reverse().join(''), 16)
      const binary = this.firmwareFile.slice(293, size + 293)

      const parsedCrc32 = new Int32Array(this.firmwareFile.slice(this.firmwareFile.length - 4, this.firmwareFile.length).buffer)[0]
      const calculatedCrc32 = crc32.buf(this.firmwareFile.slice(0, this.firmwareFile.length - 4))
      if ((-parsedCrc32 - 1) !== calculatedCrc32) {
        this.crc32Check = false
      } else {
        this.crc32Check = true
        this.firmwareFileCropped = binary
      }
    },
    async gotoDFU () {
      this.write(['dfu'])
      this.status = 'Waiting for DFU connection'
      this.mode === 'serial' ? this.connectDFU() : this.connectRecovery()
    },
    async connectDFU () {
      this.disconnectSerial()
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.showArrows = true
      this.showOverlay = true
      this.arrowText = 'Find your Flipper in recovery mode (DFU in FS Mode)'
      try {
        const filters = [
          { vendorId: 0x0483, productId: 0xdf11 }
        ]
        const selectedDevice = await navigator.usb.requestDevice({ filters })
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
          this.showArrows = false
          this.showOverlay = false
        }

        await this.webdfu.connect(0)
        this.status = 'Connected to Flipper in DFU mode'
        this.error.isError = false
        this.error.msg = ''
        this.error.button = ''
        this.showArrows = false
        this.showOverlay = false

        this.writeFirmware()
      } catch (error) {
        this.error.isError = true
        this.error.button = 'connectDFU'
        if (error.message && error.message.includes('No device selected')) {
          this.error.msg = 'No device selected'
          this.status = 'No device selected'
        } else if (error.message && error.message.includes('Access denied')) {
          this.error.msg = 'Chrome can\'t access Flipper in DFU mode. This may be caused by using '
          this.status = 'The device was disconnected'
        } else {
          console.log(error.message)
          this.error.msg = 'The device was disconnected'
          this.status = 'The device was disconnected'
          this.error.button = 'connectSerial'
        }
        this.showArrows = false
      }
    },
    async connectRecovery () {
      this.mode = 'dfu'
      this.firmwareFile = undefined
      this.firmwareFileName = ''
      this.progress = {
        current: 0,
        max: 0,
        stage: 0
      }
      this.error.isError = false
      this.error.msg = ''
      this.error.button = ''
      this.showArrows = true
      this.showOverlay = true
      this.arrowText = 'Find your Flipper in recovery mode (DFU in FS Mode)'
      this.status = 'Waiting for DFU connection'
      try {
        const filters = [
          { vendorId: 0x0483, productId: 0xdf11 }
        ]
        const selectedDevice = await navigator.usb.requestDevice({ filters })
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
          this.showArrows = false
        }

        await this.webdfu.connect(2)
        this.status = 'Connected to Flipper in DFU mode'
        this.error.isError = false
        this.error.msg = ''
        this.error.button = ''
        this.showArrows = false
        this.showOverlay = false

        const otp = await this.webdfu.read(1024, 32)
          .then(blob => {
            this.progress.max = 0
            this.progress.current = 0
            this.progress.stage = 0
            return blob.arrayBuffer()
          })
          .then(buffer => {
            return new Uint8Array(buffer)
          })

        this.flipper.name = 'undefined'
        this.flipper.hardwareVer = 'undefined'
        this.flipper.target = 'undefined'
        this.flipper.bodyColor = 'undefined'

        if (otp[0] === 190 && otp[1] === 186) {
          this.flipper.hardwareVer = otp[8]
          this.flipper.target = otp[9]
          this.flipper.bodyColor = otp[12] ? 'black' : 'white'
          this.flipper.name = new TextDecoder().decode(otp.slice(16, 24).filter(e => e > 0))
        } else {
          this.flipper.hardwareVer = otp[0]
          this.flipper.target = otp[1]
          this.flipper.name = new TextDecoder().decode(otp.slice(8, 16).filter(e => e > 0))
        }

        this.showRecoveryMenu = true
      } catch (error) {
        this.error.isError = true
        this.error.button = 'connectDFU'
        if (error.message && error.message && error.message.includes('No device selected')) {
          this.error.msg = 'No device selected'
          this.status = 'No device selected'
        } else if (error.message && error.message.includes('Access denied')) {
          this.error.msg = 'Chrome can\'t access Flipper in DFU mode. This may be caused by using '
          this.status = 'The device was disconnected'
        } else {
          console.log(error)
          this.error.msg = 'The device was disconnected'
          this.status = 'The device was disconnected'
          this.error.button = 'connectSerial'
        }
        this.showArrows = false
      }
    },
    async writeFirmware () {
      try {
        if (this.mode === 'dfu') {
          await this.webdfu.connect(0)
        }
        this.status = 'Writing firmware'
        function preventTabClose (event) {
          event.returnValue = ''
        }
        window.addEventListener('beforeunload', preventTabClose)
        this.webdfu.driver.startAddress = Number('0x' + this.startAddress)
        await this.webdfu.write(1024, this.firmwareFileCropped)
        this.webdfu.close().catch(error => {
          if (error.message && !error.message.includes('disconnected')) {
            console.log(error)
          }
        })
        this.status = 'OK'
        this.mode = 'serial'
        window.removeEventListener('beforeunload', preventTabClose)
        this.showSerialMenu = false
        this.showRecoveryMenu = false
      } catch (error) {
        this.error.isError = true
        console.log(error)
        if (error.includes && error.includes('Error: stall')) {
          this.error.msg = 'Can\'t connect to Flipper. It may be used by another tab or process. Close it and reload this page.'
        } else {
          this.error.msg = `Failed to write firmware (${error})`
          this.error.button = 'connectRecovery'
        }
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
      if (type === 'serial') {
        this.disconnectSerial()
        this.connectSerial()
      } else if (type === 'dfu') {
        if (this.mode === 'serial') {
          try {
            if (this.webdfu) this.webdfu.close()
          } catch (error) {
            console.log(error.message)
          }
          this.connectDFU()
        } else {
          this.connectRecovery()
        }
      }
    },
    async disconnectSerial () {
      if (this.port) {
        const localPort = this.port
        this.port = undefined
        await localPort.close().catch(error => {
          if (!error.message && error.message.includes('The port is already closed') &&
            !error.message && error.message.includes('The device has been lost.') &&
            !error.message && error.message.includes('locked stream')) {
            console.log(error.message)
          }
        })
      }
    },
    onDisconnectDfu () {
      this.webdfu = undefined
      this.firmwareFile = undefined
      this.firmwareFileName = ''
      this.progress = {
        current: 0,
        max: 0,
        stage: 0
      }
      if (this.status !== 'OK') {
        this.status = 'DFU connection lost'
        const d = new Date(Date.now())
        this.disconnectTime = d.toTimeString().slice(0, 5) + ' ' + d.toLocaleDateString('en-US')
      }
    },
    cancelUpload () {
      this.firmwareFile = undefined
      this.firmwareFileName = ''
      this.crc32Check = true
      this.firmwareTargetCheck = true
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
    if (this.modeProp === 'serial') {
      this.connectSerial()
    } else if (this.modeProp === 'dfu') {
      this.connectRecovery()
    }
    navigator.usb.addEventListener('disconnect', this.onDisconnectDfu)
  }
})
</script>

<style lang="scss" src="../css/updater.scss"></style>
