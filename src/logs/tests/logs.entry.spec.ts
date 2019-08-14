import { monitor } from '../../core/internalMonitoring'
import { cleanupActivityTracking } from '../../core/session'

describe('logs entry', () => {
  beforeEach(() => {
    require('../logs.entry')
    delete (require.cache as any)[require.resolve('../logs.entry')]
  })

  afterEach(() => {
    cleanupActivityTracking()
  })

  it('should set global with init', () => {
    expect(!!window.DD_LOGS).toEqual(true)
    expect(!!window.DD_LOGS.init).toEqual(true)
  })

  it('init should log an error with no public api key', () => {
    const errorSpy = spyOn(console, 'error')

    window.DD_LOGS.init(undefined as any)
    expect(console.error).toHaveBeenCalledTimes(1)

    window.DD_LOGS.init({ stillNoApiKey: true } as any)
    expect(console.error).toHaveBeenCalledTimes(2)

    window.DD_LOGS.init({ clientToken: 'yeah' })
    expect(errorSpy).toHaveBeenCalledTimes(2)
  })

  // it('should warn if now deprecated publicApiKey is used', () => {
  //   spyOn(console, 'warn')

  //   window.DD_LOGS.init({ publicApiKey: 'yo' } as any)
  //   expect(console.warn).toHaveBeenCalledTimes(1)
  // })

  it('should add a `_setDebug` that works', () => {
    const setDebug: (debug: boolean) => void = (window.DD_LOGS as any)._setDebug as any
    expect(!!setDebug).toEqual(true)

    spyOn(console, 'warn')
    monitor(() => {
      throw new Error()
    })()
    expect(console.warn).toHaveBeenCalledTimes(0)

    setDebug(true)
    monitor(() => {
      throw new Error()
    })()
    expect(console.warn).toHaveBeenCalledTimes(1)

    setDebug(false)
  })

  it('should always keep the same global reference', () => {
    const global = window.DD_LOGS

    global.init({ clientToken: 'yeah' })

    expect(window.DD_LOGS).toEqual(global)
  })
})
