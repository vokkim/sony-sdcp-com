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

  it('should turn on power', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E59000130020001', '020A534F4E5901013000')
    client.setPower(true).then(status => {
      assert.equal(status, true)
      done()
    }).catch(err => {
      done(err)
    })
  })

  it('should return power status ON', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5901010200', '020A534F4E59010102020003')
    client.getPower().then(status => {
      assert.equal(status, 'ON')
      done()
    }).catch(err => {
      done(err)
    })
  })

  it('should error if unknown power status', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5901010200', '020A534F4E590101020200FF')
    client.getPower().catch(err => {
      done()
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
