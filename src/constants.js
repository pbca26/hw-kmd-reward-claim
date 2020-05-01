export const TX_FEE = 20000;
export const INSIGHT_API_URL = {
  default: 'https://kmd.explorer.dexstats.info/insight-api-komodo/',
  komodoplatform: 'https://explorer.komodoplatform.com:10000/kmd/api/',
};
export const INSIGHT_EXPLORER_URL = 'https://kmdexplorer.io/';
export const KOMODO = {
  messagePrefix: '\x18Komodo Signed Message:\n',
  bip32: {
    public: 0x0488B21E,
    private: 0x0488ADE4
  },
  pubKeyHash: 0x3C,
  scriptHash: 0x55,
  wif: 0xBC
};
export const LEDGER_FW_VERSIONS = {
  default: 'Nano S firmware v1.5',
  webusb: 'Nano S firmware v1.6', // nano s fw > 1.6 
};