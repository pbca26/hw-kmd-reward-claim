import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import hw, {ledgerTransport} from './hw';

const RECHECK_TIMEOUT = 1000;

// ref: https://github.com/LedgerHQ/ledger-live-common/blob/master/src/hw/getVersion.js
const getLedgerDeviceInfo = async() => {
  return new Promise(async(resolve, reject) => {
    if (!ledgerTransport) {
      const transport = window.location.href.indexOf('ledger-webusb') > -1 ? await TransportWebUSB.create() : await TransportU2F.create();
      hw.setLedgerTransport(transport);
    }
    let mcuVersion, targetId, fwVersion;
    let checkPassed = false;

    const interval = setInterval(async() => {
      const transport = ledgerTransport;
      console.warn('transport', ledgerTransport);
      try {
        // only fresh fw versions are handled by this code
        // device info can only be obtained from dashboard
        transport.setScrambleKey('B0L0S');
        const res = await transport.send(0xe0, 0x01, 0x00, 0x00);
        const byteArray = [...res];
        const data = byteArray.slice(0, byteArray.length - 2);
        const targetIdStr = Buffer.from(data.slice(0, 4));
        const targetId = targetIdStr.readUIntBE(0, 4);
        const seVersionLength = data[4];
        const seVersion = Buffer.from(data.slice(5, 5 + seVersionLength)).toString();
        const flagsLength = data[5 + seVersionLength];
        const flags = Buffer.from(
          data.slice(5 + seVersionLength + 1, 5 + seVersionLength + 1 + flagsLength)
        );
        console.warn(data)

        const mcuVersionLength = data[5 + seVersionLength + 1 + flagsLength];
        mcuVersion = Buffer.from(
          data.slice(
            7 + seVersionLength + flagsLength,
            7 + seVersionLength + flagsLength + mcuVersionLength
          )
        );
        if (mcuVersion[mcuVersion.length - 1] === 0) {
          mcuVersion = mcuVersion.slice(0, mcuVersion.length - 1);
        }
        mcuVersion = mcuVersion.toString();

        clearInterval(interval);
        transport.close();
        resolve({
          mcuVersion,
          fwVersion: seVersion,
          targetId
        });
      } catch(e) {
        if (e.name === "DisconnectedDeviceDuringOperation") {
          ledgerTransport.close();
          const transport = window.location.href.indexOf('ledger-webusb') > -1 ? await TransportWebUSB.create() : await TransportU2F.create();
          hw.setLedgerTransport(transport);
        }
        console.warn(e);
      }
    }, RECHECK_TIMEOUT);
  });
};

const ledgerFw = {
  getLedgerAppInfo,
};

export default ledgerFw;