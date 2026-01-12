/**
 * Accessibility Survey Form V2 - Comprehensive
 * Option B: All original fields with improved visual design
 * 
 * Features:
 * - Progress indicator
 * - Visual card selections instead of radio buttons
 * - Collapsible sections with completion indicators
 * - Better mobile layout
 * - Same data structure as original
 * - i18n support for English and Hebrew
 * 
 * Access Nature - Phase 2 Redesign
 * Created: December 2025
 */

import { toast } from '../utils/toast.js';
import { userService } from '../services/userService.js';

/**
 * Translations for accessibility form
 */
const formTranslations = {
  en: {
    // Header
    formTitle: "Comprehensive Trail Accessibility Survey",
    formSubtitle: "Help create detailed accessibility information for outdoor spaces",
    sectionsComplete: "of 7 sections complete",
    
    // Buttons
    cancel: "Cancel",
    saveSurvey: "Save Survey ✓",
    tapToExpand: "Tap to expand",
    required: "Required",
    filled: "filled",
    
    // Section titles
    basicInfo: "Basic Trail Information",
    mobilityAccess: "Mobility Accessibility",
    trailSurface: "Trail Surface & Quality",
    visualEnv: "Visual & Environmental",
    facilities: "Facilities & Amenities",
    signage: "Signage & Navigation",
    additionalInfo: "Additional Information",
    
    // Basic info fields
    trailName: "Trail Name",
    trailNamePlaceholder: "e.g., Riverside Nature Path",
    location: "Location/Address",
    locationPlaceholder: "e.g., Central Park, NYC",
    trailLength: "Trail Length (km)",
    estimatedDuration: "Estimated Duration",
    selectDuration: "Select duration",
    under15: "Under 15 minutes",
    mins15to30: "15-30 minutes",
    mins30to60: "30-60 minutes",
    hours1to2: "1-2 hours",
    over2hours: "Over 2 hours",
    
    // Wheelchair access
    wheelchairAccess: "Wheelchair Accessibility Level",
    fullyAccessible: "Fully Accessible",
    fullyAccessibleDesc: "Independent wheelchair use throughout",
    partiallyAccessible: "Partially Accessible",
    partiallyAccessibleDesc: "Some sections require assistance",
    limitedAccess: "Limited Access",
    limitedAccessDesc: "Major barriers, alternative routes exist",
    notAccessible: "Not Accessible",
    notAccessibleDesc: "Not suitable for wheelchair users",
    
    // Surface
    surfaceTypes: "Trail Surface Types (select all that apply)",
    asphalt: "Asphalt",
    concrete: "Concrete",
    gravel: "Gravel",
    dirt: "Dirt/Earth",
    grass: "Grass",
    sand: "Sand",
    woodDeck: "Wood Deck",
    boardwalk: "Boardwalk",
    
    // Surface quality
    surfaceQuality: "Overall Surface Quality",
    smooth: "Smooth",
    smoothDesc: "Even, well-maintained",
    fairQuality: "Fair",
    fairQualityDesc: "Minor imperfections",
    roughQuality: "Rough",
    roughQualityDesc: "Significant unevenness",
    poorQuality: "Poor",
    poorQualityDesc: "Major obstacles",
    
    // Width
    pathWidth: "Typical Path Width",
    wide: "Wide (2m+)",
    wideDesc: "Easy passing",
    standardWidth: "Standard (1-2m)",
    standardWidthDesc: "Single wheelchair",
    narrow: "Narrow (0.5-1m)",
    narrowDesc: "Tight fit",
    veryNarrow: "Very Narrow (<0.5m)",
    veryNarrowDesc: "Walking only",
    
    // Slope
    maxSlope: "Maximum Trail Slope",
    flat: "Flat (0-2%)",
    flatDesc: "No noticeable incline",
    gentleSlope: "Gentle (2-5%)",
    gentleSlopeDesc: "Slight incline",
    moderateSlope: "Moderate (5-8%)",
    moderateSlopeDesc: "Noticeable but manageable",
    steepSlope: "Steep (8-12%)",
    steepSlopeDesc: "May need assistance",
    verySteep: "Very Steep (>12%)",
    verySteepDesc: "Significant challenge",
    
    // Steps
    steps: "Steps or Curbs",
    noSteps: "None",
    noStepsDesc: "Completely step-free",
    fewSteps: "Few (1-3)",
    fewStepsDesc: "Minor obstacles",
    someSteps: "Some (4-10)",
    someStepsDesc: "Multiple obstacles",
    manySteps: "Many (>10)",
    manyStepsDesc: "Frequent obstacles",
    
    // Obstacles
    obstacles: "Obstacles on Trail",
    noObstacles: "None",
    fewObstacles: "Few",
    someObstacles: "Some",
    manyObstacles: "Many",
    
    // Handrails
    handrails: "Handrails Available",
    handrailsBoth: "Both sides",
    handrailsOne: "One side",
    handrailsNone: "None",
    handrailsNA: "Not needed",
    
    // Visual & Environmental
    lighting: "Trail Lighting",
    wellLit: "Well lit",
    partialLight: "Partial lighting",
    noLighting: "No lighting",
    daylightOnly: "Daylight only",
    
    shade: "Shade Coverage",
    fullShade: "Mostly shaded",
    partialShade: "Partial shade",
    noShade: "No shade/exposed",
    
    hazards: "Potential Hazards",
    hazardsPlaceholder: "e.g., uneven surfaces, low branches, water crossings...",
    
    // Facilities
    parking: "Accessible Parking",
    parkingYes: "Available",
    parkingNearby: "Nearby",
    parkingNo: "Not available",
    
    restrooms: "Accessible Restrooms",
    restroomsYes: "Available",
    restroomsNearby: "Nearby",
    restroomsNo: "Not available",
    
    benches: "Rest Areas/Benches",
    benchesYes: "Available",
    benchesFew: "Few",
    benchesNo: "None",
    
    water: "Water Fountains",
    waterYes: "Available",
    waterNo: "Not available",
    
    // Signage
    signageQuality: "Trail Signage Quality",
    signageExcellent: "Excellent",
    signageGood: "Good",
    signageFair: "Fair",
    signagePoor: "Poor/None",
    
    brailleSignage: "Braille Signage",
    brailleYes: "Available",
    brailleNo: "Not available",
    
    audioGuide: "Audio Guide/Description",
    audioYes: "Available",
    audioNo: "Not available",
    
    // Additional
    additionalNotes: "Additional Notes",
    additionalNotesPlaceholder: "Any other accessibility information, tips, or warnings...",
    bestTimeToVisit: "Best Time to Visit",
    bestTimePlaceholder: "e.g., Early morning for shade, avoid weekends...",
    emergencyInfo: "Emergency Information",
    emergencyPlaceholder: "Nearest hospital, emergency contact, etc.",
    
    // Trip types
    tripType: "Trip Type",
    beach: "Beach",
    stream: "Stream",
    park: "Park",
    forest: "Forest",
    urban: "Urban",
    scenic: "Scenic",
    
    // Route types
    routeType: "Route Type",
    circular: "Circular Loop",
    roundTrip: "Round Trip",
    
    // Mobility section
    disabledParking: "Disabled Parking",
    parkingAvailable: "Accessible parking available",
    parkingSpaces: "Number of accessible parking spaces:",
    withAssistance: "With Assistance",
    
    // Surface section  
    stone: "Stone",
    mixedSurfaces: "Mixed Surfaces",
    excellent: "Excellent",
    fair: "Fair",
    poor: "Poor",
    overgrown: "Overgrown",
    
    // Slopes
    trailSlopes: "Trail Slopes",
    flatMild: "Flat/Mild (<5%)",
    moderate: "Moderate (5-10%)",
    steep: "Steep (>10%)",
    
    // Visual section
    visualAdaptations: "Visual Impairment Adaptations (select all that apply)",
    raisedBorders: "Raised borders",
    tactileSurfaces: "Tactile surfaces",
    colorContrast: "Color contrast",
    shadeCoverage: "Shade Coverage on Trail",
    plentyShade: "Plenty of shade",
    intermittent: "Intermittent",
    trailLit: "💡 Trail is lit in darkness",
    
    // Facilities section
    accessibleFountains: "Accessible Water Fountains",
    none: "None",
    one: "One",
    multiple: "Multiple",
    accessibleSeating: "Accessible Seating (select all that apply)",
    noBenches: "No benches",
    oneBench: "One bench",
    multipleBenches: "Multiple benches",
    withoutHandrails: "Without handrails",
    accessiblePicnic: "🧺 Accessible picnic areas available",
    numberOfAreas: "Number of areas",
    inShade: "In shade",
    inSun: "In sun",
    accessibleViewpoint: "🏔️ Accessible viewpoint available",
    accessibleRestrooms: "Accessible Restrooms",
    unisex: "Unisex",
    separateMF: "Separate M/F",
    
    // Signage section
    availableSignage: "Available Signage (select all that apply)",
    routeMap: "🗺️ Route map",
    directionalSigns: "➡️ Directional signs",
    distanceMarkers: "📏 Distance markers",
    accessibilityInfo: "♿ Accessibility info",
    audioDescAvailable: "🔊 Audio description available",
    simpleLanguage: "📖 Simple language",
    highContrast: "🔤 High contrast",
    qrCodeAvailable: "📱 QR code with site information available",
    
    // Additional section
    surveyorName: "Surveyor Name (Optional)",
    yourName: "Your name",
    surveyDate: "Survey Date",
    overallSummary: "Overall Accessibility Summary",
    accessible: "Accessible",
    partial: "Partial"
  },
  he: {
    // Header
    formTitle: "סקר נגישות מקיף לשביל",
    formSubtitle: "עזור ליצור מידע נגישות מפורט לשטחים פתוחים",
    sectionsComplete: "מתוך 7 קטעים הושלמו",
    
    // Buttons
    cancel: "ביטול",
    saveSurvey: "שמור סקר ✓",
    tapToExpand: "הקש להרחבה",
    required: "חובה",
    filled: "מולאו",
    
    // Section titles
    basicInfo: "מידע בסיסי על השביל",
    mobilityAccess: "נגישות לניידות",
    trailSurface: "משטח ואיכות השביל",
    visualEnv: "סביבה חזותית",
    facilities: "מתקנים ושירותים",
    signage: "שילוט וניווט",
    additionalInfo: "מידע נוסף",
    
    // Basic info fields
    trailName: "שם השביל",
    trailNamePlaceholder: "לדוגמה: שביל הנחל",
    location: "מיקום/כתובת",
    locationPlaceholder: "לדוגמה: פארק הירקון, תל אביב",
    trailLength: "אורך השביל (ק״מ)",
    estimatedDuration: "משך משוער",
    selectDuration: "בחר משך",
    under15: "פחות מ-15 דקות",
    mins15to30: "15-30 דקות",
    mins30to60: "30-60 דקות",
    hours1to2: "1-2 שעות",
    over2hours: "מעל 2 שעות",
    
    // Wheelchair access
    wheelchairAccess: "רמת נגישות לכיסא גלגלים",
    fullyAccessible: "נגיש לחלוטין",
    fullyAccessibleDesc: "שימוש עצמאי בכיסא גלגלים לאורך כל הדרך",
    partiallyAccessible: "נגיש חלקית",
    partiallyAccessibleDesc: "חלק מהקטעים דורשים סיוע",
    limitedAccess: "גישה מוגבלת",
    limitedAccessDesc: "מכשולים משמעותיים, קיימים מסלולים חלופיים",
    notAccessible: "לא נגיש",
    notAccessibleDesc: "לא מתאים למשתמשי כיסא גלגלים",
    
    // Surface
    surfaceTypes: "סוגי משטח השביל (בחר את כל המתאימים)",
    asphalt: "אספלט",
    concrete: "בטון",
    gravel: "חצץ",
    dirt: "עפר/אדמה",
    grass: "דשא",
    sand: "חול",
    woodDeck: "דק עץ",
    boardwalk: "שביל עץ מוגבה",
    
    // Surface quality
    surfaceQuality: "איכות משטח כללית",
    smooth: "חלק",
    smoothDesc: "אחיד ומתוחזק",
    fairQuality: "סביר",
    fairQualityDesc: "פגמים קלים",
    roughQuality: "מחוספס",
    roughQualityDesc: "אי-אחידות משמעותית",
    poorQuality: "גרוע",
    poorQualityDesc: "מכשולים גדולים",
    
    // Width
    pathWidth: "רוחב שביל טיפוסי",
    wide: "רחב (2 מ׳+)",
    wideDesc: "מעבר קל",
    standardWidth: "סטנדרטי (1-2 מ׳)",
    standardWidthDesc: "כיסא גלגלים בודד",
    narrow: "צר (0.5-1 מ׳)",
    narrowDesc: "צפוף",
    veryNarrow: "צר מאוד (<0.5 מ׳)",
    veryNarrowDesc: "הליכה בלבד",
    
    // Slope
    maxSlope: "שיפוע מקסימלי",
    flat: "שטוח (0-2%)",
    flatDesc: "ללא שיפוע מורגש",
    gentleSlope: "מתון (2-5%)",
    gentleSlopeDesc: "שיפוע קל",
    moderateSlope: "בינוני (5-8%)",
    moderateSlopeDesc: "מורגש אך ניתן לניהול",
    steepSlope: "תלול (8-12%)",
    steepSlopeDesc: "עשוי לדרוש סיוע",
    verySteep: "תלול מאוד (>12%)",
    verySteepDesc: "אתגר משמעותי",
    
    // Steps
    steps: "מדרגות או מדרכות",
    noSteps: "ללא",
    noStepsDesc: "ללא מדרגות לחלוטין",
    fewSteps: "מעט (1-3)",
    fewStepsDesc: "מכשולים קלים",
    someSteps: "כמה (4-10)",
    someStepsDesc: "מספר מכשולים",
    manySteps: "הרבה (>10)",
    manyStepsDesc: "מכשולים תכופים",
    
    // Obstacles
    obstacles: "מכשולים בשביל",
    noObstacles: "ללא",
    fewObstacles: "מעט",
    someObstacles: "כמה",
    manyObstacles: "הרבה",
    
    // Handrails
    handrails: "מעקות זמינים",
    handrailsBoth: "משני הצדדים",
    handrailsOne: "צד אחד",
    handrailsNone: "ללא",
    handrailsNA: "לא נדרש",
    
    // Visual & Environmental
    lighting: "תאורת השביל",
    wellLit: "מואר היטב",
    partialLight: "תאורה חלקית",
    noLighting: "ללא תאורה",
    daylightOnly: "אור יום בלבד",
    
    shade: "כיסוי צל",
    fullShade: "מוצל ברובו",
    partialShade: "צל חלקי",
    noShade: "ללא צל/חשוף",
    
    hazards: "סכנות פוטנציאליות",
    hazardsPlaceholder: "לדוגמה: משטחים לא אחידים, ענפים נמוכים, מעברי מים...",
    
    // Facilities
    parking: "חניית נכים",
    parkingYes: "זמינה",
    parkingNearby: "בקרבת מקום",
    parkingNo: "לא זמינה",
    
    restrooms: "שירותים נגישים",
    restroomsYes: "זמינים",
    restroomsNearby: "בקרבת מקום",
    restroomsNo: "לא זמינים",
    
    benches: "אזורי מנוחה/ספסלים",
    benchesYes: "זמינים",
    benchesFew: "מעט",
    benchesNo: "ללא",
    
    water: "ברזיות מים",
    waterYes: "זמינות",
    waterNo: "לא זמינות",
    
    // Signage
    signageQuality: "איכות שילוט השביל",
    signageExcellent: "מצוין",
    signageGood: "טוב",
    signageFair: "סביר",
    signagePoor: "גרוע/ללא",
    
    brailleSignage: "שילוט ברייל",
    brailleYes: "זמין",
    brailleNo: "לא זמין",
    
    audioGuide: "מדריך קולי/תיאור",
    audioYes: "זמין",
    audioNo: "לא זמין",
    
    // Additional
    additionalNotes: "הערות נוספות",
    additionalNotesPlaceholder: "מידע נגישות נוסף, טיפים או אזהרות...",
    bestTimeToVisit: "הזמן הטוב ביותר לביקור",
    bestTimePlaceholder: "לדוגמה: בוקר מוקדם לצל, להימנע מסופי שבוע...",
    emergencyInfo: "מידע חירום",
    emergencyPlaceholder: "בית חולים קרוב, איש קשר לחירום וכו׳",
    
    // Trip types
    tripType: "סוג טיול",
    beach: "חוף",
    stream: "נחל",
    park: "פארק",
    forest: "יער",
    urban: "עירוני",
    scenic: "נופי",
    
    // Route types
    routeType: "סוג מסלול",
    circular: "מעגלי",
    roundTrip: "הלוך ושוב",
    
    // Mobility section
    disabledParking: "חניית נכים",
    parkingAvailable: "חניה נגישה זמינה",
    parkingSpaces: "מספר מקומות חניה נגישים:",
    withAssistance: "עם ליווי",
    
    // Surface section  
    stone: "אבן",
    mixedSurfaces: "משטחים מעורבים",
    excellent: "מצוין",
    fair: "סביר",
    poor: "גרוע",
    overgrown: "צמחייה פרועה",
    
    // Slopes
    trailSlopes: "שיפועי שביל",
    flatMild: "שטוח/קל (<5%)",
    moderate: "בינוני (5-10%)",
    steep: "תלול (>10%)",
    
    // Visual section
    visualAdaptations: "התאמות ללקויי ראייה (בחר את כל המתאימים)",
    raisedBorders: "גבולות בולטים",
    tactileSurfaces: "משטחים מישושיים",
    colorContrast: "ניגודיות צבעים",
    shadeCoverage: "כיסוי צל בשביל",
    plentyShade: "הרבה צל",
    intermittent: "לסירוגין",
    noShade: "ללא צל",
    trailLit: "💡 השביל מואר בחושך",
    
    // Facilities section
    accessibleFountains: "ברזיות מים נגישות",
    none: "ללא",
    one: "אחת",
    multiple: "מספר",
    accessibleSeating: "ישיבה נגישה (בחר את כל המתאימים)",
    noBenches: "ללא ספסלים",
    oneBench: "ספסל אחד",
    multipleBenches: "מספר ספסלים",
    withoutHandrails: "ללא מעקות",
    accessiblePicnic: "🧺 אזורי פיקניק נגישים זמינים",
    numberOfAreas: "מספר אזורים",
    inShade: "בצל",
    inSun: "בשמש",
    accessibleViewpoint: "🏔️ נקודת תצפית נגישה זמינה",
    accessibleRestrooms: "שירותים נגישים",
    unisex: "יוניסקס",
    separateMF: "נפרדים ג׳/נ׳",
    
    // Signage section
    availableSignage: "שילוט זמין (בחר את כל המתאימים)",
    routeMap: "🗺️ מפת מסלול",
    directionalSigns: "➡️ שילוט כיווני",
    distanceMarkers: "📏 סימוני מרחק",
    accessibilityInfo: "♿ מידע נגישות",
    audioDescAvailable: "🔊 תיאור קולי זמין",
    simpleLanguage: "📖 שפה פשוטה",
    highContrast: "🔤 ניגודיות גבוהה",
    qrCodeAvailable: "📱 קוד QR עם מידע על האתר זמין",
    
    // Additional section
    surveyorName: "שם הסוקר (אופציונלי)",
    yourName: "השם שלך",
    surveyDate: "תאריך הסקר",
    overallSummary: "סיכום נגישות כללי",
    accessible: "נגיש",
    partial: "נגיש חלקית"
  }
};

