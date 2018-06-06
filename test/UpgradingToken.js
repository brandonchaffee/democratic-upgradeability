// import assertRevert from './helpers/assertRevert'

const DemTokenV1 = artifacts.require('DemTokenV1')
const totalSupply = 50000
contract('Upgrading', function (accounts) {
  beforeEach(async function () {
    this.token = await DemTokenV1.new(totalSupply)
  })
  // describe('it works', function () {
  //   it('works well', async function () {
  //     console.log('Looks good!')
  //   })
  // })
})
