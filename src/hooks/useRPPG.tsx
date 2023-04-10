/* eslint-disable no-magic-numbers */
// todo discover why serverless switching doesn't work

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import {
  CALCULATION_TIMEOUT,
  FPS_CHECK_DONE_TIMEOUT,
  FPS_CHECK_THRESHOLD,
  FPS_CHECK_TIMEOUT,
} from 'helpers/capture'
import RPPG from 'rppg/dist'
import {
  checkIsAllDataCalculated,
  checkNumberOfTrueFlags,
  defaultFpsValue,
  defaultImageQualityFlags,
  defaultRppgData,
  Fps,
  normalizeBGRData,
  normalizeHRVData,
  RPPGData,
  UseRPPG,
  UseRPPGResult,
} from 'helpers/rppg'
import { RPPGOnFrame } from 'rppg/dist/lib/RPPG.types'
import {
  HrvMetrics,
  MeasurementMeanData,
  MeasurementProgress,
  MeasurementSignal,
  MeasurementStatus,
  SignalQuality,
  StressIndex,
} from 'rppg/dist/lib/RPPGEvents.types'
import { ProgressType } from 'tabs/CaptureTab/Components'
import { SOCKET_URL } from 'rppg/dist/lib/consts/api'
import { AUTH_TOKEN } from 'consts'
import { ERROR_CAMERA_INITIALISATION, ERROR_SOCKET_CONNECTION } from 'helpers/error'

export interface CameraConfig {
  width: number
  height: number
}

export type EventCBRef = (() => void) | undefined

