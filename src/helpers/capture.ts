/* eslint-disable no-magic-numbers */
import { translationObj } from 'consts/translation'

export const FPS_CHECK_TIMEOUT = 5000
export const FPS_CHECK_DONE_TIMEOUT = 1500
export const FPS_CHECK_THRESHOLD = 5

export enum HealthState {
  OPTIMAL = 'Optimal',
  GOOD = 'Good',
  ATTENTION = 'Attention',
}

const bpmHealthState = (value: number) => {
  if (value < 70) {
    return HealthState.OPTIMAL
  }
  if (value >= 70 && value <= 100) {
    return HealthState.GOOD
  }
  return HealthState.ATTENTION
}

const rrHealthState = (value: number) => {
  if (value < 20) {
    return HealthState.OPTIMAL
  }
  if (value >= 20 && value <= 30) {
    return HealthState.GOOD
  }
  return HealthState.ATTENTION
}

const stressHealthState = (value: number) => {
  if (value < 50) {
    return HealthState.OPTIMAL
  }
  if (value >= 50 && value <= 100) {
    return HealthState.GOOD
  }
  return HealthState.ATTENTION
}

const hrvHealthState = (value: number) => {
  if (value > 80) {
    return HealthState.OPTIMAL
  }
  if (value >= 51 && value <= 80) {
    return HealthState.GOOD
  }
  return HealthState.ATTENTION
}

export const SCHEMA: Schema[] = [{
  name: 'Heart Rate',
  longName: 'Heart Rate',
  key: 'measurementData.bpm',
  sign: 'bpm',
  icon: 'heart.svg',
  iconResult: 'heart-result.svg',
  avgValue: 63,
  minValue: 40,
  maxValue: 110,
  healthState: bpmHealthState,
}, {
  name: 'Breathing rate',
  longName: 'Respiration Rate',
  key: 'measurementData.rr',
  sign: 'rpm',
  icon: 'resp-rate.svg',
  iconResult: 'resp-rate-result.svg',
  avgValue: 18,
  minValue: 5,
  maxValue: 40,
  healthState: rrHealthState,
}, {
//   name: 'Oxygen',
//   longName: 'Blood oxygen',
//   key: 'measurementData.oxygen',
//   sign: '%',
//   icon: 'oxygen.svg',
//   iconResult: 'oxygen-result.svg',
// }, {
  name: 'HRV SDNN',
  longName: 'HRV SDNN',
  key: 'hrvMetrics.sdnn',
  sign: 'ms',
  icon: 'sdnn.svg',
  iconResult: 'sdnn-result.svg',
  avgValue: 150,
  minValue: 80,
  maxValue: 175,
  healthState: hrvHealthState,
}, {
  name: 'Stress',
  longName: 'Stress',
  key: 'stressIndex.stress',
  sign: 'si',
  icon: 'stress.svg',
  iconResult: 'stress-result.svg',
  avgValue: 63,
  minValue: 10,
  maxValue: 150,
  healthState: stressHealthState,
// }, {
//   name: 'Blood Pressure',
//   longName: 'Blood Pressure',
//   key: 'bloodPressureStatus',
//   sign: '',
//   icon: 'pressure.svg',
//   iconResult: 'pressure-result.svg',
}]

// eslint-disable-next-line no-magic-numbers
export const CALCULATION_TIMEOUT = 30 * 1000 // 30s

export interface Schema {
  name: string
  longName: string
  key: string
  sign: string
  icon: string
  iconResult: string
  avgValue?: number
  minValue?: number
  maxValue?: number
  healthState: (value: number) => string
}

// todo lang from context
export const getSchema = (lang = 'en'): Schema[] => {
  return SCHEMA.map(item => ({
    ...item,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    name: translationObj[lang][item.key],
  }))
}
