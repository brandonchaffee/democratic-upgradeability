import assertRevert from './helpers/assertRevert'

const DemTokenV1 = artifacts.require('DemTokenV1')
const Proxy = artifacts.require('InitializedProxy')
const windowTime = 1000
const totalSupply = 50000

contract('Democratic Upgradeablity', function (accounts) {
  beforeEach(async function () {
    this.token = await DemTokenV1.new(windowTime, totalSupply)
    this.proxy = await Proxy.new(this.token.address)
    this.proxiedToken = DemTokenV1.at(this.proxy.address)
  })
  describe('Pre-Initialization', function () {
    it('does not have balance or window', async function () {
      const balanceValue = await this.proxiedToken.balanceOf(accounts[0])
      const windowValue = await this.proxiedToken.windowSize()
      assert.equal(balanceValue.toNumber(), 0)
      assert.equal(windowValue.toNumber(), 0)
    })
    it('proxy has correct implementation address', async function () {
      const implementation = await this.proxy.implementation()
      assert.equal(implementation, this.token.address)
    })
  })
  describe('Post-Initialization', function () {
    beforeEach(async function () {
      await this.proxiedToken.initialize(totalSupply, windowTime)
    })
    it('sender has balance', async function () {
      const balanceValue = await this.proxiedToken.balanceOf(accounts[0])
      assert.equal(balanceValue.toNumber(), totalSupply)
    })
    it('window has value', async function () {
      const windowValue = await this.proxiedToken.windowSize()
      assert.equal(windowValue.toNumber(), windowTime)
    })
    it('reverts on reinitialization attempt', async function () {
      await assertRevert(this.proxiedToken.initialize(500, 50))
    })
  })
  describe('Proposing', function () {
    // it('should b proposal')
  })
  describe('Voting', function () {
    beforeEach(async function () {
      this.proxiedToken.transfer(10000, accounts[1])
      this.proxiedToken.transfer(10000, accounts[2])
      this.proxiedToken.transfer(10000, accounts[3])
      this.proxiedToken.transfer(10000, accounts[4])
    })
    // it('')
  })
  describe('Upgrading', function () {

  })
})
