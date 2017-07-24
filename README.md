# node-nfcpy-id

Read the card ID (Mifare: UID, FeliCa: IDm) with [nfcpy](https://github.com/nfcpy/nfcpy/) (a Python module).

[The details of this package (Japanese page)](http://qiita.com/mascii/items/ec79ad5a7026f771d181)

## Important notice

**The method of importing(`require`-ing) this package in CommonJS has changed from version 0.0.9**
```js
const NfcpyId = require('node-nfcpy-id').default;
```

**License changed from ISC to MIT**

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
sudo pip install -U nfcpy-id-reader
cat << EOF | sudo tee /etc/udev/rules.d/nfcdev.rules
SUBSYSTEM=="usb", ACTION=="add", ATTRS{idVendor}=="054c", ATTRS{idProduct}=="06c3", GROUP="plugdev"
EOF
```

Please restart once.
```
sudo reboot
```

## Examples

### loop mode
```js
const NfcpyId = require('node-nfcpy-id').default;
const nfc = new NfcpyId().start();

nfc.on('touchstart', (card) => {
  console.log('Card ID: ' + card.id);

  // card.type is the same value as that of nfcpy.
  // 2: Mifare
  // 3: FeliCa
  // 4: Mifare (DESFire)
  console.log('Card Type: ' + card.type);
});

// If the `mode` is `loop` or `non-loop`, event will occur when the card is removed
nfc.on('touchend', () => {
  console.log('Card was away.');
});

nfc.on('error', (err) => {
  // standard error output (color is red)
  console.error('\u001b[31m', err, '\u001b[0m');
});

```

### non-loop mode
```js
const NfcpyId = require('node-nfcpy-id').default;
const nfc = new NfcpyId({mode: 'non-loop'}).start();

nfc.on('touchstart', (card) => {
  console.log('Card ID: ' + card.id);
  console.log('Card Type: ' + card.type);
});

// If the `mode` is `loop` or `non-loop`, event will occur when the card is released
nfc.on('touchend', () => {
  console.log('Card was away.');

  // Card reading will start five seconds after the card is released
  setTimeout(() => {
    nfc.start();
  }, 5000);
});

nfc.on('error', (err) => {
  // standard error output (color is red)
  console.error('\u001b[31m', err, '\u001b[0m');
});

```

### non-touchend mode
```js
const NfcpyId = require('node-nfcpy-id').default;
const nfc = new NfcpyId({mode: 'non-touchend'}).start();

nfc.on('touchstart', (card) => {
  console.log('Card ID: ' + card.id);
  console.log('Card Type: ' + card.type);
});

nfc.on('error', (err) => {
  // standard error output (color is red)
  console.error('\u001b[31m', err, '\u001b[0m');
});

```

To start (restart) reading cards, use `nfc.start()`.

To pause reading cards, use `nfc.pause()`.

To stop this script, press control+C. By this, Python process will be killed at the same time.

To use this script with other than SONY Pasori RC-S380, it may be necessary to modify [`reader.py`](https://github.com/mascii/nfcpy_id_reader/blob/master/nfcpy_id_reader/__main__.py) and add options to the parameter of constructor.

```js
const NfcpyId = require('node-nfcpy-id').default;

// Put the modified Python script in the same directory.
const nfc = new NfcpyId({scriptPath: __dirname, scriptFile: 'new-reader.py'}).start();

// If the file name of the modified Python script is `reader.py`, `scriptFile` can be omitted.
// const nfc = new NfcpyId({scriptPath: __dirname}).start();
```

## License
MIT
