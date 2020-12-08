# Forked from [@uniswap/merkle-distributor](https://github.com/Uniswap/merkle-distributor)

## Set node version
`nvm use`

## Install Dependencies
`yarn`

## Compile Contracts / Run Tests
`yarn compile && yarn test`

## Airdrop (ROBO)
Assuming we have a snapshot of `RoboToken` holders at `scripts/ray-dao/snapshot.json` (numbers in ether)

For each asset (`RoboToken`) that RAY supports, we need a snapshot of:
- how many tokens each account has (`balances`)
- we need the `address` of the contract
- `symbol`
- the total supply of the token at the time of the snapshot

The `block` property is just for reference of the snapshot. 
```json
{
  "block": 11214023,
  "assets": [
    {
      "address": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      "symbol": "BUSD",
      "totalSupply": "10",
      "balances": {
        "0x28ff8e457feF9870B9d1529FE68Fbb95C3181f64": "1",
        "0x91c503590B500F9EC4b4389B106f916558AfF83c": "1"
      }
    }
  ]
}
```

We need to set `ROBO_REWARD_POOL_PER_ASSET` constant in the script `scripts/airdrop.ts` that specifies how much ROBO should be allocated for each asset.


For each object in `assets`, and for each account in `balances`, we calculate the % of tokens of the `totalSupply` the account has in order to calculate their rewards owed (in ROBO).

Generate a mapping of claimable `ROBO` and the associated Merkle root:
```
yarn ray:airdrop
> ...
> merkleRoot: 0x....
```

Take the resulting `merkleRoot` from the output and include in constructor params for `MerkleDistributor.sol`

Now, each account has to generate their merkle proof and submit to the contract's function `claim()` in order for their ROBO tokens to be transferred to their account (only once). This is assuming that during the deploy process, we minted enough ROBO to the `MerkleDistributor` contract to distribute

To create the proof for a given account and call `MerkleDistributor.claim()`:

```javascript
import { BigNumber } from 'ethers'
import { parseBalanceMap } from 'src/parse-balance-map'
import airdrop from 'scripts/ray-dao/airdrop.json' // this can be uploaded to cloudflare / ipfs

const myAccount = '0x....'
const data = parseBalanceMap(airdrop)
const { index, proof, amount } = data.claims[myAccount];

await airdropContract.claim(index, myAccount, BigNumber.from(amount), proof, { from: myAccount })
```
