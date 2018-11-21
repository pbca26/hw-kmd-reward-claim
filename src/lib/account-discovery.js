import getLedger from './get-ledger';
import blockchain from './blockchain';

const walkDerivationPath = async ({account, isChange}) => {
  const addresses = [];
  const gapLimit = 20;
  let consecutiveUnusedAddresses = 0;
  let addressIndex = 0;

  const ledger = await getLedger();

  // TODO: Don't request all pubkeys from Ledger, request xpub and derive keys on host
  // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#serialization-format
  // https://github.com/LedgerHQ/ledgerjs/issues/114#issuecomment-372567048
  while (consecutiveUnusedAddresses < gapLimit) {
    const derivationPath = `44'/141'/${account}'/${isChange ? 1 : 0}/${addressIndex}`;
    const pubKey = await ledger.getWalletPublicKey(derivationPath);
    const address = await blockchain.getAddress(pubKey.bitcoinAddress);

    addresses.push({address: address.addrStr, account, isChange, addressIndex, derivationPath});

    if (address.totalReceived > 0 || address.unconfirmedBalance > 0) {
      consecutiveUnusedAddresses = 0;
    } else {
      consecutiveUnusedAddresses++;
    }

    addressIndex++;
  }

  await ledger.close();

  return addresses.slice(0, addresses.length - gapLimit);
};

const getAccountAddresses = async account => [
  ...await walkDerivationPath({account, isChange: false}),
  ...await walkDerivationPath({account, isChange: true})
];

const accountDiscovery = async () => {
  let utxos = [];
  let account = 0;

  while (true) {
    const accountAddresses = await getAccountAddresses(account);
    if (accountAddresses.length === 0) {
      break;
    }

    let accountUtxos = await blockchain.getUtxos(accountAddresses.map(a => a.address));
    accountUtxos = await Promise.all(accountUtxos.map(async utxo => {
      const addressInfo = accountAddresses.find(a => a.address === utxo.address);
      const tx = await blockchain.getTransaction(utxo.txid);
      return {
        ...addressInfo,
        ...utxo,
        tx
      };
    }));
    utxos = [...utxos, ...accountUtxos];

    account++;
  }

  return utxos;
};

export default accountDiscovery;