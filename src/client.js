const Bacon = require('baconjs')
const RawSdcpClient = require('./raw-client')
const {commands, actions, aspectRatio, powerStatus} = require('./commands')

function SdcpClient(config = {}) {
	const rawClient = RawSdcpClient(config)

	return {
		setPower: (powerOn) => {
			return rawClient.setAction(commands.SET_POWER, powerOn ? powerStatus.START_UP : powerStatus.STANDBY)
				.map(true)
				.firstToPromise()
		},
		getPower: () => {
			return rawClient.getAction(commands.GET_STATUS_POWER)
				.flatMap(result => Bacon.once(convertPowerStatusToString(result)))
				.firstToPromise()
		},
		getAction: (command, data) => {
			return rawClient.getAction(command, data).firstToPromise()
		},
		setAction: (command, data) => {
			return rawClient.setAction(command, data).firstToPromise()
		}
	}
}

function convertPowerStatusToString(result) {
	switch (result.data) {
		case powerStatus.STANDBY:
			return 'OFF'
		case powerStatus.START_UP:
		case powerStatus.START_UP_LAMP:
			return 'WARMING'
		case powerStatus.POWER_ON:
			return 'ON'
		case powerStatus.COOLING:
		case powerStatus.COOLING2:
			return 'COOLING'
		default:
			return new Bacon.Error(`Unknown power status ${result.data} (${result.raw.toString('hex').toUpperCase()})`)
	}
}

module.exports = {
	SdcpClient,
	commands,
	actions,
	aspectRatio,
	powerStatus
}
