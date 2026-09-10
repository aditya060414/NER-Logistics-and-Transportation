/**
 * Multilingual Translations for Field Officer Interface
 * Supports English (en), Assamese / অসমীয়া (as), and Hindi / हिन्दी (hi)
 */

import type { SupportedLanguage } from '../types/fieldOfficer';

export interface TranslationDictionary {
  fieldOfficer: string;
  online: string;
  offline: string;
  offlineMode: string;
  gpsActive: string;
  gpsLost: string;
  demoGps: string;
  lastSync: string;
  pendingSync: string;
  allSynced: string;
  syncNow: string;
  syncFailed: string;
  retry: string;
  activeAssignment: string;
  cargo: string;
  priority: string;
  from: string;
  to: string;
  status: string;
  viewRoute: string;
  quickActions: string;
  reportIncident: string;
  myRoute: string;
  myTask: string;
  emergency: string;
  recommendedRoute: string;
  startJourney: string;
  inTransit: string;
  roadClosed: string;
  roadClosedAhead: string;
  highRisk: string;
  highRiskAhead: string;
  mediumRisk: string;
  lowRisk: string;
  offRoute: string;
  offRouteMsg: string;
  recalculateRoute: string;
  routeUpdated: string;
  routeUpdatedMsg: string;
  acceptNewRoute: string;
  noSafeRoute: string;
  noSafeRouteMsg: string;
  holdAtSafeLocation: string;
  contactControlRoom: string;
  incidentNearby: string;
  bridgeAhead: string;
  bridgeClosed: string;
  submitReport: string;
  takePhoto: string;
  useCurrentGps: string;
  home: string;
  route: string;
  report: string;
  alerts: string;
  more: string;
  delivery: string;
  incidents: string;
  settings: string;
  radioReport: string;
  language: string;
  demoMode: string;
  holdLocation: string;
  driver: string;
  consignment: string;
  newConsignment: string;
  enterConsignment: string;
  cargoType: string;
  selectPriority: string;
  pickup: string;
  destination: string;
  calculateSafeRoute: string;
  startTrip: string;
  arriveAtDestination: string;
  completeDelivery: string;
  reportHazard: string;
  rerouteAlert: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    fieldOfficer: 'FIELD OFFICER',
    online: 'ONLINE',
    offline: 'OFFLINE',
    offlineMode: 'OFFLINE MODE',
    gpsActive: 'GPS ACTIVE',
    gpsLost: 'GPS SIGNAL LOST',
    demoGps: 'DEMO GPS',
    lastSync: 'Last Sync',
    pendingSync: 'Reports Pending Sync',
    allSynced: 'All Reports Synced',
    syncNow: 'SYNC NOW',
    syncFailed: 'Sync Failed',
    retry: 'RETRY',
    activeAssignment: 'ACTIVE ASSIGNMENT',
    cargo: 'Cargo',
    priority: 'Priority',
    from: 'From',
    to: 'To',
    status: 'Current Status',
    viewRoute: 'VIEW ROUTE',
    quickActions: 'QUICK ACTIONS',
    reportIncident: 'REPORT INCIDENT',
    myRoute: 'MY ROUTE',
    myTask: 'MY TASK',
    emergency: 'EMERGENCY',
    recommendedRoute: 'RECOMMENDED ROUTE',
    startJourney: 'START JOURNEY',
    inTransit: 'IN TRANSIT',
    roadClosed: 'ROAD CLOSED',
    roadClosedAhead: 'ROAD CLOSED AHEAD',
    highRisk: 'HIGH RISK',
    highRiskAhead: 'HIGH-RISK ROAD AHEAD',
    mediumRisk: 'MEDIUM RISK',
    lowRisk: 'LOW RISK',
    offRoute: 'OFF ROUTE',
    offRouteMsg: 'You appear to have left the recommended corridor.',
    recalculateRoute: 'RECALCULATE ROUTE',
    routeUpdated: 'ROUTE UPDATED',
    routeUpdatedMsg: 'Your current route is no longer available due to road closure.',
    acceptNewRoute: 'ACCEPT NEW ROUTE',
    noSafeRoute: 'NO SAFE ROUTE AVAILABLE',
    noSafeRouteMsg: 'All practical corridors contain critical restrictions.',
    holdAtSafeLocation: 'HOLD AT SAFE LOCATION',
    contactControlRoom: 'CONTACT CONTROL ROOM',
    incidentNearby: 'INCIDENT AHEAD',
    bridgeAhead: 'BRIDGE AHEAD',
    bridgeClosed: 'BRIDGE CLOSED',
    submitReport: 'SUBMIT REPORT',
    takePhoto: 'ATTACH PHOTO',
    useCurrentGps: 'USE CURRENT GPS',
    home: 'Home',
    route: 'Route',
    report: 'Report',
    alerts: 'Alerts',
    more: 'More',
    delivery: 'Delivery',
    incidents: 'Incidents',
    settings: 'Settings',
    radioReport: 'RADIO REPORT',
    language: 'Language',
    demoMode: 'DEMO MODE',
    holdLocation: 'Safe Holding Location',
    driver: 'DRIVER',
    consignment: 'Consignment',
    newConsignment: 'New Consignment',
    enterConsignment: 'Enter Consignment',
    cargoType: 'Cargo Type',
    selectPriority: 'Select Priority',
    pickup: 'Pickup Location',
    destination: 'Destination',
    calculateSafeRoute: 'Calculate Safe Route',
    startTrip: 'Start Journey',
    arriveAtDestination: 'Mark Arrived',
    completeDelivery: 'Complete Delivery',
    reportHazard: 'Report Road Hazard',
    rerouteAlert: 'Reroute Recommended',
  },
  as: {
    fieldOfficer: 'ফিল্ড বিষয়া',
    online: 'অনলাইন (সক্ৰিয়)',
    offline: 'অফলাইন (বিচ্ছিন্ন)',
    offlineMode: 'অফলাইন ম’ড',
    gpsActive: 'জিপিএছ সক্ৰিয়',
    gpsLost: 'জিপিএছ সংকেত পোৱা নাই',
    demoGps: 'ডেমো জিপিএছ',
    lastSync: 'অন্তিম চিন্ক',
    pendingSync: 'প্ৰতিবেদন চিন্ক বাকী আছে',
    allSynced: 'সকলো প্ৰতিবেদন সংলগ্ন হ’ল',
    syncNow: 'এতিয়াই চিন্ক কৰক',
    syncFailed: 'চিন্ক ব্যৰ্থ হ’ল',
    retry: 'পুনৰ চেষ্টা কৰক',
    activeAssignment: 'সক্ৰিয় দায়িত্ব',
    cargo: 'পণ্য',
    priority: 'প্ৰাথমিকতা',
    from: 'প্ৰস্থান স্থান',
    to: 'গন্তব্য স্থান',
    status: 'বৰ্তমান অৱস্থা',
    viewRoute: 'পথ চাওক',
    quickActions: 'দ্ৰুত কাৰ্য্যসূচী',
    reportIncident: 'ঘটনা প্ৰতিবেদন দিয়ক',
    myRoute: 'মোৰ পথ',
    myTask: 'মোৰ দায়িত্ব',
    emergency: 'জৰুৰীকালীন SOS',
    recommendedRoute: 'পৰামৰ্শিত নিৰাপদ পথ',
    startJourney: 'যাত্ৰা আৰম্ভ কৰক',
    inTransit: 'যাত্ৰাৰত',
    roadClosed: 'পথ বন্ধ',
    roadClosedAhead: 'আগত পথ বন্ধ আছে',
    highRisk: 'অত্যাধিক বিপদাশংকা',
    highRiskAhead: 'আগত সংকটপূৰ্ণ পথ',
    mediumRisk: 'মধ্যম বিপদাশংকা',
    lowRisk: 'কম বিপদাশংকা',
    offRoute: 'নিৰ্ধাৰিত পথৰ বাহিৰত',
    offRouteMsg: 'আপুনি নিৰ্দেশিত পথৰ পৰা বাহিৰলৈ গৈছে।',
    recalculateRoute: 'পথ পুনৰ নিৰ্ধাৰণ কৰক',
    routeUpdated: 'পথ আপডেট কৰা হ’ল',
    routeUpdatedMsg: 'পথ বন্ধ হোৱাৰ বাবে নতুন নিৰাপদ পথ নিৰ্ধাৰণ কৰা হৈছে।',
    acceptNewRoute: 'নতুন পথ গ্ৰহণ কৰক',
    noSafeRoute: 'কোনো নিৰাপদ পথ উপলব্ধ নাই',
    noSafeRouteMsg: 'সকলোবোৰ পথতে অতি সংকটপূৰ্ণ বাধা বা বন্ধ আছে।',
    holdAtSafeLocation: 'নিৰাপদ স্থানত অপেক্ষা কৰক',
    contactControlRoom: 'নিয়ন্ত্ৰণ কক্ষৰ সৈতে যোগাযোগ কৰক',
    incidentNearby: 'আগত দুৰ্ঘটনা বা স্খলন',
    bridgeAhead: 'আগত দলং আছে',
    bridgeClosed: 'দলং বন্ধ আছে',
    submitReport: 'প্ৰতিবেদন দাখিল কৰক',
    takePhoto: 'ফটো সংলগ্ন কৰক',
    useCurrentGps: 'বৰ্তমান জিপিএছ লওক',
    home: 'গৃহ',
    route: 'পথ',
    report: 'প্ৰতিবেদন',
    alerts: 'সতৰ্কতা',
    more: 'অধিক',
    delivery: 'পণ্য যোগান',
    incidents: 'ঘটনাসমূহ',
    settings: 'ছেটিংছ',
    radioReport: 'ৰেডিঅ’ প্ৰতিবেদন',
    language: 'ভাষা',
    demoMode: 'প্ৰদৰ্শন ম’ড',
    holdLocation: 'নিৰাপদ আশ্ৰয় স্থান',
    driver: 'চালক',
    consignment: 'চালান / মালবস্তু',
    newConsignment: 'নতুন চালান',
    enterConsignment: 'চালান প্রবিষ্ট কৰক',
    cargoType: 'সামগ্ৰীৰ প্ৰকাৰ',
    selectPriority: 'প্ৰাথমিকতা বাছক',
    pickup: 'তুলি লোৱা স্থান (পিকআপ)',
    destination: 'গন্তব্যস্থান',
    calculateSafeRoute: 'নিৰাপদ পথ গণনা কৰক',
    startTrip: 'যাত্ৰা আৰম্ভ কৰক',
    arriveAtDestination: 'উপস্থিত চিহ্নিত কৰক',
    completeDelivery: 'ডেলিভাৰী সম্পন্ন কৰক',
    reportHazard: 'বিপদ ৰিপোৰ্ট কৰক',
    rerouteAlert: 'নতুন নিৰাপদ পথৰ পৰামৰ্শ',
  },
  hi: {
    fieldOfficer: 'फील्ड ऑफिसर',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    offlineMode: 'ऑफलाइन मोड',
    gpsActive: 'जीपीएस सक्रिय',
    gpsLost: 'जीपीएस सिग्नल गायब',
    demoGps: 'डेमो जीपीएस',
    lastSync: 'अंतिम सिंक',
    pendingSync: 'लंबित सिंक रिपोर्ट्स',
    allSynced: 'सभी रिपोर्ट्स सिंक हो चुकी हैं',
    syncNow: 'अभी सिंक करें',
    syncFailed: 'सिंक विफल',
    retry: 'पुनः प्रयास करें',
    activeAssignment: 'सक्रिय असाइनमेंट',
    cargo: 'सामग्री',
    priority: 'प्राथमिकता',
    from: 'प्रस्थान',
    to: 'गंतव्य',
    status: 'वर्तमान स्थिति',
    viewRoute: 'मार्ग देखें',
    quickActions: 'त्वरित कार्रवाई',
    reportIncident: 'घटना रिपोर्ट करें',
    myRoute: 'मेरा मार्ग',
    myTask: 'मेरा कार्य',
    emergency: 'आपातकालीन SOS',
    recommendedRoute: 'अनुशंसित सुरक्षित मार्ग',
    startJourney: 'यात्रा शुरू करें',
    inTransit: 'पारगमन में (रास्ते में)',
    roadClosed: 'सड़क बंद',
    roadClosedAhead: 'आगे सड़क बंद है',
    highRisk: 'उच्च जोखिम',
    highRiskAhead: 'आगे उच्च जोखिम वाला मार्ग',
    mediumRisk: 'मध्यम जोखिम',
    lowRisk: 'कम जोखिम',
    offRoute: 'मार्ग से भटके',
    offRouteMsg: 'आप अनुशंसित मार्ग से बाहर निकल गए हैं।',
    recalculateRoute: 'मार्ग पुनः गणना करें',
    routeUpdated: 'मार्ग अपडेट किया गया',
    routeUpdatedMsg: 'सड़क बंद होने के कारण नया सुरक्षित मार्ग आबंटित किया गया है।',
    acceptNewRoute: 'नया मार्ग स्वीकारें',
    noSafeRoute: 'कोई सुरक्षित मार्ग उपलब्ध नहीं',
    noSafeRouteMsg: 'सभी उपलब्ध गलियारों में गंभीर रुकावटें या भूस्खलन है।',
    holdAtSafeLocation: 'सुरक्षित स्थान पर रुकें',
    contactControlRoom: 'कंट्रोल रूम से संपर्क करें',
    incidentNearby: 'आगे रुकावट / भूस्खलन',
    bridgeAhead: 'आगे पुल है',
    bridgeClosed: 'पुल बंद है',
    submitReport: 'रिपोर्ट सबमिट करें',
    takePhoto: 'फोटो लगाएं',
    useCurrentGps: 'वर्तमान जीपीएस लें',
    home: 'होम',
    route: 'मार्ग',
    report: 'रिपोर्ट',
    alerts: 'अलर्ट',
    more: 'अधिक',
    delivery: 'डिलीवरी',
    incidents: 'घटनाएं',
    settings: 'सेटिंग्स',
    radioReport: 'रेडियो रिपोर्ट',
    language: 'भाषा',
    demoMode: 'डेमो मोड',
    holdLocation: 'सुरक्षित शरण स्थान',
    driver: 'ड्राइवर',
    consignment: 'कंसाइनमेंट / चालान',
    newConsignment: 'नया कंसाइनमेंट',
    enterConsignment: 'कंसाइनमेंट दर्ज करें',
    cargoType: 'सामग्री प्रकार',
    selectPriority: 'प्राथमिकता चुनें',
    pickup: 'पिकअप स्थान',
    destination: 'गंतव्य स्थान',
    calculateSafeRoute: 'सुरक्षित मार्ग खोजें',
    startTrip: 'यात्रा शुरू करें',
    arriveAtDestination: 'पहुंच गए दर्ज करें',
    completeDelivery: 'डिलीवरी पूर्ण करें',
    reportHazard: 'सड़क बाधा रिपोर्ट करें',
    rerouteAlert: 'नया सुरक्षित मार्ग उपलब्ध',
  }
};

export function getTranslation(lang: SupportedLanguage): TranslationDictionary {
  return translations[lang] || translations.en;
}
