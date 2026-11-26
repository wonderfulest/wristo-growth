const recoveryKey = 'growth-sso-recovery'
let isRedirectingToSso = false

export function clearLocalAuthState() {
  localStorage.removeItem('wristo-user')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}

export function getSsoRedirectUri() {
  const configuredRedirectUri = import.meta.env.VITE_WRISTO_SSO_REDIRECT_URI
  if (configuredRedirectUri) {
    return configuredRedirectUri
  }
  return new URL('/auth/callback', window.location.origin).toString()
}

function getSsoLoginBaseUrl() {
  const configuredLoginUrl = import.meta.env.VITE_WRISTO_SSO_LOGIN_URL
  if (configuredLoginUrl && !configuredLoginUrl.startsWith('/')) {
    return configuredLoginUrl
  }
  if (window.location.hostname.endsWith('wristo.io')) {
    return 'https://sso.wristo.io/login'
  }
  return configuredLoginUrl || '/login'
}

export function buildSsoLoginUrl(client: string, forceLogin = false) {
  const loginUrl = new URL(getSsoLoginBaseUrl(), window.location.origin)
  loginUrl.searchParams.set('client', client)
  loginUrl.searchParams.set('redirect_uri', getSsoRedirectUri())
  if (forceLogin) loginUrl.searchParams.set('force_login', '1')
  return loginUrl.toString()
}

export function redirectToSsoLogin(client: string, delay = 0, mode: 'initial' | 'retry' | 'manual' = 'initial') {
  if (isRedirectingToSso) {
    return
  }
  isRedirectingToSso = true

  clearLocalAuthState()

  if (mode === 'manual') {
    sessionStorage.removeItem(recoveryKey)
  } else if (sessionStorage.getItem(recoveryKey)) {
    window.location.replace('/auth/sign-in')
    return
  } else if (mode === 'retry') {
    sessionStorage.setItem(recoveryKey, '1')
  }

  window.setTimeout(() => {
    window.location.href = buildSsoLoginUrl(client, mode === 'manual')
  }, delay)
}
