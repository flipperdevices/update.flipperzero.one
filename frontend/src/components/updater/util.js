async function sleep (ms) {
  const sleepPromise = new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
  return await sleepPromise
}

async function waitForDevice (c) {
  const usbFilters = [{ vendorId: 0x0483, productId: 0x5740 }]
  const serialFilters = [{ usbVendorId: 0x0483, usbProductId: 0x5740 }]
  for (let i = 0; i < 10; i++) {
    let ports = []
    if (c === 'rebooted to serial') {
      ports = await navigator.serial.getPorts({ serialFilters })
    } else if (c === 'rebooted to usb') {
      ports = await navigator.usb.getDevices({ usbFilters })
    }
    if (ports.length) {
      await sleep(1800)
      return
    }
    await sleep(500)
  }
}

export {
  sleep,
  waitForDevice
}