export class AccessibilityFormV2Full {
  constructor() {
    this.isOpen = false;
    this.currentCallback = null;
    this.formData = {};
    this.lang = localStorage.getItem('accessNature_language') || 'en';
    this.sections = [
      { id: 'basic', icon: '🗺️', titleKey: 'basicInfo', required: true },
      { id: 'mobility', icon: '♿', titleKey: 'mobilityAccess', required: false },
      { id: 'surface', icon: '🛤️', titleKey: 'trailSurface', required: false },
      { id: 'visual', icon: '👁️', titleKey: 'visualEnv', required: false },
      { id: 'facilities', icon: '🚰', titleKey: 'facilities', required: false },
      { id: 'signage', icon: '🪧', titleKey: 'signage', required: false },
      { id: 'additional', icon: '📝', titleKey: 'additionalInfo', required: false }
    ];
    this.expandedSection = 'basic';
  }

  /**
   * Get translation for key
   */
  t(key) {
    return formTranslations[this.lang]?.[key] || formTranslations['en']?.[key] || key;
  }

  /**
   * Update language and refresh form
   */
  updateLanguage(newLang) {
    this.lang = newLang;
    // Re-render form if it exists
    const overlay = document.getElementById('af2f-overlay');
    if (overlay) {
      // Set RTL direction for Hebrew
      overlay.dir = this.lang === 'he' ? 'rtl' : 'ltr';
      overlay.lang = this.lang;
      
      // Save current form data before re-rendering
      const savedData = { ...this.formData };
      this.loadFormHTML();
      this.setupEventListeners();
      // Restore form data
      this.formData = savedData;
      this.restoreFormData();
    }
  }

