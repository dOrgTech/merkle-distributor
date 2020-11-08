# Forked from [@uniswap/merkle-distributor](https://github.com/Uniswap/merkle-distributor)

## Set node version
`nvm use`

## Install Dependencies
`yarn`

## Compile Contracts / Run Tests
`yarn compile && yarn test`

## Airdrop (ROBO)
Assuming we have a snapshot of `RoboToken` holders at `scripts/ray-dao/snapshot.json` (numbers in ether):
```json
{
  "block": 11214023, // optional
  "assets": [
    {
      "address": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      "symbol": "BUSD",
      "totalSupply": "10",
      "balances": {
        "0x28ff8e457feF9870B9d1529FE68Fbb95C3181f64": "1"
      }
    }
  ]
}
```

Generate a mapping of claimable `ROBO` and the associated Merkle root:
```
yarn ray:airdrop
> ...
> merkleRoot: 0x....
```

Take the resulting `merkleRoot` from the output and include in constructor params for `MerkleDistributor.sol`

To create the proof for a given account and call `MerkleDistributor.claim()`:

```javascript
import BalanceTree from 'src/balance-tree'
import airdrop from 'scripts/ray-dao/airdrop.json'

const accounts = Object.keys(airdrop);
const tree = new BalanceTree(accounts.map((account, ix) => ({
  account,
  amount: BigNumber.from(airdrop[account])
})))

const myAccount = '0x....'
const myIdx = accounts.indexOf(myAccount)

const proof = tree.getProof(myIdx, myAccount, BigNumber.from(airdrop[myAccount]))
await distributorContract.claim(myIDx, myAccount, airdrop[myAccount], proof, { from: myAccount })
```
