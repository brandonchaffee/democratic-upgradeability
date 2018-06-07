// import assertRevert from './helpers/assertRevert'

const DemTokenV1 = artifacts.require('DemTokenV1')
const Proxy = artifacts.require('InitializedProxy')
const windowTime = 1000
const totalSupply = 50000

contract('Democratic Upgradeablity', function (accounts) {
  beforeEach(async function () {
    this.token = await DemTokenV1.new(windowTime, totalSupply)
    this.proxy = await Proxy.new(this.token.address)
  })
  describe('Initalization', function () {
    it('has correct implementation address', async function () {
      const implementation = await this.proxy.implementation()
      assert.equal(implementation, this.token.address)
    })
    it('sender has balance', async function () {
      // const proxiedToken = DemTokenV1.at(this.proxy.address)
      // const balanceValue = await proxiedToken.balanceOf(accounts[0])
      // Needs to be initailzied with token constructor stuff
      // assert.equal(balanceValue.toNumber(), totalSupply)
    })
  })
  describe('Voting', function () {

  })
  describe('Upgrading', function () {

  })
})
