import {
  useCallback,
  useEffect,
  useState,
  RefObject,
  useRef,
} from 'react'

import {
  drawConnectors,
} from '@mediapipe/drawing_utils'

import {
  FaceMesh,
  Results,
} from '@mediapipe/face_mesh'

import {
  Camera,
} from '@mediapipe/camera_utils'

import {
  faceBottomPointNumber,
  faceMeshBaseUrl,
  faceMeshLandmarkList,
  faceMeshLandmarkOptions,
  faceMeshOptions,
  getFaceSizeThreshold,
  faceTopPointNumber,
} from 'helpers/facemesh'

export interface UseFaceMesh {
  videoElement: RefObject<HTMLVideoElement>
  canvasElement: RefObject<HTMLCanvasElement>
  processing: boolean
  permissionsOk: boolean
  onFaceDetectionChange?: (faceDetected: boolean) => void
  onFaceSizeStatusChange?: (faceSizeStatus: boolean) => void
}

export interface UseFaceMeshResult {
  faceMeshReady: boolean
  faceDetected: boolean
  faceSizeStatus: boolean
  faceMeshInstance: FaceMesh | void | number
  cameraInstance: Camera | void
}

function useFaceMesh({
  videoElement,
  canvasElement,
  processing,
  permissionsOk,
  onFaceDetectionChange,
  onFaceSizeStatusChange,
}: UseFaceMesh): UseFaceMeshResult {
  const [ready, setReady] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceSizeStatus, setFaceSizeStatus] = useState(false)
  const [faceMeshInstance, setFaceMeshInstance] = useState<FaceMesh | void>(undefined)
  const [cameraInstance, setCameraInstance] = useState<Camera | void>(undefined)
  const fmProcessing = useRef(false)

  const faceMeshOnResults = useCallback((results: Results) => {
    setFaceDetected(!!results.multiFaceLandmarks.length)

    if (results.multiFaceLandmarks.length) {
      const topPoint = results.multiFaceLandmarks[0][faceTopPointNumber]
      const bottomPoint = results.multiFaceLandmarks[0][faceBottomPointNumber]
      const result = topPoint && bottomPoint && bottomPoint.y - topPoint.y >= getFaceSizeThreshold()
      setFaceSizeStatus(result)
    } else {
      setFaceSizeStatus(false)
    }

    const canvasElementCtx = canvasElement.current?.getContext('2d')

    if (!canvasElement.current || !videoElement.current || !canvasElementCtx) {
      return
    }

    canvasElement.current.width = videoElement.current.videoWidth
    canvasElement.current.height = videoElement.current.videoHeight

    canvasElementCtx.save()
    canvasElementCtx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height)

    if (results.multiFaceLandmarks && fmProcessing.current) {
      for (const landmarks of results.multiFaceLandmarks) {
        faceMeshLandmarkList.forEach(item =>
          drawConnectors(canvasElementCtx, landmarks, item, faceMeshLandmarkOptions))
      }
    }

    canvasElementCtx.restore()
  }, [canvasElement, videoElement, fmProcessing])

  useEffect(() => {
    const faceMeshInit = () => {
      if(!videoElement.current || faceMeshInstance) {
        return
      }

      const faceMesh = new FaceMesh({
        locateFile: (file) => faceMeshBaseUrl + file,
      })

      faceMesh.setOptions(faceMeshOptions)
      faceMesh.onResults(faceMeshOnResults)
      setFaceMeshInstance(faceMesh)
      // await faceMesh.initialize()
      setReady(true)

      const camera = new Camera(videoElement.current, {
        onFrame: async () => {
          if (!videoElement.current) {
            return
          }
          await faceMesh.send({ image: videoElement.current })
        },
      })
      setCameraInstance(camera)
      camera.start()
    }

    permissionsOk && faceMeshInit()

  }, [permissionsOk, videoElement, faceMeshOnResults, faceMeshInstance])

  // callback events
  const onFaceDetectionChangeRef = useRef<((faceDetected: boolean) => void) | undefined>()
  const onFaceSizeStatusChangeRef = useRef<((faceSizeStatus: boolean) => void) | undefined>()

  useEffect(() => {
    onFaceDetectionChangeRef.current = onFaceDetectionChange
  }, [onFaceDetectionChange])

  useEffect(() => {
    onFaceSizeStatusChangeRef.current = onFaceSizeStatusChange
  }, [onFaceSizeStatusChange])

  useEffect(() => {
    if (processing && typeof onFaceDetectionChangeRef.current === 'function') {
      onFaceDetectionChangeRef.current(faceDetected)
    }
    fmProcessing.current = processing
  }, [faceDetected, processing])

  useEffect(() => {
    if (processing && typeof onFaceSizeStatusChangeRef.current === 'function') {
      onFaceSizeStatusChangeRef.current(faceSizeStatus)
    }
    fmProcessing.current = processing
  }, [faceSizeStatus, processing])

  return {
    faceMeshReady: ready,
    faceDetected,
    faceSizeStatus,
    faceMeshInstance,
    cameraInstance,
  }
}

export default useFaceMesh
