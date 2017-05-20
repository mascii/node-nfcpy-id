import os, sys, json, re, binascii
import nfc

def stdoutJSON(data):
    sys.stdout.write(json.dumps(data))
    sys.stdout.write('\n')
    sys.stdout.flush()

class CardReader():
    def on_connect(self, tag):
        identifier = binascii.hexlify(tag.identifier)
        match = re.findall(r'[0-9]', tag.type)
        type = int(match[0] if match else 0)
        stdoutJSON({'event':'touchstart', 'id':identifier, 'type':type})
        return True

    def read_id(self):
        clf = nfc.ContactlessFrontend('usb')
        try:
            clf.connect(rdwr={'on-connect':self.on_connect})
        finally:
            stdoutJSON({'event':'touchend'})
            clf.close()

if __name__ == '__main__':
    cr = CardReader()
    while True:
        try:
            cr.read_id()
        except:
            sys.stderr.write(str(sys.exc_info()[0]))
            sys.stderr.flush()
            os._exit(0)