function useRPPG({
  videoElement,
  serverless = false,
  useFrontCamera = true,
  authToken,
  url,
  conditionsOk,
  permissionsOk,
  onUnsupportedDeviceCb,
  onAllDataCalculatedCb,
  onCalculationEndedCb,
  onInterferenceWarningCb,
  onUnstableConditionsWarningCb,
  onFaceOrientWarningCb,
  onFaceSizeWarningCb,
  onUnsupportedFaceConditionsCb,
  onUnsupportedLightConditionsCb,
}: UseRPPG): UseRPPGResult {
  const [rppgData, setRppgData] = useReducer((
      state: RPPGData,
      updates: Partial<RPPGData>
  ) => ({ ...state, ...updates }),
  defaultRppgData
  )
  const [ready, setReady] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [rppgInstance, setRppgInstance] = useState<RPPG>()
  const [isAllDataCalculated, setIsAllDataCalculated] = useState(false)
  const [isCalculationEnded, setIsCalculationEnded] = useState(false)
  const [fps, setFps] = useState<Fps>(defaultFpsValue)
  const [imageQualityFlags, setImageQualityFlags] = useState(defaultImageQualityFlags)
  const [progressType, setProgressType] = useState(ProgressType.START)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  // Refs
  const checkDeviceDoneTimer = useRef<NodeJS.Timeout>()
  const checkDeviceTimer = useRef<NodeJS.Timeout>()
  const unsupportedFaceConditions = useRef<boolean>(false)
  const unsupportedLightConditions = useRef<boolean>(false)
  const timeoutTimer = useRef<NodeJS.Timeout>()
  const progressInterval = useRef<NodeJS.Timeout>()

  // Refs for event callbacks
  const onInterferenceWarningCbRef = useRef<EventCBRef>()
  const onUnstableConditionsWarningCbRef = useRef<EventCBRef>()
  const onFaceOrientWarningCbRef = useRef<EventCBRef>()
  const onFaceSizeWarningCbRef = useRef<EventCBRef>()
  const onUnsupportedFaceConditionsCbRef = useRef<EventCBRef>()
  const onUnsupportedLightConditionsCbRef = useRef<EventCBRef>()

  useEffect(() => {
    let isMounted = true
    async function initRPPG() {
      if (!videoElement.current) {
        return
      }

      const onFrame = (frameData: RPPGOnFrame) => {
        if (!isMounted) {
          return
        }
        setFps((fps) => ({
          ...fps,
          maxFps: Math.max(frameData.instantFps, fps.maxFps),
          instantFps: frameData.instantFps,
          averageFps: frameData.averageFps,
        }))
        setImageQualityFlags(frameData.rppgTrackerData.imageQualityFlags)
        setRppgData({ frameData })
      }

      const onMeasurementMeanData = (measurementData: MeasurementMeanData) =>
        isMounted && setRppgData({ measurementData: normalizeBGRData(measurementData) })

      const onMeasurementStatus = (measurementStatus: MeasurementStatus) =>
        isMounted && setRppgData({ measurementStatus })

      const onMeasurementProgress = (measurementProgress: MeasurementProgress) =>
        isMounted && setRppgData({ measurementProgress })

      const onSignalQuality = (signalQuality: SignalQuality) =>
        isMounted && setRppgData({ signalQuality })

      const onMeasurementSignal = (measurementSignal: MeasurementSignal) =>
        isMounted && setRppgData({ measurementSignal })

      const onStressIndex = (stressIndex: StressIndex) =>
        isMounted && setRppgData({ stressIndex })

      const onHrvMetrics = (hrvMetrics: HrvMetrics) =>
        isMounted && setRppgData({ hrvMetrics: normalizeHRVData(hrvMetrics) })

      const onInterferenceWarning = () =>
        isMounted &&
        typeof onInterferenceWarningCbRef.current === 'function' &&
        onInterferenceWarningCbRef.current()

      const onUnstableConditionsWarning = () =>
        isMounted &&
        typeof onUnstableConditionsWarningCbRef.current === 'function' &&
        onUnstableConditionsWarningCbRef.current()

      const onFaceOrientWarning = () =>
        isMounted &&
        typeof onFaceOrientWarningCbRef.current === 'function' &&
        onFaceOrientWarningCbRef.current()

      const onFaceSizeWarning = () =>
        isMounted &&
        typeof onFaceOrientWarningCbRef.current === 'function' &&
        onFaceOrientWarningCbRef.current()

      const rppg = new RPPG({
        serverless,
        skipSocketWhenNoFace: true,
        skipSocketWhenBadFaceConditions: true,
        skipSocketWhenBadLightConditions: true,

        // camera config
        rppgCameraConfig: {
          useFrontCamera,
          videoElement: videoElement.current,
          onError: () => {
            setReady(false)
            setError(new Error(ERROR_CAMERA_INITIALISATION))
          },
        },

        // tracker config
        rppgTrackerConfig: {
          maxTimeBetweenBlinksSeconds: 20,
        },

        // socker config
        rppgSocketConfig: {
          authToken: authToken || AUTH_TOKEN,
          url: url || SOCKET_URL,
          onConnect: () => {
            setReady(true)
            setError(null)
          },
          onError: () => {
            setReady(false)
            setError(new Error(ERROR_SOCKET_CONNECTION))
          },
          onClose: () => {
            setReady(false)
            setError(new Error(ERROR_SOCKET_CONNECTION))
          },
        },

        onFrame,
        onMeasurementMeanData,
        onMeasurementStatus,
        onMeasurementProgress,
        onSignalQuality,
        onMeasurementSignal,
        onStressIndex,
        onHrvMetrics,
        onInterferenceWarning,
        onUnstableConditionsWarning,
        onFaceOrientWarning,
        onFaceSizeWarning,
      })

      setRppgInstance(rppg)

      await rppg.init()

      setReady(true)
    }

    if (permissionsOk) {
      initRPPG()
    }

    return () => {
      isMounted = false
    }

  }, [permissionsOk, videoElement, serverless, authToken, useFrontCamera, url])

  useEffect(() => {
    const {
      isAllDataCalculated,
    } = checkIsAllDataCalculated(rppgData.measurementData, rppgData.stressIndex, rppgData.hrvMetrics)
    if (isAllDataCalculated) {
      setProgress(100)
      clearInterval(progressInterval.current)
      progressInterval.current = undefined
      setTimeout(() => setIsAllDataCalculated(true), 500)
    } else {
      setIsAllDataCalculated(isAllDataCalculated)
    }
  }, [rppgData.measurementData, rppgData.stressIndex, rppgData.hrvMetrics])

  useEffect(() => {
    if (conditionsOk && progressType === ProgressType.CHECKING) {
      setProgressType(ProgressType.CALIBRATING)
    }
  }, [conditionsOk, progressType])

  const start = useCallback(() => {
    const startFPSCheckTimer = () =>
      checkDeviceTimer.current = setTimeout(() => {
        setFps((fps) => ({
          ...fps,
          unsupported: fps.maxFps < FPS_CHECK_THRESHOLD,
        }))
        startFPSCheckDoneTimer()
      }, FPS_CHECK_TIMEOUT)

    if (!rppgInstance) {
      console.error('Not initialized')
      return
    }
    setRppgData(defaultRppgData)
    setProgressType(ProgressType.CHECKING)
    setProcessing(true)
    setIsCalculationEnded(false)
    rppgInstance.start()
    startFPSCheckTimer()
  }, [rppgInstance])

  const stop = useCallback(() => {
    if (!rppgInstance) {
      console.error('Not initialized')
      return
    }
    setProgressType(ProgressType.START)
    setProcessing(false)
    clearTimeout(checkDeviceDoneTimer.current)
    checkDeviceDoneTimer.current = undefined
    clearTimeout(checkDeviceTimer.current)
    checkDeviceTimer.current = undefined
    clearTimeout(timeoutTimer.current)
    timeoutTimer.current = undefined
    clearInterval(progressInterval.current)
    progressInterval.current = undefined
    rppgInstance.stop()
  }, [rppgInstance])

  const pause = (value: boolean) => {
    if (!rppgInstance) {
      console.error('Not initialized')
      return
    }
    rppgInstance.pause(value)
  }

  const closeCamera = () => rppgInstance?.closeCamera()

  const switchServerless = (serverless: boolean) =>
    rppgInstance?.switchServerless(serverless)

  const switchCamera = (useFrontCamera: boolean) =>
    rppgInstance?.switchCamera(useFrontCamera) || Promise.resolve(undefined)

  // Timers
  const startFPSCheckDoneTimer = () => {
    checkDeviceDoneTimer.current = setTimeout(() => {
      checkDeviceTimer.current = undefined
      checkDeviceDoneTimer.current = undefined
      // setProgressType(ProgressType.CALCULATING)
    }, FPS_CHECK_DONE_TIMEOUT)
  }

  const startProgressInterval = () => {
    const startTime = new Date().getTime()
    progressInterval.current = setInterval(() =>
      setProgress(Math.round((new Date().getTime() - startTime) / CALCULATION_TIMEOUT * 100))
    , 250)
  }

  const startTimeoutTimer = () =>
    timeoutTimer.current = setTimeout(() => {
      setIsCalculationEnded(true)
      console.log('Stop - Timeout')
    }, CALCULATION_TIMEOUT)

  useEffect(() => {
    const {
      brightColorFlag,
      illumChangeFlag,
      noiseFlag,
      sharpFlag,
      faceSizeFlag,
      faceOrientFlag,
    } = imageQualityFlags
    if (!checkDeviceDoneTimer && !checkDeviceTimer) {
      return
    }

    unsupportedFaceConditions.current = !checkNumberOfTrueFlags([
      faceSizeFlag,
      faceOrientFlag,
    ], 2)

    unsupportedLightConditions.current = !checkNumberOfTrueFlags([
      brightColorFlag,
      illumChangeFlag,
      noiseFlag,
      sharpFlag,
    // eslint-disable-next-line no-magic-numbers
    ], 3)

    if (unsupportedFaceConditions.current && typeof onUnsupportedFaceConditionsCbRef.current === 'function') {
      onUnsupportedFaceConditionsCbRef.current()
    }
    if (unsupportedLightConditions.current && typeof onUnsupportedLightConditionsCbRef.current === 'function') {
      onUnsupportedLightConditionsCbRef.current()
    }
  }, [checkDeviceDoneTimer, checkDeviceTimer, imageQualityFlags])

  useEffect(() => {
    if (processing &&
        rppgData.measurementStatus.statusMessage &&
        rppgData.measurementStatus.statusMessage !== 'Calibrating' && !timeoutTimer.current) {
      startProgressInterval()
      startTimeoutTimer()

      if (progressType === ProgressType.CALIBRATING) {
        setProgressType(ProgressType.CALCULATING)
      }
    }
  }, [processing, progressType, rppgData.measurementStatus.statusMessage])

  // Callback events
  // onUnsupportedDeviceCb event
  useEffect(() => {
    if (fps.unsupported && typeof onUnsupportedDeviceCb === 'function') {
      onUnsupportedDeviceCb()
    }
  }, [fps.unsupported, onUnsupportedDeviceCb])

  // onAllDataCalculatedCb event
  useEffect(() => {
    if (isAllDataCalculated && typeof onAllDataCalculatedCb === 'function') {
      onAllDataCalculatedCb()
    }
  }, [isAllDataCalculated, onAllDataCalculatedCb])

  // onCalculationEndedCb event
  useEffect(() => {
    if (isCalculationEnded && typeof onCalculationEndedCb === 'function') {
      onCalculationEndedCb()
    }
  }, [isCalculationEnded, onCalculationEndedCb])

  // onInterferenceWarningCb Event
  useEffect(() => {
    onInterferenceWarningCbRef.current = onInterferenceWarningCb
  }, [onInterferenceWarningCb])

  // onUnstableConditionsWarning event
  useEffect(() => {
    onUnstableConditionsWarningCbRef.current = onUnstableConditionsWarningCb
  }, [onUnstableConditionsWarningCb])

  // onFaceOrientWarningCb event
  useEffect(() => {
    onFaceOrientWarningCbRef.current = onFaceOrientWarningCb
  }, [onFaceOrientWarningCb])

  // onFaceSizeWarningCb event
  useEffect(() => {
    onFaceSizeWarningCbRef.current = onFaceSizeWarningCb
  }, [onFaceSizeWarningCb])

  // onUnsupportedFaceConditionsCb event
  useEffect(() => {
    onUnsupportedFaceConditionsCbRef.current = onUnsupportedFaceConditionsCb
  }, [onUnsupportedFaceConditionsCb])

  // onUnsupportedLightConditionsCb event
  useEffect(() => {
    onUnsupportedLightConditionsCbRef.current = onUnsupportedLightConditionsCb
  }, [onUnsupportedLightConditionsCb])

  return {
    rppgData,
    ready,
    error,
    rppgInstance,
    isAllDataCalculated,
    fps,
    imageQualityFlags,
    progressType,
    processing,
    progress,
    checkFps: Boolean(checkDeviceDoneTimer.current || checkDeviceTimer.current),
    start,
    stop,
    pause,
    closeCamera,
    switchServerless,
    switchCamera,
  }
}

export default useRPPG
