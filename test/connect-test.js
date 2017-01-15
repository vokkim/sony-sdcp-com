const assert = require('assert')
const net = require('net')
const DummyServer = require('./dummy-server')
const {SdcpClient, powerStatus, aspectRatio} = require('../index.js')

describe('Connect to projector', function() {
  this.timeout(10000)
  let server
  before(startServer(s => {
    server = s
  }))

  it('should turn on power and return correct status', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E59000130020001', '020A534F4E5901013000')
    server.mock('020A534F4E5901010200', '020A534F4E59010102020003')
    client.setPower(true).then(status => {
      assert.equal(status, 'ON')
    }).then(done, done)
  })

  it('should return power status OFF', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5901010200', '020A534F4E59010102020000')
    client.getPower().then(status => {
      assert.equal(status, 'OFF')
    }).then(done, done)
  })

  it('should error if unknown power status', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5901010200', '020A534F4E590101020200FF')
    client.getPower().catch(err => {
      done()
    })
  })

  it('should return aspect ratio', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5901002000', '020A534F4E5901002002000D')
    client.getAspectRatio().then(status => {
      assert.equal(status, 'ZOOM_2_35')
    }).then(done, done)
  })

  it('set aspect ratio and return correct status', (done) => {
    const client = SdcpClient({address: 'localhost', port: server.port})
    server.mock('020A534F4E5900002002000E', '020A534F4E5901002000')
    server.mock('020A534F4E5901002000', '020A534F4E5901002002000E')
    client.setAspectRatio(aspectRatio.STRETCH).then(status => {
      assert.equal(status, 'STRETCH')
    }).then(done, done)
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
