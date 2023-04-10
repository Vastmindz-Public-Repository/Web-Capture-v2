import { RefObject } from 'react'
import RPPG from 'rppg/dist'
import { RPPGOnFrame } from 'rppg/dist/lib/RPPG.types'
import { RPPGCameraInit } from 'rppg/dist/lib/RPPGCamera.types'

import {
  BloodPressureStatus,
  HrvMetrics,
  MeasurementMeanData,
  MeasurementProgress,
  MeasurementSignal,
  MeasurementStatus,
  SignalQuality,
  StatusCode,
  StressIndex,
  StressStatus,
} from 'rppg/dist/lib/RPPGEvents.types'
import {
  ImageQualityFlags,
  RPPGTrackerProcessFrameData,
} from 'rppg/dist/lib/RPPGTracker.types'
import { ProgressType } from 'tabs/CaptureTab/Components'

export interface Fps {
  maxFps: number
  averageFps: number
  instantFps: number
  unsupported: boolean
}

export interface RPPGData {
  frameData: RPPGOnFrame
  measurementData: MeasurementMeanData
  measurementStatus: MeasurementStatus
  measurementProgress: MeasurementProgress
  signalQuality: SignalQuality
  stressIndex: StressIndex
  measurementSignal: MeasurementSignal
  fps: Fps
  imageQualityFlags: ImageQualityFlags
  hrvMetrics: HrvMetrics
}

export interface UseRPPG {
  videoElement: RefObject<HTMLVideoElement>
  serverless?: boolean
  useFrontCamera?: boolean
  authToken?: string
  url?: string
  conditionsOk: boolean
  permissionsOk: boolean
  onUnsupportedDeviceCb?: () => void
  onAllDataCalculatedCb?: () => void
  onCalculationEndedCb?: () => void
  onInterferenceWarningCb?: () => void
  onUnstableConditionsWarningCb?: () => void
  onFaceOrientWarningCb?: () => void
  onFaceSizeWarningCb?: () => void
  onUnsupportedFaceConditionsCb?: () => void
  onUnsupportedLightConditionsCb?: () => void
  onCheckFailedCb?: () => void
}

export interface UseRPPGResult {
  rppgData: RPPGData
  ready: boolean
  error: Error | null
  rppgInstance: RPPG | void
  isAllDataCalculated: boolean
  fps: Fps
  imageQualityFlags: ImageQualityFlags
  progressType: ProgressType
  processing: boolean
  progress: number
  checkFps: boolean
  start: () => void
  stop: () => void
  pause: (value: boolean) => void
  closeCamera: () => void
  switchServerless: (serverless: boolean) => void
  switchCamera: (useFrontCamera: boolean) => Promise<RPPGCameraInit | void>
}

export type Callback = () => void | undefined

export const defaultMeasurementData = {
  bpm: 0,
  rr: 0,
  oxygen: 0,
  stressStatus: StressStatus.NO_DATA,
  bloodPressureStatus: BloodPressureStatus.NO_DATA,
}

export const defaultImageQualityFlags: ImageQualityFlags = {
  brightColorFlag: true,
  illumChangeFlag: true,
  noiseFlag: true,
  sharpFlag: true,
  faceSizeFlag: true,
  faceOrientFlag: true,
}

export const defaultRppgTrackerData: RPPGTrackerProcessFrameData = {
  status: 0,
  bgr1d: [],
  landmarks: [],
  face: [],
  eyeBlinkStatus: false,
  imageQualityFlags: defaultImageQualityFlags,
}

export const defaultFrameData: RPPGOnFrame = {
  rppgTrackerData: defaultRppgTrackerData,
  instantFps: 0,
  averageFps: 0,
  timestamp: 0,
}

export const defaultMeasurementStatus: MeasurementStatus = {
  statusCode: StatusCode.UNKNOWN,
  statusMessage: '',
}

export const defaultMeasurementProgress: MeasurementProgress = {
  progressPercent: 0,
}

export const defaultSignalQuality: SignalQuality = {
  snr: 0,
}

export const defaultMeasurementSignal: MeasurementSignal = {
  signal: [],
  ecg: [],
}

export const defaultStressIndex: StressIndex = {
  stress: 0,
}

export const defaultFpsValue: Fps = {
  maxFps: 0,
  averageFps: 0,
  instantFps: 0,
  unsupported: false,
}

export const defaultHrvMetrics: HrvMetrics = {
  ibi: 0,
  rmssd: 0,
  sdnn: 0,
  rr: [],
}

export const defaultRppgData: RPPGData = {
  frameData: defaultFrameData,
  measurementData: defaultMeasurementData,
  measurementStatus: defaultMeasurementStatus,
  measurementProgress: defaultMeasurementProgress,
  signalQuality: defaultSignalQuality,
  measurementSignal: defaultMeasurementSignal,
  stressIndex: defaultStressIndex,
  fps: defaultFpsValue,
  imageQualityFlags: defaultImageQualityFlags,
  hrvMetrics: defaultHrvMetrics,
}

export const NO_DATA = 'NO_DATA'
export const bps = {
  HYP_S1: 'NORMAL',
  HYP_S2: 'ELEVATED',
  HYP_CRISIS: 'HIGH',
}

export const convertBPS = (data: BloodPressureStatus) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  bps[data] || data

export const normalizeBGRData = (bgrData: MeasurementMeanData): MeasurementMeanData => {
  const {
    stressStatus,
    bloodPressureStatus,
  } = bgrData
  return {
    ...bgrData,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stressStatus: (stressStatus === null || String(stressStatus) === NO_DATA) ? null : stressStatus,
    bloodPressureStatus: bloodPressureStatus === null || String(bloodPressureStatus) === NO_DATA
      ? null : convertBPS(bloodPressureStatus),
  }
}

export const normalizeHRVData = (hrvMetrics: HrvMetrics): HrvMetrics => {
  const {
    sdnn,
  } = hrvMetrics
  return {
    ...hrvMetrics,
    sdnn: Math.round(sdnn),
  }
}

export const checkIsAllDataCalculated = (
    measurementData: MeasurementMeanData,
    stressIndex: StressIndex,
    hrvMetrics: HrvMetrics
) => {
  const {
    bpm,
    rr,
  } = measurementData
  const {
    stress,
  } = stressIndex
  const {
    sdnn,
  } = hrvMetrics
  const isAllDataCalculated = Boolean(bpm && rr && stress !== 0 && stress !== -1 && sdnn)
  return {
    isAllDataCalculated,
  }
}

export const checkNumberOfTrueFlags = (arr: boolean[], minThreshold: number): boolean =>
  arr.filter(item => item).length >= minThreshold
