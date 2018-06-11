import assertRevert from './helpers/assertRevert'
import { advanceBlock } from './helpers/advanceToBlock'
import { duration, increaseTimeTo } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const EndlessThresholdTest = artifacts.require('EndlessThresholdTest')
const WindowedThresholdTest = artifacts.require('WindowedThresholdTest')
const WindowedRatioTest = artifacts.require('WindowedRatioTest')
const WindowedMajorityTest = artifacts.require('WindowedMajorityTest')
const supply = 500
const votingWindow = 1000
const threshold = 300
const ratioNumerator = 1000
const ratioDenominator = 1500

const payload = ['0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b37'
]

contract('Approval Types', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
  })
  describe('Endless Threshold', function () {
    beforeEach(async function () {
      this.token = await EndlessThresholdTest.new()
      this.token.initialize(supply, threshold)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createProposal(...payload)
    })
    it('reverts if threshold is not met', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, false, {from: accounts[2]})
      await this.token.voteOnProposal(0, true, {from: accounts[3]})
      const PStruct = await this.token.proposals(0)
      assert(PStruct[3] < threshold)
      await assertRevert(this.token.confirmProposal(0))
    })
    it('validates once thresholds has been met', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      await this.token.voteOnProposal(0, false, {from: accounts[3]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] >= threshold)
      await this.token.confirmProposal(0)
      PStruct = await this.token.proposals(0)
      assert(PStruct[5])
    })
  })
  describe('Windowed Threshold', function () {
    beforeEach(async function () {
      this.token = await WindowedThresholdTest.new()
      this.token.initialize(supply, votingWindow, threshold)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createProposal(...payload)
    })
    it('reverts vote outside window', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      increaseTimeTo(this.endTime)
      await assertRevert(this.token.voteOnProposal(0, true,
        {from: accounts[3]}))
    })
    it('reverts confirmation inisde window', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] >= threshold)
      increaseTimeTo(this.midTime)
      await assertRevert(this.token.confirmProposal(0))
    })
    it('reverts if threshold is not met', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, false, {from: accounts[2]})
      await this.token.voteOnProposal(0, true, {from: accounts[3]})
      const PStruct = await this.token.proposals(0)
      assert(PStruct[3] < threshold)

      increaseTimeTo(this.endTime)
      await assertRevert(this.token.confirmProposal(0))
    })
    it('validates once thresholds has been met', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      await this.token.voteOnProposal(0, false, {from: accounts[3]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] >= threshold)

      increaseTimeTo(this.endTime)
      await this.token.confirmProposal(0)
      PStruct = await this.token.proposals(0)
      assert(PStruct[5])
    })
  })
  describe('Windowed Ratio', function () {
    beforeEach(async function () {
      this.token = await WindowedRatioTest.new()
      this.token.initialize(supply, votingWindow, ratioNumerator,
        ratioDenominator)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createProposal(...payload)
    })
    it('reverts vote outside window', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      increaseTimeTo(this.endTime)
      await assertRevert(this.token.voteOnProposal(0, true,
        {from: accounts[3]}))
    })
    it('reverts confirmation inisde window', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] * ratioNumerator > PStruct[4] * ratioDenominator)
      increaseTimeTo(this.midTime)
      await assertRevert(this.token.confirmProposal(0))
    })
    it('reverts if ratio is not exceeded', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, false, {from: accounts[2]})
      await this.token.voteOnProposal(0, false, {from: accounts[3]})
      const PStruct = await this.token.proposals(0)
      assert(PStruct[3] * ratioNumerator < PStruct[4] * ratioDenominator)
      await assertRevert(this.token.confirmProposal(0))
    })
    it('validates once ratio has been exceeded', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] * ratioNumerator > PStruct[4] * ratioDenominator)
      increaseTimeTo(this.endTime)

      await this.token.confirmProposal(0)
      PStruct = await this.token.proposals(0)
      assert(PStruct[5])
    })
  })
  describe('Windowed Majority', function () {
    beforeEach(async function () {
      this.token = await WindowedMajorityTest.new()
      this.token.initialize(supply, votingWindow)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createProposal(...payload)
    })
    it('reverts vote outside window', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      increaseTimeTo(this.endTime)
      await assertRevert(this.token.voteOnProposal(0, true,
        {from: accounts[3]}))
    })
    it('reverts confirmation inisde window', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, false, {from: accounts[2]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] > PStruct[4])
      increaseTimeTo(this.midTime)
      await assertRevert(this.token.confirmProposal(0))
    })
    it('reverts if not in majority', async function () {
      await this.token.voteOnProposal(0, false, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      await this.token.voteOnProposal(0, true, {from: accounts[3]})
      const PStruct = await this.token.proposals(0)
      assert(PStruct[3] < PStruct[4])
      await assertRevert(this.token.confirmProposal(0))
    })
    it('validates once in majority', async function () {
      await this.token.voteOnProposal(0, true, {from: accounts[1]})
      await this.token.voteOnProposal(0, true, {from: accounts[2]})
      let PStruct = await this.token.proposals(0)
      assert(PStruct[3] > PStruct[4])
      increaseTimeTo(this.endTime)

      await this.token.confirmProposal(0)
      PStruct = await this.token.proposals(0)
      assert(PStruct[5])
    })
  })
})
