import mobileAds, { MaxAdContentRating, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

// Use IDs de TESTE em dev. Substitua por IDs reais só na publicação.
export const BANNER_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx';
export const INTERSTITIAL_ID = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx';

export async function initAds() {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.T,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    testDeviceIdentifiers: ['EMULATOR'],
  });
  return mobileAds().initialize();
}

export function createInterstitial(onClosed) {
  const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  let loaded = false;

  const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });

  const unsubscribeClose = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    onClosed?.();
    interstitial.load(); // Pré-carrega para o próximo uso
  });

  interstitial.load();

  return {
    show: () => { if (loaded) interstitial.show(); },
    dispose: () => { unsubscribe(); unsubscribeClose(); },
  };
}