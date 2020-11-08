import fs from 'fs';
import { BigNumber } from 'ethers'
import snapshot from './snapshot.json';

// for each asset in snaphot.assets:
// - for each account balance
//   - calculate ROBO airdrop as function of (account.balance / asset.totalSupply) * ROBO_REWARD_POOL_PER_ASSET?

const ROBO_REWARD_POOL_PER_ASSET = "100";

const toWei = (n: BigNumber): BigNumber => n.mul(BigNumber.from('10').pow(BigNumber.from('18')));
const fromWei = (n: BigNumber): BigNumber => n.div(BigNumber.from('10').pow(BigNumber.from('18')));

const calculateROBO = (balance: String, totalSupply: String): BigNumber => (
  fromWei((toWei(BigNumber.from(balance)).div(BigNumber.from(totalSupply))).mul(ROBO_REWARD_POOL_PER_ASSET))
);

const createAirdop = () => {
  const airdrop = snapshot.assets.reduce((memo: any, asset: any): any => {
    const _airdrop = {} as any;
    for (let account of Object.keys(asset.balances)) {
      _airdrop[account] = calculateROBO(asset.balances[account], asset.totalSupply).toString();
    }

    for (let account of Object.keys(_airdrop)) {
      memo[account] = memo[account] === undefined
        ? _airdrop[account]
        : (BigNumber.from(memo[account]).add(BigNumber.from(_airdrop[account]))).toString();
    }

    return memo;
  }, {});

  fs.writeFileSync('./scripts/ray-dao/airdrop.json', JSON.stringify(airdrop), 'utf8');
};

console.log('airdrop: reading snapshot RoboToken balances from scripts/ray-dao/snapshot.json');
createAirdop();
console.log('airdrop: set claimable ROBO balances in scripts/ray-dao/airdrop.json');
