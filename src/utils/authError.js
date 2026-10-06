const AUTH_EXPIRED_FLAG = '__authExpired'

export const markAuthExpiredError = (error, fallbackMessage = 'Session expired. Please sign in again.') => {
    const authError = error instanceof Error ? error : new Error(fallbackMessage)
    authError[AUTH_EXPIRED_FLAG] = true
    return authError
}

export const isAuthExpiredError = error => Boolean(
    error && (
        error[AUTH_EXPIRED_FLAG]
        || error.response?.status === 401
        || Number(error.response?.data?.code) === 10
        || Number(error.code) === 10
    )
)
