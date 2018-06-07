// import assertRevert from './helpers/assertRevert'

const DemTokenV1 = artifacts.require('DemTokenV1')
const windowTime = 1000
const totalSupply = 50000

contract('Upgrading', function (accounts) {
  beforeEach(async function () {
    this.token = await DemTokenV1.new(windowTime, totalSupply)
  })
  describe('it works', function () {
    it('works well', async function () {

    })
  })
})
