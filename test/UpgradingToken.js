import assertRevert from './helpers/assertRevert'
import { advanceBlock } from './helpers/advanceToBlock'
import { duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const DemTokenV1 = artifacts.require('DemTokenV1')
const Proxy = artifacts.require('InitializedProxy')
const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.js')
const shouldBehaveLikeGeneric = require('./behaviors/GenericProposal.js')
const votingWindow = 4000
const supply = 100000000
const targets = [
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733d',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733e'
]
const details = [
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b37',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b38',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b39'
]
const payload = [
  [targets[0], details[0]],
  [targets[1], details[1]],
  [targets[2], details[2]]
]

contract('Democratic Upgradeablity', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.behavior = await DemTokenV1.new()
    this.proxy = await Proxy.new(this.behavior.address)
    this.token = DemTokenV1.at(this.proxy.address)
  })
  describe('Pre-Initialization', function () {
    it('does not have balance or window', async function () {
      const balanceValue = await this.token.balanceOf(accounts[0])
      const windowValue = await this.token.windowSize()
      assert.equal(balanceValue.toNumber(), 0)
      assert.equal(windowValue.toNumber(), 0)
    })
    it('proxy has correct implementation address', async function () {
      const implementation = await this.proxy.implementation()
      assert.equal(implementation, this.behavior.address)
    })
  })
  describe('Post-Initialization', function () {
    beforeEach(async function () {
      await this.token.initialize(supply, votingWindow)
    })
    it('sender has balance', async function () {
      const balanceValue = await this.token.balanceOf(accounts[0])
      assert.equal(balanceValue.toNumber(), supply)
    })
    it('window has value', async function () {
      const windowValue = await this.token.windowSize()
      assert.equal(windowValue.toNumber(), votingWindow)
    })
    it('reverts on reinitialization attempt', async function () {
      await assertRevert(this.token.initialize(500, 50))
    })
  })
  // describe('Upgrading', function () {
  //   beforeEach(async function () {
  //     await this.token.createProposal(...payload[1])
  //     await this.token.transfer(accounts[1], 200, {from: accounts[0]})
  //     await this.token.transfer(accounts[2], 100, {from: accounts[0]})
  //   })
  //   it('sets target correctly', async function () {
  //     await this.token.voteOnProposal(0, true, {from: accounts[1]})
  //     increaseTimeTo(this.endTime)
  //     await this.token.confirmProposal(0)
  //     const approvedTargetValue = await this.token.approvedTarget()
  //     assert.equal(payload[0][0], approvedTargetValue)
  //   })
  //   it('sets previously approved value', async function () {
  //     await this.token.voteOnProposal(0, true, {from: accounts[1]})
  //     increaseTimeTo(this.endTime)
  //     await this.token.confirmProposal(0)
  //     const Proposal = await this.token.proposals(0)
  //     assert(Proposal[5])
  //   })
  //   it('reverts until outside voting window', async function () {
  //     await this.token.voteOnProposal(0, true, {from: accounts[1]})
  //     await assertRevert(this.token.confirmProposal(0))
  //     increaseTimeTo(this.midTime)
  //     await assertRevert(this.token.confirmProposal(0))
  //     increaseTimeTo(this.endTime)
  //     await this.token.confirmProposal(0)
  //   })
  //   it('revets if proposal is invalid', async function () {
  //     await this.token.voteOnProposal(0, true, {from: accounts[2]})
  //     await this.token.voteOnProposal(0, false, {from: accounts[1]})
  //     increaseTimeTo(this.endTime)
  //     await assertRevert(this.token.confirmProposal(0))
  //   })
  //   it('reverts on reconfirmation', async function () {
  //     await this.token.voteOnProposal(0, true, {from: accounts[1]})
  //     increaseTimeTo(this.endTime)
  //     await this.token.confirmProposal(0)
  //     await assertRevert(this.token.confirmProposal(0))
  //   })
  //   it('old approved proposal cannot be reconfirmed', async function () {
  //     await this.token.voteOnProposal(0, true, {from: accounts[1]})
  //     increaseTimeTo(latestTime() + duration.days(1))
  //     await this.token.confirmProposal(0)
  //     await this.token.unblockTransfer({from: accounts[1]})
  //
  //     await this.token.createProposal(...payload[2])
  //     await this.token.voteOnProposal(2, true, {from: accounts[1]})
  //     increaseTimeTo(latestTime() + duration.days(1))
  //     await this.token.confirmProposal(2)
  //     await assertRevert(this.token.confirmProposal(0))
  //   })
  // })
  shouldBehaveLikeGeneric(payload, votingWindow, supply, accounts)
  shouldBehaveLikeStandardToken(supply, accounts[0], accounts[1], accounts[2],
    accounts[3], votingWindow)
})
