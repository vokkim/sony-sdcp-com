const actions = {
  GET: '01',
  SET: '00'
}

const commands = {
  SET_POWER: '0130',
  CALIBRATION_PRESET: '0002',
  ASPECT_RATIO: '0020',
  INPUT: '0001',
  GET_STATUS_ERROR: '0101',
  GET_STATUS_POWER: '0102',
  GET_STATUS_LAMP_TIMER: '0113'
}

const aspectRatio = {
  NORMAL: '0001',
  V_STRETCH: '000B',
  '1_85_ZOOM': '000C',
  '2_35_ZOOM': '000D',
  STRETCH: '000E',
  SQUEEZE: '000F'
}

const powerStatus = {
  STANDBY: '0000',
  START_UP: '0001',
  START_UP_LAMP: '0002',
  POWER_ON: '0003',
  COOLING: '0004',
  COOLING2: '0005'
}

module.exports = {
  commands,
  actions,
  aspectRatio,
  powerStatus
}
