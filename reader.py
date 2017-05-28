import os, sys, signal, time, json, re, binascii
import nfc

def sig_handler(signo, frame):
    sig_handler.running ^= True
    if not(sig_handler.running):
        os.kill(os.getpid(), signal.SIGINT)

sig_handler.running = True
signal.signal(signal.SIGCHLD, sig_handler)

def stdoutJSON(data):
    sys.stdout.write(json.dumps(data))
    sys.stdout.write('\n')
    sys.stdout.flush()

def on_connect(tag):
    identifier = binascii.hexlify(tag.identifier)
    match = re.findall(r'[0-9]', tag.type)
    type = int(match[0] if match else 0)
    stdoutJSON({'event':'touchstart', 'id':identifier, 'type':type})
    return True

def read_id():
    if sig_handler.running:
        clf = nfc.ContactlessFrontend('usb')
        try:
            clf.connect(rdwr={'on-connect':on_connect})
        finally:
            stdoutJSON({'event':'touchend'})
            clf.close()
    else:
        time.sleep(0.1)

if __name__ == '__main__':
    while True:
        read_id()
