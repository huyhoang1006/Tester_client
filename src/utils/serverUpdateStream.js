import { getStoredAccessToken, SSO_TOKEN_HEADER } from '@/utils/sso'

export const streamServerUpdates = async (url, signal, onChanged) => {
    const token = getStoredAccessToken()
    if (!token) throw new Error('Not signed in')
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            [SSO_TOKEN_HEADER]: token,
            Accept: 'text/event-stream',
            'X-Requested-With': 'XMLHttpRequest'
        },
        cache: 'no-store',
        signal
    })
    if (!response.ok || !response.body) throw new Error(`Update stream unavailable (${response.status})`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (!signal.aborted) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
        let boundary = buffer.indexOf('\n\n')
        while (boundary >= 0) {
            const event = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            if (event.split('\n').some(line => line.trim() === 'event: changed')) onChanged()
            boundary = buffer.indexOf('\n\n')
        }
    }
}