  /**
   * Restore form data after language change
   */
  restoreFormData() {
    // Restore input values
    Object.entries(this.formData).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
      }
    });
  }

  initialize() {
    this.injectStyles();
    this.loadFormHTML();
    this.setupEventListeners();
    
    // Register for i18n refresh
    if (window.i18n) {
      window.i18n.registerForRefresh('accessibilityFormV2Full', (lang) => {
        this.updateLanguage(lang);
      });
    }
    
    // Also listen for languageChanged event as backup
    window.addEventListener('languageChanged', (e) => {
      this.updateLanguage(e.detail.newLang);
    });
  }

  injectStyles() {
    if (document.getElementById('accessibility-form-v2f-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'accessibility-form-v2f-styles';
    styles.textContent = `
      /* ========== Form Container ========== */
      .af2f-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: none;
        overflow-y: auto;
        padding: 20px;
      }
      
      .af2f-overlay.open {
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      
      .af2f-container {
        background: #f5f5f5;
        border-radius: 20px;
        max-width: 700px;
        width: 100%;
        margin: 20px auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        animation: af2f-slideUp 0.3s ease;
      }
      
      @keyframes af2f-slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* ========== Header ========== */
      .af2f-header {
        background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
        color: white;
        padding: 24px;
        position: relative;
      }
      
      .af2f-header h1 {
        font-size: 1.4rem;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .af2f-header p {
        margin: 0;
        opacity: 0.9;
        font-size: 0.9rem;
      }
      
      .af2f-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .af2f-close:hover {
        background: rgba(255,255,255,0.3);
      }
      
      /* ========== Progress Bar ========== */
      .af2f-progress-bar {
        height: 4px;
        background: rgba(255,255,255,0.3);
        position: relative;
      }
      
      .af2f-progress-fill {
        height: 100%;
        background: #ffd700;
        transition: width 0.3s ease;
        width: 0%;
      }
      
      .af2f-progress-text {
        text-align: center;
        padding: 8px;
        background: rgba(0,0,0,0.1);
        font-size: 0.8rem;
        color: white;
      }
      
      /* ========== Form Body ========== */
      .af2f-body {
        padding: 16px;
        max-height: 65vh;
        overflow-y: auto;
      }
      
      /* ========== Section Accordion ========== */
      .af2f-section {
        background: white;
        border-radius: 12px;
        margin-bottom: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      
      .af2f-section:last-child {
        margin-bottom: 0;
      }
      
      .af2f-section-header {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
        user-select: none;
      }
      
      .af2f-section-header:hover {
        background: #f8f9fa;
      }
      
      .af2f-section-header:focus {
        outline: none;
        background: #f0f5f0;
      }
      
      .af2f-section-header:focus-visible {
        outline: 2px solid #4a7c59;
        outline-offset: -2px;
      }
      
      .af2f-section-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 10px;
      }
      
      .af2f-section.expanded .af2f-section-icon {
        background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
      }
      
      .af2f-section-info {
        flex: 1;
      }
      
      .af2f-section-title {
        font-weight: 600;
        color: #333;
        font-size: 0.95rem;
        margin: 0;
      }
      
      .af2f-section-subtitle {
        font-size: 0.8rem;
        color: #666;
        margin-top: 2px;
      }
      
      .af2f-section-status {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .af2f-section-badge {
        font-size: 0.7rem;
        padding: 3px 8px;
        border-radius: 10px;
        font-weight: 600;
      }
      
      .af2f-section-badge.required {
        background: #fff3cd;
        color: #856404;
      }
      
      .af2f-section-badge.complete {
        background: #d4edda;
        color: #155724;
      }
      
      .af2f-section-badge.incomplete {
        background: #f8f9fa;
        color: #666;
      }
      
      .af2f-section-arrow {
        font-size: 1.2rem;
        color: #999;
        transition: transform 0.3s;
      }
      
      .af2f-section.expanded .af2f-section-arrow {
        transform: rotate(180deg);
      }
      
      .af2f-section-content {
        display: none;
        padding: 0 16px 16px 16px;
        border-top: 1px solid #f0f0f0;
      }
      
      .af2f-section.expanded .af2f-section-content {
        display: block;
        animation: af2f-fadeIn 0.3s ease;
      }
      
      @keyframes af2f-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* ========== Form Fields ========== */
      .af2f-field {
        margin-top: 16px;
      }
      
      .af2f-field:first-child {
        margin-top: 16px;
      }
      
      .af2f-label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        font-size: 0.9rem;
      }
      
      .af2f-label .required {
        color: #dc3545;
        margin-left: 4px;
      }
      
      .af2f-hint {
        font-size: 0.8rem;
        color: #666;
        margin-top: 4px;
      }
      
      .af2f-input {
        width: 100%;
        padding: 12px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      
      .af2f-input:focus {
        outline: none;
        border-color: #4a7c59;
        box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
      }
      
      .af2f-select {
        width: 100%;
        padding: 12px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
      }
      
      .af2f-textarea {
        width: 100%;
        padding: 12px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 1rem;
        min-height: 80px;
        resize: vertical;
        font-family: inherit;
        box-sizing: border-box;
      }
      
      /* Row layout */
      .af2f-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      .af2f-row-3 {
        grid-template-columns: 1fr 1fr 1fr;
      }
      
      /* ========== Visual Selection Cards ========== */
      .af2f-card-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .af2f-card-grid.cols-3 {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .af2f-card-grid.cols-4 {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .af2f-select-card {
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 12px 10px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }
      
      .af2f-select-card:hover {
        border-color: #4a7c59;
        background: #f8fff8;
      }
      
      .af2f-select-card:focus {
        outline: none;
        border-color: #4a7c59;
        box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.3);
      }
      
      .af2f-select-card:focus-visible {
        outline: 2px solid #4a7c59;
        outline-offset: 2px;
      }
      
      .af2f-select-card.selected {
        border-color: #4a7c59;
        background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
      }
      
      .af2f-select-card .card-icon {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 4px;
      }
      
      .af2f-select-card .card-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #333;
        display: block;
        line-height: 1.2;
      }
      
      /* Chip selections */
      .af2f-chip-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .af2f-chip {
        padding: 8px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 20px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }
      
      .af2f-chip:hover {
        border-color: #4a7c59;
      }
      
      .af2f-chip:focus {
        outline: none;
        border-color: #4a7c59;
        box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.3);
      }
      
      .af2f-chip:focus-visible {
        outline: 2px solid #4a7c59;
        outline-offset: 2px;
      }
      
      .af2f-chip.selected {
        border-color: #4a7c59;
        background: #4a7c59;
        color: white;
      }
      
      /* Checkbox styled */
      .af2f-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }
      
      .af2f-checkbox:hover {
        border-color: #4a7c59;
      }
      
      .af2f-checkbox:focus {
        outline: none;
        border-color: #4a7c59;
        box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.3);
      }
      
      .af2f-checkbox:focus-visible {
        outline: 2px solid #4a7c59;
        outline-offset: 2px;
      }
      
      .af2f-checkbox.checked {
        border-color: #4a7c59;
        background: #f8fff8;
      }
      
      .af2f-checkbox .check-box {
        width: 22px;
        height: 22px;
        border: 2px solid #ccc;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: transparent;
        transition: all 0.2s;
      }
      
      .af2f-checkbox.checked .check-box {
        background: #4a7c59;
        border-color: #4a7c59;
        color: white;
      }
      
      .af2f-checkbox .check-label {
        font-size: 0.9rem;
        color: #333;
      }
      
      /* Number input with label */
      .af2f-number-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .af2f-number-input {
        width: 80px;
        text-align: center;
        padding: 8px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
      }
      
      /* ========== Footer ========== */
      .af2f-footer {
        padding: 16px 24px;
        background: white;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 12px;
      }
      
      .af2f-btn {
        flex: 1;
        padding: 14px 20px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      
      .af2f-btn-primary {
        background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%);
        color: white;
      }
      
      .af2f-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(74, 124, 89, 0.4);
      }
      
      .af2f-btn-secondary {
        background: white;
        color: #666;
        border: 2px solid #e0e0e0;
      }
      
      .af2f-btn-secondary:hover {
        border-color: #4a7c59;
        color: #4a7c59;
      }
      
      /* ========== Mobile Responsive ========== */
      @media (max-width: 480px) {
        .af2f-container {
          margin: 10px;
          border-radius: 16px;
        }
        
        .af2f-body {
          padding: 12px;
        }
        
        .af2f-row,
        .af2f-row-3 {
          grid-template-columns: 1fr;
        }
        
        .af2f-card-grid,
        .af2f-card-grid.cols-3,
        .af2f-card-grid.cols-4 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .af2f-section-header {
          padding: 12px;
        }
        
        .af2f-section-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2rem;
        }
        
        .af2f-footer {
          flex-direction: column;
        }
      }
      
      /* ========== RTL Support ========== */
      [dir="rtl"] .af2f-header h1,
      [dir="rtl"] .af2f-header p {
        text-align: right;
      }
      
      [dir="rtl"] .af2f-close {
        left: 16px;
        right: auto;
      }
      
      [dir="rtl"] .af2f-section-header {
        flex-direction: row-reverse;
      }
      
      [dir="rtl"] .af2f-section-info {
        text-align: right;
      }
      
      [dir="rtl"] .af2f-section-arrow {
        margin-left: 0;
        margin-right: auto;
      }
      
      [dir="rtl"] .af2f-label {
        text-align: right;
      }
      
      [dir="rtl"] .af2f-input,
      [dir="rtl"] .af2f-select,
      [dir="rtl"] .af2f-textarea {
        text-align: right;
      }
      
      [dir="rtl"] .af2f-select-card,
      [dir="rtl"] .af2f-chip {
        text-align: center;
      }
      
      [dir="rtl"] .af2f-checkbox {
        flex-direction: row-reverse;
        justify-content: flex-end;
      }
      
      [dir="rtl"] .af2f-checkbox .check-label {
        margin-left: 0;
        margin-right: 12px;
      }
      
      [dir="rtl"] .af2f-footer {
        flex-direction: row-reverse;
      }
      
      [dir="rtl"] .af2f-number-row {
        flex-direction: row-reverse;
      }
    `;
    
    document.head.appendChild(styles);
  }

  loadFormHTML() {
    let overlay = document.getElementById('af2f-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'af2f-overlay';
      overlay.className = 'af2f-overlay';
      document.body.appendChild(overlay);
    }
    
    const sectionsHTML = this.sections.map(s => this.renderSection(s)).join('');
    
    overlay.innerHTML = `
      <div class="af2f-container">
        <!-- Header -->
        <div class="af2f-header">
          <h1>🌲 ${this.t('formTitle')}</h1>
          <p>${this.t('formSubtitle')}</p>
          <button class="af2f-close" onclick="window.closeAccessibilityFormV2Full()">×</button>
          <div class="af2f-progress-bar">
            <div class="af2f-progress-fill" id="af2f-progress"></div>
          </div>
          <div class="af2f-progress-text" id="af2f-progress-text">0 ${this.t('sectionsComplete')}</div>
        </div>
        
        <!-- Form Body -->
        <div class="af2f-body">
          ${sectionsHTML}
        </div>
        
        <!-- Footer -->
        <div class="af2f-footer">
          <button class="af2f-btn af2f-btn-secondary" onclick="window.closeAccessibilityFormV2Full()">${this.t('cancel')}</button>
          <button class="af2f-btn af2f-btn-primary" onclick="window.af2fSave()">${this.t('saveSurvey')}</button>
        </div>
      </div>
    `;
  }

  renderSection(section) {
    const isExpanded = section.id === this.expandedSection;
    const content = this.getSectionContent(section.id);
    const sectionTitle = this.t(section.titleKey);
    
    return `
      <div class="af2f-section ${isExpanded ? 'expanded' : ''}" data-section="${section.id}">
        <div class="af2f-section-header" onclick="window.af2fToggleSection('${section.id}')">
          <div class="af2f-section-icon">${section.icon}</div>
          <div class="af2f-section-info">
            <div class="af2f-section-title">${sectionTitle}</div>
            <div class="af2f-section-subtitle" id="af2f-subtitle-${section.id}">${this.t('tapToExpand')}</div>
          </div>
          <div class="af2f-section-status">
            ${section.required ? `<span class="af2f-section-badge required">${this.t('required')}</span>` : ''}
            <span class="af2f-section-badge incomplete" id="af2f-badge-${section.id}">0 ${this.t('filled')}</span>
          </div>
          <span class="af2f-section-arrow">▼</span>
        </div>
        <div class="af2f-section-content">
          ${content}
        </div>
      </div>
    `;
  }

  getSectionContent(sectionId) {
    const t = (key) => this.t(key);
    
    switch (sectionId) {
      case 'basic':
        return `
          <div class="af2f-row">
            <div class="af2f-field">
              <label class="af2f-label">${t('trailName')} <span class="required">*</span></label>
              <input type="text" class="af2f-input" name="trailName" placeholder="${t('trailNamePlaceholder')}" required>
            </div>
            <div class="af2f-field">
              <label class="af2f-label">${t('location')} <span class="required">*</span></label>
              <input type="text" class="af2f-input" name="location" placeholder="${t('locationPlaceholder')}" required>
            </div>
          </div>
          
          <div class="af2f-row">
            <div class="af2f-field">
              <label class="af2f-label">${t('trailLength')}</label>
              <input type="number" class="af2f-input" name="trailLength" step="0.1" min="0" placeholder="2.5">
            </div>
            <div class="af2f-field">
              <label class="af2f-label">${t('estimatedDuration')}</label>
              <select class="af2f-select" name="estimatedTime">
                <option value="">${t('selectDuration')}</option>
                <option value="Under 30 minutes">${t('under15')}</option>
                <option value="30-60 minutes">${t('mins30to60')}</option>
                <option value="1-2 hours">${t('hours1to2')}</option>
                <option value="2-4 hours">${t('over2hours')}</option>
              </select>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('tripType')}</label>
            <div class="af2f-chip-grid" data-field="tripType" data-type="single">
              <div class="af2f-chip" data-value="Beach Promenade">🏖️ ${t('beach')}</div>
              <div class="af2f-chip" data-value="Stream Path">🌊 ${t('stream')}</div>
              <div class="af2f-chip" data-value="Park Route">🌳 ${t('park')}</div>
              <div class="af2f-chip" data-value="Forest Trail">🌲 ${t('forest')}</div>
              <div class="af2f-chip" data-value="Urban Route">🏙️ ${t('urban')}</div>
              <div class="af2f-chip" data-value="Scenic Drive">🚗 ${t('scenic')}</div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('routeType')}</label>
            <div class="af2f-card-grid" data-field="routeType" data-type="single">
              <div class="af2f-select-card" data-value="Circular">
                <span class="card-icon">🔄</span>
                <span class="card-label">${t('circular')}</span>
              </div>
              <div class="af2f-select-card" data-value="Round Trip">
                <span class="card-icon">↔️</span>
                <span class="card-label">${t('roundTrip')}</span>
              </div>
            </div>
          </div>
        `;
        
      case 'mobility':
        return `
          <div class="af2f-field">
            <label class="af2f-label">${t('wheelchairAccess')}</label>
            <div class="af2f-card-grid cols-4" data-field="wheelchairAccess" data-type="single">
              <div class="af2f-select-card" data-value="Fully accessible">
                <span class="card-icon">♿</span>
                <span class="card-label">${t('fullyAccessible')}</span>
              </div>
              <div class="af2f-select-card" data-value="Partially accessible">
                <span class="card-icon">⚠️</span>
                <span class="card-label">${t('partiallyAccessible')}</span>
              </div>
              <div class="af2f-select-card" data-value="Accessible with assistance">
                <span class="card-icon">🤝</span>
                <span class="card-label">${t('withAssistance')}</span>
              </div>
              <div class="af2f-select-card" data-value="Not accessible">
                <span class="card-icon">🚫</span>
                <span class="card-label">${t('notAccessible')}</span>
              </div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('disabledParking')}</label>
            <div class="af2f-checkbox" data-field="disabledParking" data-value="Available">
              <span class="check-box">✓</span>
              <span class="check-label">${t('parkingAvailable')}</span>
            </div>
          </div>
          
          <div class="af2f-field">
            <div class="af2f-number-row">
              <label class="af2f-label" style="margin-bottom:0">${t('parkingSpaces')}</label>
              <input type="number" class="af2f-number-input" name="parkingSpaces" min="0" value="0">
            </div>
          </div>
        `;
        
      case 'surface':
        return `
          <div class="af2f-field">
            <label class="af2f-label">${t('surfaceTypes')}</label>
            <div class="af2f-chip-grid" data-field="trailSurface" data-type="multi">
              <div class="af2f-chip" data-value="Asphalt">🛣️ ${t('asphalt')}</div>
              <div class="af2f-chip" data-value="Concrete">⬜ ${t('concrete')}</div>
              <div class="af2f-chip" data-value="Stone">🪨 ${t('stone')}</div>
              <div class="af2f-chip" data-value="Wood/Plastic Deck">🪵 ${t('woodDeck')}</div>
              <div class="af2f-chip" data-value="Compacted Gravel">⚪ ${t('gravel')}</div>
              <div class="af2f-chip" data-value="Mixed Surfaces">🔀 ${t('mixedSurfaces')}</div>
              <div class="af2f-chip" data-value="Grass">🌿 ${t('grass')}</div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('surfaceQuality')}</label>
            <div class="af2f-card-grid" data-field="surfaceQuality" data-type="single">
              <div class="af2f-select-card" data-value="Excellent - smooth and well maintained">
                <span class="card-icon">✨</span>
                <span class="card-label">${t('excellent')}</span>
              </div>
              <div class="af2f-select-card" data-value="Fair - minor disruptions, rough patches, bumps, cracks">
                <span class="card-icon">👍</span>
                <span class="card-label">${t('fair')}</span>
              </div>
              <div class="af2f-select-card" data-value="Poor - serious disruptions, protruding stones, large grooves">
                <span class="card-icon">⚠️</span>
                <span class="card-label">${t('poor')}</span>
              </div>
              <div class="af2f-select-card" data-value="Vegetation blocks passage">
                <span class="card-icon">🌿</span>
                <span class="card-label">${t('overgrown')}</span>
              </div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('trailSlopes')}</label>
            <div class="af2f-card-grid cols-3" data-field="trailSlopes" data-type="single">
              <div class="af2f-select-card" data-value="No slopes to mild slopes (up to 5%)">
                <span class="card-icon">➡️</span>
                <span class="card-label">${t('flatMild')}</span>
              </div>
              <div class="af2f-select-card" data-value="Moderate slopes - assistance recommended (5%-10%)">
                <span class="card-icon">📐</span>
                <span class="card-label">${t('moderate')}</span>
              </div>
              <div class="af2f-select-card" data-value="Steep slopes - not accessible (over 10%)">
                <span class="card-icon">⛰️</span>
                <span class="card-label">${t('steep')}</span>
              </div>
            </div>
          </div>
        `;
        
      case 'visual':
        return `
          <div class="af2f-field">
            <label class="af2f-label">${t('visualAdaptations')}</label>
            <div class="af2f-chip-grid" data-field="visualAdaptations" data-type="multi">
              <div class="af2f-chip" data-value="Raised/protruding borders">${t('raisedBorders')}</div>
              <div class="af2f-chip" data-value="Texture/tactile differences">${t('tactileSurfaces')}</div>
              <div class="af2f-chip" data-value="Color contrast differences">${t('colorContrast')}</div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('shadeCoverage')}</label>
            <div class="af2f-card-grid cols-3" data-field="shadeCoverage" data-type="single">
              <div class="af2f-select-card" data-value="Plenty of shade">
                <span class="card-icon">🌳</span>
                <span class="card-label">${t('plentyShade')}</span>
              </div>
              <div class="af2f-select-card" data-value="Intermittent shade">
                <span class="card-icon">⛅</span>
                <span class="card-label">${t('intermittent')}</span>
              </div>
              <div class="af2f-select-card" data-value="No shade">
                <span class="card-icon">☀️</span>
                <span class="card-label">${t('noShade')}</span>
              </div>
            </div>
          </div>
          
          <div class="af2f-field">
            <div class="af2f-checkbox" data-field="lighting" data-value="Trail is lit in darkness">
              <span class="check-box">✓</span>
              <span class="check-label">${t('trailLit')}</span>
            </div>
          </div>
        `;
        
      case 'facilities':
        return `
          <div class="af2f-field">
            <label class="af2f-label">${t('accessibleFountains')}</label>
            <div class="af2f-card-grid cols-3" data-field="waterFountains" data-type="single">
              <div class="af2f-select-card" data-value="None">
                <span class="card-icon">🚫</span>
                <span class="card-label">${t('none')}</span>
              </div>
              <div class="af2f-select-card" data-value="One accessible fountain">
                <span class="card-icon">🚰</span>
                <span class="card-label">${t('one')}</span>
              </div>
              <div class="af2f-select-card" data-value="Multiple fountains along route">
                <span class="card-icon">🚰🚰</span>
                <span class="card-label">${t('multiple')}</span>
              </div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('accessibleSeating')}</label>
            <div class="af2f-chip-grid" data-field="seating" data-type="multi">
              <div class="af2f-chip" data-value="No accessible benches">${t('noBenches')}</div>
              <div class="af2f-chip" data-value="One accessible bench">${t('oneBench')}</div>
              <div class="af2f-chip" data-value="Multiple benches along route">${t('multipleBenches')}</div>
              <div class="af2f-chip" data-value="Benches without handrails">${t('withoutHandrails')}</div>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('benches')}</label>
            <div class="af2f-checkbox" data-field="picnicAreas" data-value="Available">
              <span class="check-box">✓</span>
              <span class="check-label">${t('accessiblePicnic')}</span>
            </div>
          </div>
          
          <div class="af2f-row af2f-row-3">
            <div class="af2f-field">
              <label class="af2f-label">${t('numberOfAreas')}</label>
              <input type="number" class="af2f-input" name="picnicCount" min="0" value="0">
            </div>
            <div class="af2f-field">
              <label class="af2f-label">${t('inShade')}</label>
              <input type="number" class="af2f-input" name="picnicShade" min="0" value="0">
            </div>
            <div class="af2f-field">
              <label class="af2f-label">${t('inSun')}</label>
              <input type="number" class="af2f-input" name="picnicSun" min="0" value="0">
            </div>
          </div>
          
          <div class="af2f-field">
            <div class="af2f-checkbox" data-field="accessibleViewpoint" data-value="Available">
              <span class="check-box">✓</span>
              <span class="check-label">${t('accessibleViewpoint')}</span>
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('accessibleRestrooms')}</label>
            <div class="af2f-card-grid cols-3" data-field="restrooms" data-type="single">
              <div class="af2f-select-card" data-value="None">
                <span class="card-icon">🚫</span>
                <span class="card-label">${t('none')}</span>
              </div>
              <div class="af2f-select-card" data-value="One unisex accessible restroom">
                <span class="card-icon">🚻</span>
                <span class="card-label">${t('unisex')}</span>
              </div>
              <div class="af2f-select-card" data-value="Separate accessible restrooms for men and women">
                <span class="card-icon">🚹🚺</span>
                <span class="card-label">${t('separateMF')}</span>
              </div>
            </div>
          </div>
        `;
        
      case 'signage':
        return `
          <div class="af2f-field">
            <label class="af2f-label">${t('availableSignage')}</label>
            <div class="af2f-chip-grid" data-field="signage" data-type="multi">
              <div class="af2f-chip" data-value="Route map available">${t('routeMap')}</div>
              <div class="af2f-chip" data-value="Clear directional signage">${t('directionalSigns')}</div>
              <div class="af2f-chip" data-value="Simple language signage">${t('simpleLanguage')}</div>
              <div class="af2f-chip" data-value="Large, high-contrast accessible signage">${t('highContrast')}</div>
              <div class="af2f-chip" data-value="Audio explanation compatible with T-mode hearing devices">${t('audioDescAvailable')}</div>
            </div>
          </div>
          
          <div class="af2f-field">
            <div class="af2f-checkbox" data-field="qrCode" data-value="Available">
              <span class="check-box">✓</span>
              <span class="check-label">${t('qrCodeAvailable')}</span>
            </div>
          </div>
        `;
        
      case 'additional':
        return `
          <div class="af2f-field">
            <label class="af2f-label">${t('additionalNotes')}</label>
            <textarea class="af2f-textarea" name="additionalNotes" placeholder="${t('additionalNotesPlaceholder')}"></textarea>
          </div>
          
          <div class="af2f-row">
            <div class="af2f-field">
              <label class="af2f-label">${t('surveyorName')}</label>
              <input type="text" class="af2f-input" name="surveyorName" placeholder="${t('yourName')}">
            </div>
            <div class="af2f-field">
              <label class="af2f-label">${t('surveyDate')}</label>
              <input type="date" class="af2f-input" name="surveyDate">
            </div>
          </div>
          
          <div class="af2f-field">
            <label class="af2f-label">${t('overallSummary')}</label>
            <div class="af2f-card-grid cols-3" data-field="accessibilitySummary" data-type="single">
              <div class="af2f-select-card" data-value="Accessible">
                <span class="card-icon">✅</span>
                <span class="card-label">${t('accessible')}</span>
              </div>
              <div class="af2f-select-card" data-value="Partially accessible">
                <span class="card-icon">⚠️</span>
                <span class="card-label">${t('partial')}</span>
              </div>
              <div class="af2f-select-card" data-value="Not accessible">
                <span class="card-icon">❌</span>
                <span class="card-label">${t('notAccessible')}</span>
              </div>
            </div>
          </div>
        `;
        
      default:
        return '';
    }
  }

  setupEventListeners() {
    window.closeAccessibilityFormV2Full = () => this.close();
    window.af2fToggleSection = (id) => this.toggleSection(id);
    window.af2fSave = () => this.saveForm();
    
    const overlay = document.getElementById('af2f-overlay');
    if (!overlay) return;
    
    // Add accessibility attributes to all custom controls
    this.addAccessibilityAttributes(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    
    // Close on Escape key
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
    
    // Card selections (click)
    overlay.addEventListener('click', (e) => {
      const card = e.target.closest('.af2f-select-card');
      if (card) {
        this.handleCardSelection(card);
      }
      
      // Chip selections
      const chip = e.target.closest('.af2f-chip');
      if (chip) {
        this.handleChipSelection(chip);
      }
      
      // Checkbox toggle
      const checkbox = e.target.closest('.af2f-checkbox');
      if (checkbox) {
        this.handleCheckboxToggle(checkbox);
      }
    });
    
    // Keyboard handlers for custom controls
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.af2f-select-card');
        if (card) {
          e.preventDefault();
          this.handleCardSelection(card);
        }
        
        const chip = e.target.closest('.af2f-chip');
        if (chip) {
          e.preventDefault();
          this.handleChipSelection(chip);
        }
        
        const checkbox = e.target.closest('.af2f-checkbox');
        if (checkbox) {
          e.preventDefault();
          this.handleCheckboxToggle(checkbox);
        }
        
        // Section headers
        const header = e.target.closest('.af2f-section-header');
        if (header) {
          e.preventDefault();
          const section = header.closest('.af2f-section');
          if (section) {
            this.toggleSection(section.dataset.section);
          }
        }
      }
    });
    
    // Input changes
    overlay.addEventListener('input', () => {
      this.updateProgress();
    });
  }

  /**
   * Add accessibility attributes to all custom controls
   */
  addAccessibilityAttributes(overlay) {
    // Select cards - act like radio buttons
    overlay.querySelectorAll('.af2f-select-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', card.classList.contains('selected') ? 'true' : 'false');
      const label = card.querySelector('.card-label')?.textContent || card.dataset.value;
      card.setAttribute('aria-label', label);
    });
    
    // Chips - act like radio/checkbox depending on type
    overlay.querySelectorAll('.af2f-chip').forEach(chip => {
      chip.setAttribute('tabindex', '0');
      const grid = chip.closest('[data-field]');
      const isMulti = grid?.dataset.type === 'multi';
      chip.setAttribute('role', isMulti ? 'checkbox' : 'radio');
      chip.setAttribute('aria-checked', chip.classList.contains('selected') ? 'true' : 'false');
      // Use text content as label (strip emoji)
      const label = chip.textContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() || chip.dataset.value;
      chip.setAttribute('aria-label', label);
    });
    
    // Checkboxes
    overlay.querySelectorAll('.af2f-checkbox').forEach(checkbox => {
      checkbox.setAttribute('tabindex', '0');
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-checked', checkbox.classList.contains('checked') ? 'true' : 'false');
      const label = checkbox.querySelector('.check-label')?.textContent || '';
      checkbox.setAttribute('aria-label', label);
    });
    
    // Section headers - act like buttons
    overlay.querySelectorAll('.af2f-section-header').forEach(header => {
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      const section = header.closest('.af2f-section');
      const isExpanded = section?.classList.contains('expanded');
      header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const title = header.querySelector('.af2f-section-title')?.textContent || '';
      header.setAttribute('aria-label', `${title}, ${isExpanded ? 'expanded' : 'collapsed'}`);
    });
    
    // Close button
    const closeBtn = overlay.querySelector('.af2f-close');
    if (closeBtn) {
      closeBtn.setAttribute('aria-label', 'Close accessibility survey');
    }
  }

  /**
   * Handle card selection with ARIA update
   */
  handleCardSelection(card) {
    const grid = card.closest('[data-field]');
    if (grid) {
      const type = grid.dataset.type;
      if (type === 'single') {
        grid.querySelectorAll('.af2f-select-card').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
      }
      card.classList.toggle('selected');
      card.setAttribute('aria-checked', card.classList.contains('selected') ? 'true' : 'false');
      this.updateProgress();
    }
  }

  /**
   * Handle chip selection with ARIA update
   */
  handleChipSelection(chip) {
    const grid = chip.closest('[data-field]');
    if (grid) {
      const type = grid.dataset.type;
      if (type === 'single') {
        grid.querySelectorAll('.af2f-chip').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
      }
      chip.classList.toggle('selected');
      chip.setAttribute('aria-checked', chip.classList.contains('selected') ? 'true' : 'false');
      this.updateProgress();
    }
  }

  /**
   * Handle checkbox toggle with ARIA update
   */
  handleCheckboxToggle(checkbox) {
    checkbox.classList.toggle('checked');
    checkbox.setAttribute('aria-checked', checkbox.classList.contains('checked') ? 'true' : 'false');
    this.updateProgress();
  }

  toggleSection(sectionId) {
    const overlay = document.getElementById('af2f-overlay');
    const section = overlay.querySelector(`[data-section="${sectionId}"]`);
    
    if (section.classList.contains('expanded')) {
      section.classList.remove('expanded');
      this.expandedSection = null;
    } else {
      overlay.querySelectorAll('.af2f-section').forEach(s => s.classList.remove('expanded'));
      section.classList.add('expanded');
      this.expandedSection = sectionId;
    }
  }

  updateProgress() {
    const overlay = document.getElementById('af2f-overlay');
    let completedSections = 0;
    
    this.sections.forEach(section => {
      const sectionEl = overlay.querySelector(`[data-section="${section.id}"]`);
      const content = sectionEl.querySelector('.af2f-section-content');
      
      // Count filled fields
      let filledCount = 0;
      let totalFields = 0;
      
      // Text inputs
      content.querySelectorAll('input[type="text"], input[type="date"], textarea, select').forEach(input => {
        totalFields++;
        if (input.value && input.value.trim()) filledCount++;
      });
      
      // Number inputs (count if > 0)
      content.querySelectorAll('input[type="number"]').forEach(input => {
        totalFields++;
        if (parseInt(input.value) > 0) filledCount++;
      });
      
      // Selections
      content.querySelectorAll('[data-field]').forEach(grid => {
        totalFields++;
        if (grid.querySelector('.selected')) filledCount++;
      });
      
      // Checkboxes
      content.querySelectorAll('.af2f-checkbox').forEach(cb => {
        totalFields++;
        if (cb.classList.contains('checked')) filledCount++;
      });
      
      // Update badge
      const badge = document.getElementById(`af2f-badge-${section.id}`);
      if (badge) {
        if (filledCount > 0) {
          badge.textContent = `${filledCount} filled`;
          badge.className = 'af2f-section-badge complete';
          completedSections++;
        } else {
          badge.textContent = '0 filled';
          badge.className = 'af2f-section-badge incomplete';
        }
      }
    });
    
    // Update progress bar
    const progress = (completedSections / this.sections.length) * 100;
    const progressBar = document.getElementById('af2f-progress');
    const progressText = document.getElementById('af2f-progress-text');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${completedSections} of ${this.sections.length} sections complete`;
  }

  collectFormData() {
    const data = {};
    const overlay = document.getElementById('af2f-overlay');
    
    // Text inputs
    overlay.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], select, textarea').forEach(input => {
      if (input.name && input.value) {
        data[input.name] = input.value;
      }
    });
    
    // Single selections
    overlay.querySelectorAll('[data-field][data-type="single"]').forEach(grid => {
      const selected = grid.querySelector('.selected');
      if (selected) {
        data[grid.dataset.field] = selected.dataset.value;
      }
    });
    
    // Multi selections
    overlay.querySelectorAll('[data-field][data-type="multi"]').forEach(grid => {
      const selected = grid.querySelectorAll('.selected');
      if (selected.length > 0) {
        data[grid.dataset.field] = Array.from(selected).map(s => s.dataset.value);
      }
    });
    
    // Checkboxes
    overlay.querySelectorAll('.af2f-checkbox.checked').forEach(cb => {
      data[cb.dataset.field] = cb.dataset.value;
    });
    
    return data;
  }

  saveForm() {
    const data = this.collectFormData();
    
    // Validate required
    if (!data.trailName || !data.location) {
      toast.error('Please fill in Trail Name and Location');
      this.toggleSection('basic');
      return;
    }
    
    console.log('📋 Survey data collected:', data);
    
    if (userService.isInitialized) {
      userService.trackSurveyCompleted();
    }
    
    toast.success('✅ Accessibility survey saved!');
    
    if (this.currentCallback) {
      this.currentCallback(data);
    }
    
    this.close();
  }

  open(callback) {
    this.currentCallback = callback;
    
    // Refresh language from localStorage before opening
    this.lang = localStorage.getItem('accessNature_language') || 'en';
    
    this.initialize();
    
    const overlay = document.getElementById('af2f-overlay');
    if (overlay) {
      // Set RTL direction for Hebrew
      overlay.dir = this.lang === 'he' ? 'rtl' : 'ltr';
      overlay.lang = this.lang;
      
      overlay.classList.add('open');
      this.isOpen = true;
      
      // Prevent pull-to-refresh while form is open
      document.body.classList.add('modal-open');
      
      // Reset form
      overlay.querySelectorAll('input, select, textarea').forEach(i => {
        if (i.type === 'number') {
          i.value = 0;
        } else {
          i.value = '';
        }
      });
      overlay.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
      overlay.querySelectorAll('.checked').forEach(c => c.classList.remove('checked'));
      
      // Expand first section
      overlay.querySelectorAll('.af2f-section').forEach(s => s.classList.remove('expanded'));
      overlay.querySelector('[data-section="basic"]')?.classList.add('expanded');
      
      this.updateProgress();
    }
  }

  close() {
    const overlay = document.getElementById('af2f-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      this.isOpen = false;
      
      // Re-enable pull-to-refresh
      document.body.classList.remove('modal-open');
    }
  }
}

// Create singleton instance
const accessibilityFormV2Full = new AccessibilityFormV2Full();

export { accessibilityFormV2Full };

console.log('📋 Accessibility Form V2 (Full) loaded');