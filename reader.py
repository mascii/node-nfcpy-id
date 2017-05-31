import os, sys, signal, time, json, re, binascii
import nfc

non_touchend = ('non-touchend' in sys.argv)
non_loop = ('non-loop' in sys.argv) or non_touchend

running = True
exiting = False

def sig_hup_handler(signo, frame):
    global running
    global exiting
    if running:
        running = False
        os.kill(os.getpid(), signal.SIGINT)
    exiting = True

def sig_chld_handler(signo, frame):
    global running
    running ^= True
    if not(running):
        os.kill(os.getpid(), signal.SIGINT)

signal.signal(signal.SIGHUP, sig_hup_handler)
signal.signal(signal.SIGCHLD, sig_chld_handler)

def stdout_json(data):
    sys.stdout.write(json.dumps(data))
    sys.stdout.write('\n')
    sys.stdout.flush()

def on_connect(tag):
    identifier = binascii.hexlify(tag.identifier)
    match = re.findall(r'[0-9]', tag.type)
    type = int(match[0] if match else 0)
    stdout_json({'event':'touchstart', 'id':identifier, 'type':type})
    return not(non_touchend)

if __name__ == '__main__':
    while True:
        if running:
            with nfc.ContactlessFrontend('usb') as clf:
                while clf.connect(rdwr={'on-connect': on_connect}):
                    stdout_json({'event':'touchend'})
                    if non_loop:
                        running = False
                        break
        elif not(exiting):
            time.sleep(0.1)
        else:
            break
