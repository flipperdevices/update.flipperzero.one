<template>
  <div class="card">
    <div class="card-banner">
      <img src="../assets/intro.png" />
    </div>
    <div class="card-desc">
      <h3>Flash the latest firmware right in your browser using WebUSB.</h3>
      <p>
        No drivers needed!
      </p>
      <p>
        Just connect your Flipper to the computer, press the button below and choose your device from dropping list.
        Don't forget to grant access to WebUSB in a pop-up.
      </p>
      <p>
        Currently supports only webkit-based browsers:
        Chrome based, Opera, Edge
      </p>
      <div class="buttons">
        <button class="primary" @click="connectSerial">Connect Flipper</button>
      </div>
    </div>
  </div>
</template>

<script>
import { WebDFU } from "dfu"

export default {
  name: 'WebUSB',
  data() {
    return {
      status: 'Connect Flipper',
      port: undefined,
      webdfu: undefined,
      firmwareFile: undefined
    }
  },
  methods : {
    async connectSerial() {
      if ('serial' in navigator) {
        try {
          this.port = await navigator.serial.requestPort();
          await this.port.open({
            baudRate: 9600
          });
          this.status = 'Connected to Flipper in serial mode'
        } catch {
          this.status = 'No device selected'
        }
      } else {
        this.status = 'WebSerial API is not supported in your browser'
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
  }
}
</script>
