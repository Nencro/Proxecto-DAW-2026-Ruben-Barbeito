export interface AppRuntimeConfig {
  apiBaseUrl: string;
  restCountriesUrl: string;
}

declare global {
  interface Window {
    __EXPLORAMAS_ENV__?: Partial<AppRuntimeConfig>;
  }
}

export const APP_RUNTIME_CONFIG: AppRuntimeConfig = {
  apiBaseUrl: window.__EXPLORAMAS_ENV__?.apiBaseUrl || '',
  restCountriesUrl: window.__EXPLORAMAS_ENV__?.restCountriesUrl || ''
};
