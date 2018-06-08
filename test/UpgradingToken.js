import assertRevert from './helpers/assertRevert'
import { advanceBlock } from './helpers/advanceToBlock'
import { duration, increaseTimeTo } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const DemTokenV1 = artifacts.require('DemTokenV1')
const DemTokenV2 = artifacts.require('DemTokenV2')
const DemTokenV3 = artifacts.require('DemTokenV2')
const Proxy = artifacts.require('InitializedProxy')
const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.js')
const shouldBehaveLikeGeneric = require('./behaviors/GenericProposal.js')
const votingWindow = 4000
const supply = 100000000

const details = [
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b37',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b38',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b39'
]

contract('Democratic Upgradeablity', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.V1behavior = await DemTokenV1.new()
    this.V2Behavior = await DemTokenV2.new()
    this.V3Behavior = await DemTokenV3.new()
    this.proxy = await Proxy.new(this.V1behavior.address)
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
      assert.equal(implementation, this.V1behavior.address)
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
  describe('Upgrading', function () {
    beforeEach(async function () {
      await this.token.initialize(supply, votingWindow)
      await this.token.createProposal(this.V2Behavior.address, details[0])
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
    })
    describe('Confirmation', function () {
      it('sets new implementation correctly', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
        const newImplementation = await this.proxy.implementation()
        assert.equal(this.V2Behavior.address, newImplementation)
      })
      it('sets previously approved value', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
        const Proposal = await this.token.proposals(0)
        assert(Proposal[5])
      })
      it('reverts until outside voting window', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await assertRevert(this.token.confirmProposal(0))
        increaseTimeTo(this.midTime)
        await assertRevert(this.token.confirmProposal(0))
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
      })
      it('revets if proposal is invalid', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[2]})
        await this.token.voteOnProposal(0, false, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await assertRevert(this.token.confirmProposal(0))
      })
      it('reverts on reconfirmation', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
        await assertRevert(this.token.confirmProposal(0))
      })
      it('reverts reconfirmation after other confirmation', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmProposal(0)
        await this.token.unblockTransfer({from: accounts[1]})

        await this.token.createProposal(this.V3Behavior.address, details[1])
        await this.token.voteOnProposal(1, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmProposal(1)
        await assertRevert(this.token.confirmProposal(0))
      })
    })
    describe('New Implementation', function () {
      it('can perform new functions after upgrade', async function () {
        const preBalance = await this.token.balanceOf(accounts[2])
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmProposal(0)
        await this.token.unblockTransfer({from: accounts[1]})

        const newTokenImplemenation = DemTokenV2.at(this.proxy.address)
        const burnValue = 50
        await newTokenImplemenation.burn(burnValue, {from: accounts[2]})
        const newSupply = await newTokenImplemenation.totalSupply()
        const postBalance = await newTokenImplemenation.balanceOf(accounts[2])
        assert.equal(newSupply.toNumber(), supply - burnValue)
        assert.equal(postBalance.toNumber(), preBalance.toNumber() - burnValue)
      })
      it('reverts new functions prior to upgrade', async function () {
        const tokenTest = DemTokenV2.at(this.proxy.address)
        await assertRevert(tokenTest.burn(25))
      })
      it('maintains storage state', async function () {
        const preBalance = await this.token.balanceOf(accounts[2])
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmProposal(0)

        const newTokenImplemenation = DemTokenV2.at(this.proxy.address)
        const postBalance = await newTokenImplemenation.balanceOf(accounts[2])
        assert.equal(postBalance.toNumber(), preBalance.toNumber())
      })
    })
  })
  shouldBehaveLikeGeneric(details, votingWindow, supply, accounts)
  shouldBehaveLikeStandardToken(supply, accounts[0], accounts[1], accounts[2],
    accounts[3], votingWindow)
})
