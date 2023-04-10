/* eslint-disable no-magic-numbers */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Loader } from '@fluentui/react-northstar'
import classNames from 'classnames'
import useFaceMesh from 'hooks/useFaceMesh'
import useRPPG from 'hooks/useRPPG'
import useNotification from 'hooks/useNotification'
import {
  LoadingScreen,
  CheckFps,
  // ImageQuality,
  Notification,
  Info,
  TextMessage,
  ProgressType,
  Debugger,
  Progress,
} from 'tabs/CaptureTab/Components'
import {
  NOTIFICATION_BAD_LIGHT_CONDITIONS,
  NOTIFICATION_FACE_ORIENT_WARNING,
  NOTIFICATION_FACE_SIZE_WARNING,
  NOTIFICATION_NO_FACE_DETECTED,
} from 'helpers/notification'
import './Capture.scss'
import {
  ERROR_CAMERA_INITIALISATION,
  ERROR_INTERFERENCE,
  ERROR_NOT_SUPPORTED,
} from 'helpers/error'
import { FaceMask } from 'tabs/CaptureTab/Components/FaseMask/FaceMask'
import { checkNumberOfTrueFlags } from 'helpers/rppg'

export function Capture() {
  const videoElement = useRef<HTMLVideoElement>(null)
  const canvasElement = useRef<HTMLCanvasElement>(null)

  const history = useHistory()

  const [size, setSize] = useState<{width: number, height: number}>(
    { width: 0, height: 0 }
  )

  const [debug] = useState<boolean>(localStorage.getItem('debug') === 'true')
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [conditions, setConditions] = useState({
    light: false,
    face: false,
    faceSize: false,
    faceOrient: false,
  })
  const [conditionsOk, setConditionsOk] = useState(false)
  const [permissionsOk, setPermissionsOk] = useState(false)

  const {
    message,
    addNotification,
    clearNotification,
    clearAllNotifications,
  } = useNotification()

  const [processingFaceMesh, setProcessingFaceMesh] = useState(false)

  const [useFrontCamera] = useState(true)

  const [showLoadingScreen, setShowLoadingScreen] = useState(true)

  const onUnsupportedDeviceCb = () => {
    stopHandler()
    history.push('/capture/error', ERROR_NOT_SUPPORTED)
  }

  const onUnsupportedLightConditionsCb = () =>
    processing && addNotification(NOTIFICATION_BAD_LIGHT_CONDITIONS)

  const onFaceOrientWarningCb = () =>
    processing && addNotification(NOTIFICATION_FACE_ORIENT_WARNING)

  // const onFaceSizeWarningCb = () =>
  //   processing && addNotification(NOTIFICATION_FACE_SIZE_WARNING)

  const onCalculationEndedCb = async () => {
    if (processing) {
      stopHandler()

      try {
        setLoading(true)
        // todo calculation ended
      } catch(e) {
        console.log('Error saving results', e)
      } finally {
        setLoading(false)
        // todo go to results page
        // history.push('/capture/results', {
        //   rppgData,
        //   isAllDataCalculated,
        //   readiness,
        // })
      }
    }
  }

  const onFaceDetectionChange = (faceDetected: boolean) => {
    if (processing && !faceDetected) {
      addNotification(NOTIFICATION_NO_FACE_DETECTED, true)
      pause(true)
      setConditions(conditions => ({
        ...conditions,
        face: false,
      }))
    } else {
      clearNotification(NOTIFICATION_NO_FACE_DETECTED)
      pause(false)
      setConditions(conditions => ({
        ...conditions,
        face: true,
      }))
    }
  }

  const onFaceSizeStatusChange = (faceSizeState: boolean) => {
    if (processing && !faceSizeState) {
      addNotification(NOTIFICATION_FACE_SIZE_WARNING, true)
      pause(true)
      setConditions(conditions => ({
        ...conditions,
        faceSize: false,
      }))
    } else {
      clearNotification(NOTIFICATION_FACE_SIZE_WARNING)
      pause(false)
      setConditions(conditions => ({
        ...conditions,
        faceSize: true,
      }))
    }
  }

  const onInterferenceWarningCb = () => {
    stopHandler()
    history.push('/capture/bad-conditions', ERROR_INTERFERENCE)
  }

  // Facemesh init
  const {
    cameraInstance,
    faceDetected,
    faceSizeStatus,
  } = useFaceMesh({
    videoElement,
    canvasElement,
    processing: processingFaceMesh,
    permissionsOk,
    onFaceDetectionChange,
    onFaceSizeStatusChange,
  })

  // Rppg init
  const {
    rppgData,
    ready,
    error,
    rppgInstance,
    isAllDataCalculated,
    imageQualityFlags,
    progressType,
    processing,
    progress,
    fps,
    start,
    stop,
    pause,
    closeCamera,
  } = useRPPG({
    conditionsOk,
    permissionsOk,
    videoElement,
    onUnsupportedLightConditionsCb,
    onUnsupportedDeviceCb,
    onAllDataCalculatedCb: onCalculationEndedCb,
    onCalculationEndedCb,
    onInterferenceWarningCb,
    onFaceOrientWarningCb,
    // onFaceSizeWarningCb,
  })

  useEffect(() => {
    if (!rppgInstance || !rppgInstance.rppgCamera || !ready || error) {
      return
    }
    const { width, height } = rppgInstance.rppgCamera
    setSize({ width, height })
  }, [ready, rppgInstance, error])

  useEffect(() => {
    setProcessingFaceMesh(processing)
  }, [processing])

  useEffect(() => {
    if (!error) {
      return
    }
    if (error.message === ERROR_CAMERA_INITIALISATION) {
      history.push('/capture/permissions')
    } else {
      history.push('/capture/bad-conditions', error.message)
    }
  }, [error, history])

  useEffect(() => {
    const timeout = 500
    if (!ready && !error) {
      setShowLoadingScreen(true)
    } else {
      setTimeout(() => {
        setShowLoadingScreen(false)
        // start automatically
        permissionsOk && !processing && !finished && start()
      }, timeout)
    }
  }, [permissionsOk, ready, error, processing, start, finished])

  useEffect(() => {
    const light = checkNumberOfTrueFlags([
      imageQualityFlags.brightColorFlag,
      imageQualityFlags.illumChangeFlag,
      imageQualityFlags.noiseFlag,
      imageQualityFlags.sharpFlag,
    ], 3)
    setConditions(conditions => ({
      ...conditions,
      light,
      faceOrient: imageQualityFlags.faceOrientFlag,
    }))
  }, [imageQualityFlags])

  useEffect(() =>
    setConditionsOk(Object.values(conditions).every(Boolean))
  , [conditions])

  const stopHandler = () => {
    clearAllNotifications()
    closeCamera()
    cameraInstance?.stop()
    setFinished(true)
    stop()
  }

  const checkAndAlertForCameraPermission = useCallback(async () => {
    // skip camera permission check for webview on android devices
    if (!navigator?.permissions?.query) {
      setPermissionsOk(true)
      return
    }
    const result = await navigator.permissions.query({
      name: 'camera' as PermissionName,
    })
    if (result.state === 'denied') {
      history.push('/capture/permissions')
    } else {
      setPermissionsOk(true)
    }
  }, [history])

  useEffect(() => {
    checkAndAlertForCameraPermission()
  }, [checkAndAlertForCameraPermission])

  return (
    <div className="measurement-container">

      {loading ?
        <Loader label='just a moment...' /> :

        <div className="measurement-wrapper">
          {
            message &&
            <Notification message={message} />
          }

          <div className="video-container">
            <video
              ref={videoElement}
              autoPlay
              playsInline
              muted
              className={classNames({
                video: true,
                horizontal: size.width > size.height,
                vertical: size.width <= size.height,
                'invert-video': useFrontCamera,
              })}>
            </video>
            <canvas
              ref={canvasElement}
              className={classNames({
                canvas: true,
                horizontal: size.width > size.height,
                vertical: size.width <= size.height,
                'invert-video': useFrontCamera,
              })}
            ></canvas>
            <FaceMask error={!conditionsOk} />
          </div>

          <div className="info-block-wrapper">
            {/* {
              processing &&
              progressType !== ProgressType.CHECKING &&
              <ImageQuality imageQualityFlags={imageQualityFlags} />
            } */}

            {
              processing &&
              progress !== 0 &&
              progressType !== ProgressType.CHECKING &&
              progressType !== ProgressType.CALIBRATING &&
              <Progress progress={progress} />
            }

            <TextMessage progressType={progressType} />

            {
              processing &&
              (progressType === ProgressType.CHECKING ||
              progressType === ProgressType.CALIBRATING) ?
                <CheckFps /> :
                <Info rppgData={rppgData} />
            }
          </div>

          {/* <div className="controls-wrapper">
            {
              processing &&
              progress !== 0 &&
              progressType !== ProgressType.CHECKING &&
              progressType !== ProgressType.CALIBRATING &&
              <Progress progress={progress} />
            }
          </div> */}
        </div>
      }

      {
        showLoadingScreen &&
        <LoadingScreen ready={ready} />
      }

      {
        debug &&
        <Debugger
          imageQualityFlags={imageQualityFlags}
          fps={fps}
          faceDetected={faceDetected}
          faceSizeStatus={faceSizeStatus}
          processing={processing}
          loading={loading}
          ready={ready}
          progressType={progressType}
          finished={finished}
          conditions={conditions}
          conditionsOk={conditionsOk}
        />
      }
    </div>
  )
}

export default Capture
