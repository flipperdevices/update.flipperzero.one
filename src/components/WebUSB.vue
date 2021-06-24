<template>
  <div>{{status}}
    <button id="back" @click="$emit('clickHome')">Back</button>
    <div v-show="displayArrows" class="arrows">
      <div id="arrow-1">
        <div class="svg-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="arrow-circle-left"><rect width="24" height="24" opacity="0"/><path d="M16 11h-5.66l1.25-1.31a1 1 0 0 0-1.45-1.38l-2.86 3a1 1 0 0 0-.09.13.72.72 0 0 0-.11.19.88.88 0 0 0-.06.28L7 12a1 1 0 0 0 .08.38 1 1 0 0 0 .21.32l3 3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42L10.41 13H16a1 1 0 0 0 0-2z"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></g></g></svg>
        </div>
        <span>1. Find your Flipper in dropdown menu</span>
      </div>
      <div id="arrow-2">
        <div class="svg-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="arrow-circle-up"><rect width="24" height="24" opacity="0"/><path d="M12.71 7.29a1 1 0 0 0-.32-.21A1 1 0 0 0 12 7h-.1a.82.82 0 0 0-.27.06.72.72 0 0 0-.19.11 1 1 0 0 0-.13.09l-3 2.86a1 1 0 0 0 1.38 1.45L11 10.34V16a1 1 0 0 0 2 0v-5.59l1.29 1.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></g></g></svg>
        </div>
        <span>2. Press "Connect"</span>
      </div>
    </div>
  </div>
</template>

<script>
import { WebDFU } from "dfu"

export default {
  name: 'WebUSB',
  props: {
    userAgent: Object
  },
  data() {
    return {
      status: 'Connect Flipper',
      port: undefined,
      webdfu: undefined,
      firmwareFile: undefined,
      displayArrows: false
    }
  },
  methods: {
    async connectSerial() {
      this.displayArrows = true
      this.adjustArrows()
      try {
        this.port = await navigator.serial.requestPort();
        await this.port.open({
          baudRate: 9600
        });
        this.status = 'Connected to Flipper in serial mode'
      } catch {
        this.status = 'No device selected'
      }
    },
    adjustArrows() {
      if (this.userAgent.os !== 'Windows') {
        document.getElementById('arrow-2').style.left = '470px'
      }
      if (this.userAgent.browser === 'Edge') {
        document.getElementById('arrow-1').style.top = '50px'
        document.getElementById('arrow-1').style.left = '593px'
        document.getElementById('arrow-2').style.top = '222px'
        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '435px'
        } else {
          document.getElementById('arrow-2').style.left = '519px'
        }
      }
      if (this.userAgent.browser === 'Opera') {
        document.getElementById('arrow-1').style.left = '541px'
        document.getElementById('arrow-2').style.top = '389px'
        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '395px'
        } else {
          document.getElementById('arrow-2').style.left = '470px'
        }
      }
      if (this.userAgent.browser === 'Yandex') {
        document.getElementById('arrow-1').style.left = '651px'
        document.getElementById('arrow-2').style.top = '427px'
        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '454px'
        } else {
          document.getElementById('arrow-2').style.left = '568px'
        }
      }
    },
    async gotoDFU() {
      // eslint-disable-next-line no-undef
      const textEncoder = new TextEncoderStream();
      // eslint-disable-next-line no-unused-vars
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      const writer = textEncoder.writable.getWriter();
      writer.write('dfu\r');
      writer.close();
      this.status = 'Rebooted into DFU'

      this.connectDFU()
    },
    async connectDFU() {
      // Load the device by WebUSB
      const selectedDevice = await navigator.usb.requestDevice({ filters: [] });
      // Create and init the WebDFU instance
      this.webdfu = new WebDFU(selectedDevice, { forceInterfacesName: true });
      await this.webdfu.init();
      if (this.webdfu.interfaces.length == 0) {
        throw new Error("The selected device does not have any USB DFU interfaces.");
      }
      // Connect to first device interface
      await this.webdfu.connect(0);
      this.status = 'Connected to Flipper in DFU mode'

      this.getFirmware()
    },
    async getFirmware() {
      try {
        const buffer = await fetch('https://update.flipperzero.one/fw-0.17.0/f5_full.bin')
          .then(response => {
            return response.arrayBuffer()
          })
        this.firmwareFile = new Uint8Array(buffer)
      } catch (error) {
        console.log(error)
      }
    },
    async writeFirmware() {
      try {
        this.status = 'Writing firmware'
        await this.webdfu.write(1024, this.firmwareFile);
        this.webdfu.close()
        this.status = 'OK, reboot Flipper'
      } catch (error) {
        console.error(error);
        this.status = 'Failed to write firmware'
      }
    }
  },
  mounted() {
    this.connectSerial()
  }
}
</script>

<style>
#back {
  position: absolute;
  top: 2rem;
  left: 2rem;
  padding: 0.5rem 1rem 0.5rem 2rem;
  font-size: 16px;
  color: #585858;
  background: url(/img/back.244182b8.svg) no-repeat center left;
  background-size: 1.5rem;
  border: 1px solid #585858;
  border-radius: 5px;
  cursor: pointer;
  transition-duration: 0.3s;
}

#back:hover {
  background-color: #f0f0f0;
  border-color: #6d6d6d;
}

/* Connecting section */

#connection-spinner {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: absolute;
  bottom: 3rem;
}

#arrow-1 {
  display: flex;
  align-items: center;
  position: absolute;
  top: 100px;
  left: 558px;
  height: 100px;
}

#arrow-2 {
  position: absolute;
  top: 427px;
  left: 400px;
  height: 100px;
}

.svg-container {
  width: 36px;
  margin-right: 0.4rem;
}
</style>
