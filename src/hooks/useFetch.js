import { useCallback, useEffect, useReducer, useRef } from 'react'
import client from '../api'

// Data hook for pages that read a single resource. Handles the loading flag,
// errors, cancellation when the path changes, and a manual refresh.

const initialState = {
  data: null,
  error: null,
  loading: true,
  loadedAt: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, loading: true, error: null }
    case 'success':
      return { data: action.data, error: null, loading: false, loadedAt: Date.now() }
    case 'failure':
      return { ...state, error: action.error, loading: false }
    case 'patch':
      return { ...state, data: action.data }
    default:
      return state
  }
}

export default function useFetch(path, { enabled = true, transform } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const requestId = useRef(0)

  const run = useCallback(async () => {
    if (!enabled || !path) return
    const id = ++requestId.current
    dispatch({ type: 'start' })
    try {
      const result = await client.get(path)
      if (id !== requestId.current) return
      dispatch({ type: 'success', data: transform ? transform(result) : result })
    } catch (error) {
      if (id !== requestId.current) return
      dispatch({ type: 'failure', error })
    }
  }, [path, enabled, transform])

  useEffect(() => {
    run()
    return () => {
      requestId.current += 1
    }
  }, [run])

  const setData = useCallback((updater) => {
    dispatch({
      type: 'patch',
      data: typeof updater === 'function' ? updater(state.data) : updater,
    })
  }, [state.data])

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    loadedAt: state.loadedAt,
    refresh: run,
    setData,
  }
}

export function useList(path, options) {
  const result = useFetch(path, options)

  const replace = useCallback(
    (item, key = 'id') => {
      result.setData((rows) => (rows || []).map((row) => (row[key] === item[key] ? item : row)))
    },
    [result.setData]
  )

  const remove = useCallback(
    (id, key = 'id') => {
      result.setData((rows) => (rows || []).filter((row) => row[key] !== id))
    },
    [result.setData]
  )

  return { ...result, rows: result.data || [], replace, remove }
}

// Polls the resource on an interval while the tab is visible. Pauses when
// the page is hidden so background tabs do not keep hitting the API.
export function usePolledFetch(path, intervalMs, options) {
  const result = useFetch(path, options)
  const { refresh } = result

  useEffect(() => {
    if (!intervalMs) return undefined
    let timer = null

    function start() {
      stop()
      timer = setInterval(refresh, intervalMs)
    }

    function stop() {
      if (timer) clearInterval(timer)
      timer = null
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        refresh()
        start()
      } else {
        stop()
      }
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refresh, intervalMs])

  return result
}
