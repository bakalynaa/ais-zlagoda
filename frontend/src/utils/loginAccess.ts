const LOGIN_ALLOWED_KEY = 'zlagoda_login_allowed';

export function allowLoginAccess(): void {
  sessionStorage.setItem(LOGIN_ALLOWED_KEY, '1');
}

export function clearLoginAccess(): void {
  sessionStorage.removeItem(LOGIN_ALLOWED_KEY);
}

export function hasLoginAccess(): boolean {
  return sessionStorage.getItem(LOGIN_ALLOWED_KEY) === '1';
}

export function registerLoginReloadReset(): () => void {
  const onPageHide = () => clearLoginAccess();

  window.addEventListener('pagehide', onPageHide);
  return () => window.removeEventListener('pagehide', onPageHide);
}
