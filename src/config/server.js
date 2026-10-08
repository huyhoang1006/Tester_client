export const DEFAULT_LOGIN_DOMAIN = 'https://iedserver.english.io.vn'
export const DEFAULT_SERVICE_DOMAIN = 'http://103.163.118.212:30830'

export const getLoginDomain = () => (
    localStorage.getItem('LOGIN_ADDR') || DEFAULT_LOGIN_DOMAIN
)

export const getServiceDomain = () => (
    localStorage.getItem('SERVICE_ADDR') || DEFAULT_SERVICE_DOMAIN
)
