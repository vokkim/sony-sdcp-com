const assert = require('assert')
const net = require('net')
const DummyServer = require('./dummy-server')
const {SdcpClient, powerStatus} = require('../index.js')

describe('Connect to projector', function() {
  this.timeout(10000)
  let server
  before(startServer(s => {
    server = s
  }))
  it('should return power status ON', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5900010200', '020A534F4E59010102020003')
    client.getPowerStatus().then(status => {
      assert.equal(status, 'ON')
      done()
    }).catch(err => {
      done(err)
    })
  })
})

function startServer(cb) {
  return function(done) {
    DummyServer(server => {
      cb(server)
      done()
    })
  }
}
