# node-nfcpy-id

Read the card ID (Mifare: UID, FeliCa: IDm) with [nfcpy](https://github.com/nfcpy/nfcpy/) (a Python module).

## Requirement
### Node version
  - v6.10.2 or later

### Python version
  - v2.7.x

### Operation System
  - Raspbian
  - macOS

## Install
```
npm install node-nfcpy-id
```

## Settings for Raspbian with SONY Pasori RC-S380
```
sudo apt-get install python-usb python-pip -y
sudo pip install -U nfcpy
cat << EOF | sudo tee /etc/udev/rules.d/nfcdev.rules
SUBSYSTEM=="usb", ACTION=="add", ATTRS{idVendor}=="054c", ATTRS{idProduct}=="06c3", GROUP="plugdev"
EOF
```

Please restart once.
```
sudo reboot
```

## Examples

```js
'use strict';

const NfcpyId = require('node-nfcpy-id');
const nfc = new NfcpyId().start();

nfc.on('touchstart', (card) => {
  console.log('Card ID: ' + card.id);

  // card.type is the same value as that of nfcpy.
  // 2: Mifare
  // 3: FeliCa
  // 4: Mifare (DESFire)
  console.log('Card Type: ' + card.type);
});

nfc.on('touchend', () => {
  console.log('Card was away.');

  // Python process will be killed.
  // nfc.stop();

  // Python process will be killed at the same time.
  // process.exit();
});

nfc.on('error', (err) => {
  console.error('\u001b[31m'); // RED
  console.error(err);
  console.error('\u001b[0m');
});

```

To stop this script, press Ctrl+C. By this, Python process will be killed at the same time.

To use this script with other than SONY Pasori RC-S380, it may be necessary to modify `reader.py` and add options to the parameter of constructor.

```js
const NfcpyId = require('node-nfcpy-id');

// Put the modified Python script in the same directory.
const nfc = new NfcpyId({scriptPath: __dirname, scriptFile: 'new-reader.py'}).start();

// If the file name of the modified Python script is `reader.py`, `scriptFile` can be omitted.
// const nfc = new NfcpyId({scriptPath: __dirname}).start();
```
