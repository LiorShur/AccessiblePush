/**
 * Trail Guide Generator V2 - Visual-First Design
 * 
 * Features:
 * - Prominent accessibility rating banner
 * - At-a-glance stats with icons
 * - "Good For" badges
 * - Visual progress bars for trail conditions
 * - Integrated timeline with photos and notes
 * - Facilities icon grid
 * - "Heads Up" warnings section
 * 
 * Access Nature - Phase 2 Redesign
 * Created: December 2025
 */

export class TrailGuideGeneratorV2 {
  
  /**
   * Translations for trail guide - embedded for standalone HTML
   */
  static translations = {
    en: {
      trailGuide: "Access Nature Trail Guide",
      documentedOn: "Documented on",
      locationNotSpecified: "Location not specified",
      navigateToStart: "Navigate to Start",
      googleMaps: "Google Maps",
      waze: "Waze",
      downloadPdf: "Download PDF",
      fullSurveyDetails: "Full Survey Details",
      generatingPdf: "Generating PDF...",
      mayTakeSeconds: "This may take a few seconds",
      completeSurvey: "Complete Accessibility Survey",
      routeMap: "Route Map",
      clickMarkers: "Click markers for details",
      elevationProfile: "Elevation Profile",
      goodFor: "Good For",
      trailConditions: "Trail Conditions",
      facilities: "Facilities",
      headsUp: "Heads Up",
      trailTimeline: "Trail Timeline",
      photos: "Photos",
      notes: "Notes",
      waypoints: "Waypoints",
      start: "Start",
      photo: "Photo",
      note: "Note",
      finish: "Finish",
      km: "km",
      m: "m",
      duration: "duration",
      distance: "Distance",
      elevation: "Elevation",
      minElevation: "Min",
      maxElevation: "Max",
      ascent: "Ascent",
      descent: "Descent",
      singlePointRecorded: "Single point recorded. Track longer routes for elevation profile chart.",
      flat: "Flat",
      moderate: "Moderate",
      steep: "Steep",
      verySteep: "Very Steep",
      steepSections: "Steep Sections",
      totalGain: "Total Gain",
      totalLoss: "Total Loss",
      fullyAccessible: "Fully Accessible",
      mostlyAccessible: "Mostly Accessible", 
      partiallyAccessible: "Partially Accessible",
      limitedAccessibility: "Limited Accessibility",
      notAccessible: "Not Accessible",
      notAssessed: "Not Assessed",
      suitableForMost: "Suitable for most mobility devices",
      someBarriers: "Some barriers may exist",
      significantBarriers: "Significant barriers present",
      majorBarriers: "Major barriers - limited access",
      notSuitable: "Not suitable for mobility devices",
      assessmentNeeded: "Accessibility assessment needed",
      wheelchairAccessible: "Wheelchair Accessible",
      strollerFriendly: "Stroller Friendly",
      seniorFriendly: "Senior Friendly",
      walkerFriendly: "Walker Friendly",
      visuallyImpairedFriendly: "Visually Impaired Friendly",
      surfaceType: "Surface",
      pathWidth: "Width",
      slope: "Slope",
      obstacles: "Obstacles",
      steps: "Steps",
      parking: "Parking",
      restrooms: "Restrooms",
      restAreas: "Rest Areas",
      water: "Water",
      shade: "Shade",
      lighting: "Lighting",
      paved: "Paved",
      gravel: "Gravel",
      dirt: "Dirt",
      grass: "Grass",
      mixed: "Mixed",
      wide: "Wide",
      standard: "Standard",
      narrow: "Narrow",
      flat: "Flat",
      gentle: "Gentle",
      moderate: "Moderate",
      steep: "Steep",
      none: "None",
      few: "Few",
      some: "Some",
      many: "Many",
      available: "Available",
      notAvailable: "Not Available",
      nearby: "Nearby",
      easy: "Easy",
      challenging: "Challenging",
      concrete: "Concrete",
      boardwalk: "Boardwalk",
      unknown: "Unknown",
      difficulty: "Difficulty",
      accessibleParking: "Accessible Parking",
      accessibleRestrooms: "Accessible Restrooms",
      benches: "Benches",
      shadedAreas: "Shaded Areas",
      waterFountain: "Water Fountain",
      wellLit: "Well Lit",
      createdWith: "Created with 🌲 Access Nature",
      makingAccessible: "Making outdoor spaces accessible for everyone",
      end: "End",
      
      // Good For section
      wheelchairs: "Wheelchairs",
      strollers: "Strollers",
      walkers: "Walkers",
      serviceDogs: "Service Dogs",
      seniors: "Seniors",
      scooters: "Scooters",
      
      // Conditions section
      surface: "Surface",
      excellent: "Excellent",
      fair: "Fair",
      poor: "Poor",
      overgrown: "Overgrown",
      flatMild: "Flat/Mild",
      plenty: "Plenty",
      
      // Facilities
      spaces: "spaces",
      yes: "Yes",
      
      // Heads up section
      importantNotes: "Important Notes",
      beAware: "Be aware of these observations",

      // Steep sections
      steepSectionDesc: "{length}m section ({elevation}m elevation, max {grade}% grade)",

      // Warning messages
      warningAssistanceNeeded: "May require assistance in some areas",
      warningSteepNotAccessible: "Steep slopes present - not wheelchair accessible",
      warningModerateSlopes: "Moderate slopes - assistance may be needed",
      warningNoShade: "No shade - bring sun protection and water",
      warningPoorSurface: "Surface in poor condition - watch for obstacles",
      warningOvergrown: "Trail may be overgrown in places",

      // Survey detail labels
      surveyTrailName: "Trail Name",
      surveyLocation: "Location",
      surveyRouteType: "Route Type",
      surveyDifficulty: "Difficulty",
      surveyWheelchairAccess: "Wheelchair Access",
      surveyTrailSurface: "Trail Surface",
      surveySurfaceQuality: "Surface Quality",
      surveyTrailSlopes: "Trail Slopes",
      surveyAccessibleParking: "Accessible Parking",
      surveyParkingSpaces: "Parking Spaces",
      surveyRestrooms: "Restrooms",
      surveyWaterFountains: "Water Fountains",
      surveySeating: "Seating",
      surveyShadeCoverage: "Shade Coverage",
      surveyLighting: "Lighting",
      surveySignage: "Signage",
      surveyVisualAccess: "Visual Access",
      surveyTrailWidth: "Trail Width",
      surveyPicnicAreas: "Picnic Areas",
      surveyAccessibleViewpoint: "Accessible Viewpoint",
      surveyEmergencyAccess: "Emergency Access",
      surveyAdditionalNotes: "Additional Notes",
      noSurveyData: "No survey data available."
    },
    he: {
      trailGuide: "מדריך שבילים נגיש",
      documentedOn: "תועד בתאריך",
      locationNotSpecified: "מיקום לא צוין",
      navigateToStart: "נווט לנקודת ההתחלה",
      googleMaps: "מפות גוגל",
      waze: "וייז",
      downloadPdf: "הורד PDF",
      fullSurveyDetails: "פרטי הסקר המלאים",
      generatingPdf: "יוצר PDF...",
      mayTakeSeconds: "זה עשוי לקחת מספר שניות",
      completeSurvey: "סקר נגישות מלא",
      routeMap: "מפת המסלול",
      clickMarkers: "לחץ על סמנים לפרטים",
      elevationProfile: "פרופיל גובה",
      goodFor: "מתאים עבור",
      trailConditions: "מצב השביל",
      facilities: "מתקנים",
      headsUp: "שים לב",
      trailTimeline: "ציר זמן המסלול",
      photos: "תמונות",
      notes: "הערות",
      waypoints: "נקודות ציון",
      start: "התחלה",
      photo: "תמונה",
      note: "הערה",
      finish: "סיום",
      km: "ק״מ",
      m: "מ׳",
      duration: "משך",
      distance: "מרחק",
      elevation: "גובה",
      minElevation: "מינימום",
      maxElevation: "מקסימום",
      elevation: "גובה",
      ascent: "עלייה",
      descent: "ירידה",
      singlePointRecorded: "נקודה בודדת הוקלטה. הקלט מסלולים ארוכים יותר לתרשים גובה.",
      flat: "שטוח",
      moderate: "מתון",
      steep: "תלול",
      verySteep: "תלול מאוד",
      steepSections: "קטעים תלולים",
      totalGain: "עלייה כוללת",
      totalLoss: "ירידה כוללת",
      fullyAccessible: "נגיש לחלוטין",
      mostlyAccessible: "נגיש ברובו",
      partiallyAccessible: "נגיש חלקית",
      limitedAccessibility: "נגישות מוגבלת",
      notAccessible: "לא נגיש",
      notAssessed: "לא הוערך",
      suitableForMost: "מתאים לרוב אמצעי הניידות",
      someBarriers: "ייתכנו מכשולים מסוימים",
      significantBarriers: "קיימים מכשולים משמעותיים",
      majorBarriers: "מכשולים גדולים - גישה מוגבלת",
      notSuitable: "לא מתאים לאמצעי ניידות",
      assessmentNeeded: "נדרשת הערכת נגישות",
      wheelchairAccessible: "נגיש לכיסאות גלגלים",
      strollerFriendly: "מתאים לעגלות",
      seniorFriendly: "ידידותי לקשישים",
      walkerFriendly: "מתאים להליכונים",
      visuallyImpairedFriendly: "מתאים ללקויי ראייה",
      surfaceType: "משטח",
      pathWidth: "רוחב",
      slope: "שיפוע",
      obstacles: "מכשולים",
      steps: "מדרגות",
      parking: "חניה",
      restrooms: "שירותים",
      restAreas: "אזורי מנוחה",
      water: "מים",
      shade: "צל",
      lighting: "תאורה",
      paved: "סלול",
      gravel: "חצץ",
      dirt: "עפר",
      grass: "דשא",
      mixed: "מעורב",
      wide: "רחב",
      standard: "סטנדרטי",
      narrow: "צר",
      flat: "שטוח",
      gentle: "מתון",
      moderate: "בינוני",
      steep: "תלול",
      none: "ללא",
      few: "מעט",
      some: "כמה",
      many: "הרבה",
      available: "זמין",
      notAvailable: "לא זמין",
      nearby: "בקרבת מקום",
      easy: "קל",
      challenging: "מאתגר",
      concrete: "בטון",
      boardwalk: "דק עץ",
      unknown: "לא ידוע",
      difficulty: "רמת קושי",
      accessibleParking: "חניית נכים",
      accessibleRestrooms: "שירותים נגישים",
      benches: "ספסלים",
      shadedAreas: "אזורים מוצלים",
      waterFountain: "ברזייה",
      wellLit: "מואר היטב",
      createdWith: "נוצר עם 🌲 Access Nature",
      makingAccessible: "הופכים שטחים פתוחים לנגישים לכולם",
      end: "סיום",
      
      // Good For section
      wheelchairs: "כיסאות גלגלים",
      strollers: "עגלות",
      walkers: "הליכונים",
      serviceDogs: "כלבי שירות",
      seniors: "קשישים",
      scooters: "קטנועים",
      
      // Conditions section
      surface: "משטח",
      excellent: "מצוין",
      fair: "סביר",
      poor: "גרוע",
      overgrown: "צמחייה פרועה",
      flatMild: "שטוח/קל",
      plenty: "הרבה",
      
      // Facilities
      spaces: "מקומות",
      yes: "כן",
      
      // Heads up section
      importantNotes: "הערות חשובות",
      beAware: "שים לב לתצפיות הבאות",

      // Steep sections
      steepSectionDesc: "קטע של {length} מ' (הפרש גובה {elevation} מ', שיפוע מקסימלי {grade}%)",

      // Warning messages
      warningAssistanceNeeded: "ייתכן שתידרש סיוע באזורים מסוימים",
      warningSteepNotAccessible: "קיימים מדרונות תלולים - לא נגיש לכיסאות גלגלים",
      warningModerateSlopes: "מדרונות בינוניים - ייתכן שתידרש עזרה",
      warningNoShade: "אין צל - הביאו הגנה מפני השמש ומים",
      warningPoorSurface: "המשטח במצב גרוע - היזהרו ממכשולים",
      warningOvergrown: "השביל עשוי להיות צפוף בצמחייה במקומות מסוימים",

      // Survey detail labels
      surveyTrailName: "שם השביל",
      surveyLocation: "מיקום",
      surveyRouteType: "סוג המסלול",
      surveyDifficulty: "רמת קושי",
      surveyWheelchairAccess: "נגישות לכיסא גלגלים",
      surveyTrailSurface: "משטח השביל",
      surveySurfaceQuality: "איכות המשטח",
      surveyTrailSlopes: "שיפועי השביל",
      surveyAccessibleParking: "חניה נגישה",
      surveyParkingSpaces: "מספר מקומות חניה",
      surveyRestrooms: "שירותים",
      surveyWaterFountains: "ברזיות מים",
      surveySeating: "מקומות ישיבה",
      surveyShadeCoverage: "כיסוי צל",
      surveyLighting: "תאורה",
      surveySignage: "שילוט",
      surveyVisualAccess: "נגישות ויזואלית",
      surveyTrailWidth: "רוחב השביל",
      surveyPicnicAreas: "אזורי פיקניק",
      surveyAccessibleViewpoint: "נקודת תצפית נגישה",
      surveyEmergencyAccess: "גישה לשירותי חירום",
      surveyAdditionalNotes: "הערות נוספות",
      noSurveyData: "אין נתוני סקר זמינים."
    }
  };

  /**
   * Get translation for current language
   */
  t(key, lang = 'en') {
    return TrailGuideGeneratorV2.translations[lang]?.[key] || 
           TrailGuideGeneratorV2.translations['en']?.[key] || 
           key;
  }

  /**
   * Generate the enhanced trail guide HTML
   * @param {Array} routeData - Array of route points (locations, photos, notes)
   * @param {Object} routeInfo - Route metadata (name, distance, time, date)
   * @param {Object} accessibilityData - Accessibility survey data
   * @param {string} lang - Language code ('en' or 'he')
   * @returns {string} Complete HTML document
   */
  generateHTML(routeData, routeInfo, accessibilityData, lang = null) {
    // Get language from localStorage if not provided
    const currentLang = lang || localStorage.getItem('accessNature_language') || 'en';
    const isRTL = currentLang === 'he';
    const t = (key) => this.t(key, currentLang);
    
    // Debug logging
    console.log('🗺️ TrailGuideV2 - Generating HTML with:');
    console.log('  - routeData points:', routeData?.length || 0);
    console.log('  - photos:', routeData?.filter(p => p.type === 'photo').length || 0);
    console.log('  - notes:', routeData?.filter(p => p.type === 'text').length || 0);
    console.log('  - accessibilityData:', accessibilityData);
    console.log('  - language:', currentLang);
    
    const locationPoints = routeData.filter(p => p.type === 'location' && p.coords);
    const photos = routeData.filter(p => p.type === 'photo');
    const notes = routeData.filter(p => p.type === 'text');
    
    console.log('  - Filtered photos:', photos);
    console.log('  - Filtered notes:', notes);
    
    const date = new Date(routeInfo.date);
    const dateLocale = currentLang === 'he' ? 'he-IL' : 'en-US';
    const formattedDate = date.toLocaleDateString(dateLocale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Determine accessibility level
    const accessLevel = this.getAccessibilityLevel(accessibilityData);
    
    // Build timeline items
    const timelineItems = this.buildTimeline(routeData, routeInfo, currentLang);
    
    // Calculate route bounds for map
    let bounds = null;
    if (locationPoints.length > 0) {
      const lats = locationPoints.map(p => p.coords.lat);
      const lngs = locationPoints.map(p => p.coords.lng);
      bounds = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs)
      };
    }

    return `<!DOCTYPE html>
<html lang="${currentLang}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${routeInfo.name} - ${t('trailGuide')}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        ${this.getStyles(isRTL)}
    </style>
</head>
<body>
    <div class="tg-container" id="trailGuideContent">
        <!-- Header -->
        <header class="tg-header">
            <div class="tg-header-content">
                <span class="tg-badge">🌲 <span data-i18n="trailGuide">${t('trailGuide')}</span></span>
                <h1 class="tg-title">${routeInfo.name}</h1>
                <p class="tg-location">${accessibilityData?.location || t('locationNotSpecified')}</p>
                <p class="tg-date"><span data-i18n="documentedOn">${t('documentedOn')}</span> ${formattedDate}</p>
            </div>
        </header>

        <!-- Accessibility Banner -->
        <div class="tg-access-banner ${accessLevel.class}">
            <div class="tg-access-icon">${accessLevel.icon}</div>
            <div class="tg-access-info">
                <div class="tg-access-level" data-level-key="${accessLevel.levelKey}">${this.getAccessLevelLabel(accessLevel.level, currentLang)}</div>
                <div class="tg-access-desc" data-desc-key="${accessLevel.descKey}">${this.getAccessLevelDesc(accessLevel.level, currentLang)}</div>
            </div>
        </div>

        <!-- Action Bar -->
        <div class="tg-action-bar" id="actionBar">
            <!-- Language Toggle -->
            <button class="tg-action-btn tg-action-lang" onclick="toggleGuideLanguage()" title="Switch Language">
                <span id="langFlag">${isRTL ? '🇬🇧' : '🇮🇱'}</span>
            </button>
            ${locationPoints.length > 0 ? `
            <div class="tg-action-dropdown">
                <button class="tg-action-btn tg-action-navigate" onclick="toggleNavDropdown(event)">
                    🧭 <span data-i18n="navigateToStart">${t('navigateToStart')}</span>
                </button>
                <div id="navDropdown" class="tg-dropdown-content">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${locationPoints[0].coords.lat},${locationPoints[0].coords.lng}&travelmode=driving" target="_blank" rel="noopener" onclick="closeNavDropdown()">
                        📍 <span data-i18n="googleMaps">${t('googleMaps')}</span>
                    </a>
                    <a href="https://waze.com/ul?ll=${locationPoints[0].coords.lat},${locationPoints[0].coords.lng}&navigate=yes" target="_blank" rel="noopener" onclick="closeNavDropdown()">
                        🚗 <span data-i18n="waze">${t('waze')}</span>
                    </a>
                </div>
            </div>
            ` : ''}
            <button class="tg-action-btn tg-action-pdf" id="pdfBtn" onclick="downloadPDF()">
                📥 <span data-i18n="downloadPdf">${t('downloadPdf')}</span>
            </button>
            <button class="tg-action-btn tg-action-details" onclick="closeNavDropdown(); document.getElementById('surveyDetails').classList.toggle('show')">
                📋 <span data-i18n="fullSurveyDetails">${t('fullSurveyDetails')}</span>
            </button>
        </div>

        <!-- Hidden Survey Details Panel -->
        <div id="surveyDetails" class="tg-survey-panel">
            <h3>📋 <span data-i18n="completeSurvey">${t('completeSurvey')}</span></h3>
            ${this.renderFullSurveyDetails(accessibilityData, currentLang)}
        </div>

        <!-- Quick Stats -->
        <div class="tg-stats-row">
            <div class="tg-stat">
                <span class="tg-stat-value">${(routeInfo.totalDistance || 0).toFixed(1)}</span>
                <span class="tg-stat-label" data-i18n="km">${t('km')}</span>
            </div>
            <div class="tg-stat">
                <span class="tg-stat-value">${this.formatDuration(routeInfo.elapsedTime || 0)}</span>
                <span class="tg-stat-label" data-i18n="duration">${t('duration')}</span>
            </div>
            <div class="tg-stat">
                <span class="tg-stat-value">${this.getDifficultyEmoji(accessibilityData)}</span>
                <span class="tg-stat-label" data-i18n="${this.getDifficultyKey(accessibilityData)}">${this.getDifficultyLabel(accessibilityData, currentLang)}</span>
            </div>
            <div class="tg-stat">
                <span class="tg-stat-value">${this.getSurfaceIcon(accessibilityData)}</span>
                <span class="tg-stat-label" data-i18n="${this.getSurfaceKey(accessibilityData)}">${this.getSurfaceLabel(accessibilityData, currentLang)}</span>
            </div>
        </div>

        <!-- Elevation Profile -->
        ${this.renderElevationSection(routeData, currentLang)}

        <!-- Good For Section -->
        ${this.renderGoodForSection(accessibilityData, currentLang)}

        <!-- Trail Conditions -->
        ${this.renderConditionsSection(accessibilityData, currentLang)}

        <!-- Facilities -->
        ${this.renderFacilitiesSection(accessibilityData, currentLang)}

        <!-- Map Section -->
        ${locationPoints.length > 0 ? `
        <section class="tg-section">
            <h2 class="tg-section-title">🗺️ <span data-i18n="routeMap">${t('routeMap')}</span></h2>
            <div class="tg-map-container">
                <div id="map"></div>
            </div>
            <p class="tg-map-hint" data-i18n="clickMarkers">${t('clickMarkers')}</p>
            <div class="tg-map-legend">
                <div class="tg-legend-item"><div class="tg-legend-dot start"></div> <span data-i18n="start">${t('start')}</span></div>
                <div class="tg-legend-item"><div class="tg-legend-dot end"></div> <span data-i18n="finish">${t('finish')}</span></div>
                <div class="tg-legend-item"><div class="tg-legend-dot photo"></div> <span data-i18n="photos">${t('photos')}</span></div>
                <div class="tg-legend-item"><div class="tg-legend-dot note"></div> <span data-i18n="notes">${t('notes')}</span></div>
            </div>
        </section>
        ` : ''}

        <!-- Timeline Section -->
        ${timelineItems.length > 0 ? `
        <section class="tg-section">
            <h2 class="tg-section-title">📍 <span data-i18n="trailTimeline">${t('trailTimeline')}</span></h2>
            <div class="tg-timeline">
                ${timelineItems.map(item => this.renderTimelineItem(item)).join('')}
            </div>
        </section>
        ` : ''}

        <!-- Heads Up Section -->
        ${this.renderHeadsUpSection(accessibilityData, notes, currentLang)}

        <!-- Footer -->
        <footer class="tg-footer">
            <p><span data-i18n="createdWith">${t('createdWith')}</span></p>
            <p><span data-i18n="makingAccessible">${t('makingAccessible')}</span></p>
        </footer>
    </div>

    <!-- PDF Loading Overlay (outside trailGuideContent to not be captured in PDF) -->
    <div id="pdfLoadingOverlay" class="tg-pdf-overlay" style="display: none;">
        <div class="tg-pdf-loading">
            <div class="tg-pdf-spinner"></div>
            <p>${t('generatingPdf')}</p>
            <p class="tg-pdf-hint">${t('mayTakeSeconds')}</p>
        </div>
    </div>

    <!-- Map Script -->
    ${locationPoints.length > 0 ? this.getMapScript(locationPoints, bounds, photos, notes) : ''}
    
    <!-- PDF Download Script -->
    <script>
        // Embedded translations for standalone functionality
        const guideTranslations = ${JSON.stringify(TrailGuideGeneratorV2.translations)};
        
        // Current language state
        let currentGuideLang = '${currentLang}';
        
        // Language toggle function
        function toggleGuideLanguage() {
            currentGuideLang = currentGuideLang === 'en' ? 'he' : 'en';
            const isRTL = currentGuideLang === 'he';
            
            // Update document direction
            document.documentElement.lang = currentGuideLang;
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            
            // Update flag button
            const flagBtn = document.getElementById('langFlag');
            if (flagBtn) {
                flagBtn.textContent = isRTL ? '🇬🇧' : '🇮🇱';
            }
            
            // Update all data-i18n elements
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = guideTranslations[currentGuideLang]?.[key] || guideTranslations['en']?.[key] || key;
                el.textContent = translation;
            });
            
            // Update accessibility level text
            const accessLevel = document.querySelector('.tg-access-level');
            const accessDesc = document.querySelector('.tg-access-desc');
            if (accessLevel) {
                const levelKey = accessLevel.getAttribute('data-level-key');
                if (levelKey) {
                    accessLevel.textContent = guideTranslations[currentGuideLang]?.[levelKey] || accessLevel.textContent;
                }
            }
            if (accessDesc) {
                const descKey = accessDesc.getAttribute('data-desc-key');
                if (descKey) {
                    accessDesc.textContent = guideTranslations[currentGuideLang]?.[descKey] || accessDesc.textContent;
                }
            }
            
            console.log('Trail guide language switched to:', currentGuideLang);
        }
        
        // Navigation dropdown handlers
        function toggleNavDropdown(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('navDropdown');
            dropdown.classList.toggle('show');
        }
        
        function closeNavDropdown() {
            const dropdown = document.getElementById('navDropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('navDropdown');
            const navBtn = document.querySelector('.tg-action-navigate');
            if (dropdown && !dropdown.contains(event.target) && !navBtn?.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        // Resize and convert image to a compact data URL for PDF
        // PDF at A4 doesn't need huge images - 800px wide is plenty
        function resizeImageToDataURL(img, maxWidth = 800, quality = 0.75) {
            const canvas = document.createElement('canvas');
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;

            // Scale down if wider than maxWidth
            if (w > maxWidth) {
                h = Math.round(h * (maxWidth / w));
                w = maxWidth;
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            return canvas.toDataURL('image/jpeg', quality);
        }

        // Prepare images for PDF: fetch, resize, and convert to compact data URLs
        async function prepareImagesForPDF(element) {
            const images = Array.from(element.querySelectorAll('img'));
            console.log('📷 Preparing', images.length, 'images for PDF...');

            let converted = 0;
            let failed = 0;

            // Process images sequentially to avoid memory overload
            for (let i = 0; i < images.length; i++) {
                const img = images[i];

                // Skip if already a data URL
                if (img.src.startsWith('data:')) {
                    converted++;
                    continue;
                }

                // Wait for image to load if needed
                if (!img.complete) {
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                        setTimeout(resolve, 8000);
                    });
                }

                // Skip broken images
                if (!img.naturalWidth) {
                    console.warn('⚠️ Image', i + 1, 'not loaded, skipping');
                    failed++;
                    continue;
                }

                try {
                    // Try fetching and loading into a clean CORS-enabled image
                    const response = await fetch(img.src, { mode: 'cors' });
                    if (!response.ok) throw new Error('Fetch ' + response.status);

                    const blob = await response.blob();
                    const blobURL = URL.createObjectURL(blob);

                    // Load into a fresh image element for clean canvas access
                    const tempImg = new Image();
                    tempImg.crossOrigin = 'anonymous';
                    await new Promise((resolve, reject) => {
                        tempImg.onload = resolve;
                        tempImg.onerror = reject;
                        setTimeout(reject, 8000);
                        tempImg.src = blobURL;
                    });

                    // Resize and convert to compact data URL
                    const dataURL = resizeImageToDataURL(tempImg);
                    img.src = dataURL;
                    URL.revokeObjectURL(blobURL);
                    converted++;
                    if ((i + 1) % 5 === 0 || i === images.length - 1) {
                        console.log('📷 Progress:', i + 1, '/', images.length);
                    }
                } catch (error) {
                    // Fallback: try direct canvas from the displayed image
                    try {
                        const dataURL = resizeImageToDataURL(img);
                        img.src = dataURL;
                        converted++;
                    } catch (e2) {
                        console.warn('⚠️ Image', i + 1, 'failed:', error.message);
                        failed++;
                    }
                }
            }

            console.log('📷 Done:', converted, 'converted,', failed, 'failed of', images.length, 'total');
        }

        // PDF Download with loading overlay
        async function downloadPDF() {
            // Show loading overlay
            const overlay = document.getElementById('pdfLoadingOverlay');
            const btn = document.getElementById('pdfBtn');

            if (overlay) overlay.style.display = 'flex';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '⏳ ' + (guideTranslations[currentGuideLang]?.generatingPdf || 'Generating...');
            }

            // Close any open dropdowns
            closeNavDropdown();

            // Hide action bar and show survey details for PDF
            const actionBar = document.getElementById('actionBar');
            const surveyPanel = document.getElementById('surveyDetails');
            if (actionBar) actionBar.style.display = 'none';
            if (surveyPanel) surveyPanel.classList.add('show');

            const element = document.getElementById('trailGuideContent');
            const filename = '${routeInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_trail_guide.pdf';

            // Determine if RTL mode
            const isRTL = document.documentElement.dir === 'rtl';

            try {
                // Convert images to data URLs to bypass CORS issues
                await prepareImagesForPDF(element);

                // Add PDF export class for print-specific CSS overrides
                document.body.classList.add('pdf-export');

                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.8 },
                    html2canvas: {
                        scale: 1.5,
                        useCORS: true,
                        allowTaint: true,
                        letterRendering: false,
                        scrollY: 0,
                        logging: false,
                        foreignObjectRendering: false,
                        imageTimeout: 0,
                        removeContainer: true
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };

                await html2pdf().set(opt).from(element).save();

                // Remove PDF export class
                document.body.classList.remove('pdf-export');

                // Restore UI
                if (actionBar) actionBar.style.display = 'flex';
                if (surveyPanel) surveyPanel.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                if (btn) {
                    btn.innerHTML = '📥 ' + (guideTranslations[currentGuideLang]?.downloadPdf || 'Download PDF');
                    btn.disabled = false;
                }
            } catch (err) {
                console.error('PDF generation failed:', err);
                document.body.classList.remove('pdf-export');
                if (actionBar) actionBar.style.display = 'flex';
                if (surveyPanel) surveyPanel.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                if (btn) {
                    btn.innerHTML = '📥 ' + (guideTranslations[currentGuideLang]?.downloadPdf || 'Download PDF');
                    btn.disabled = false;
                }
                alert('PDF generation failed. Please try again or use Print to PDF.');
            }
        }
    </script>
</body>
</html>`;
  }

  getAccessibilityLevel(data) {
    const wheelchair = data?.wheelchairAccess || '';
    const summary = data?.accessibilitySummary || '';
    
    // Check wheelchair access first, then summary
    const checkValue = wheelchair || summary;
    
    if (checkValue.toLowerCase().includes('fully') || checkValue.toLowerCase() === 'accessible') {
      return {
        class: 'fully',
        icon: '♿',
        level: 'fully',
        levelKey: 'fullyAccessible',
        descKey: 'suitableForMost'
      };
    } else if (checkValue.toLowerCase().includes('partial') || checkValue.toLowerCase().includes('assistance')) {
      return {
        class: 'partial',
        icon: '⚠️',
        level: 'partial',
        levelKey: 'partiallyAccessible',
        descKey: 'someBarriers'
      };
    } else if (checkValue.toLowerCase().includes('not')) {
      return {
        class: 'not',
        icon: '🚫',
        level: 'not',
        levelKey: 'limitedAccessibility',
        descKey: 'majorBarriers'
      };
    }
    
    return {
      class: 'unknown',
      icon: '❓',
      level: 'unknown',
      levelKey: 'notAssessed',
      descKey: 'assessmentNeeded'
    };
  }

  /**
   * Get translated accessibility level label
   */
  getAccessLevelLabel(level, lang = 'en') {
    const labels = {
      en: {
        fully: 'FULLY ACCESSIBLE',
        partial: 'PARTIALLY ACCESSIBLE',
        not: 'LIMITED ACCESSIBILITY',
        unknown: 'ACCESSIBILITY NOT ASSESSED'
      },
      he: {
        fully: 'נגיש לחלוטין',
        partial: 'נגיש חלקית',
        not: 'נגישות מוגבלת',
        unknown: 'נגישות לא הוערכה'
      }
    };
    return labels[lang]?.[level] || labels['en']?.[level] || level;
  }

  /**
   * Get translated accessibility level description
   */
  getAccessLevelDesc(level, lang = 'en') {
    const descs = {
      en: {
        fully: 'Suitable for wheelchairs, strollers, and mobility aids',
        partial: 'Some sections may require assistance or have barriers',
        not: 'Significant barriers present - check details below',
        unknown: 'No accessibility information available for this trail'
      },
      he: {
        fully: 'מתאים לכיסאות גלגלים, עגלות ואמצעי ניידות',
        partial: 'חלק מהקטעים עשויים לדרוש סיוע או מכילים מכשולים',
        not: 'קיימים מכשולים משמעותיים - בדוק פרטים למטה',
        unknown: 'אין מידע נגישות זמין לשביל זה'
      }
    };
    return descs[lang]?.[level] || descs['en']?.[level] || '';
  }

  formatDuration(milliseconds) {
    if (!milliseconds) return '--';
    
    // Timer always stores elapsed time in milliseconds
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getDifficultyEmoji(data) {
    const slopes = data?.trailSlopes || '';
    const quality = data?.surfaceQuality || '';
    
    if (slopes.includes('Steep') || quality.includes('Poor')) return '😰';
    if (slopes.includes('Moderate') || quality.includes('Fair')) return '😐';
    return '😊';
  }

  getDifficultyKey(data) {
    const slopes = data?.trailSlopes || '';
    const quality = data?.surfaceQuality || '';
    if (slopes.includes('Steep') || quality.includes('Poor')) return 'challenging';
    if (slopes.includes('Moderate') || quality.includes('Fair')) return 'moderate';
    return 'easy';
  }

  getDifficultyLabel(data, lang = 'en') {
    return this.t(this.getDifficultyKey(data), lang);
  }

  getSurfaceIcon(data) {
    const surfaces = data?.trailSurface || '';
    const surfaceStr = Array.isArray(surfaces) ? surfaces.join(' ') : surfaces;
    
    if (surfaceStr.includes('Asphalt') || surfaceStr.includes('Concrete')) return '🛣️';
    if (surfaceStr.includes('Wood') || surfaceStr.includes('Deck')) return '🪵';
    if (surfaceStr.includes('Gravel')) return '⚪';
    if (surfaceStr.includes('Grass')) return '🌿';
    if (surfaceStr.includes('Mixed')) return '🔀';
    return '🛤️';
  }

  getSurfaceKey(data) {
    const surfaces = data?.trailSurface || '';
    const surfaceStr = Array.isArray(surfaces) ? surfaces[0] : surfaces;
    if (!surfaceStr) return 'unknown';
    if (surfaceStr.includes('Asphalt')) return 'paved';
    if (surfaceStr.includes('Concrete')) return 'concrete';
    if (surfaceStr.includes('Wood')) return 'boardwalk';
    if (surfaceStr.includes('Gravel')) return 'gravel';
    if (surfaceStr.includes('Grass')) return 'grass';
    if (surfaceStr.includes('Mixed')) return 'mixed';
    return 'unknown';
  }

  getSurfaceLabel(data, lang = 'en') {
    return this.t(this.getSurfaceKey(data), lang);
  }

  /**
   * Render elevation profile section
   */
  renderElevationSection(routeData, lang = 'en') {
    const t = (key) => this.t(key, lang);
    
    // Extract location points with elevation data
    const locationPoints = routeData.filter(p => 
      p.type === 'location' && 
      p.coords && 
      p.elevation !== undefined && 
      p.elevation !== null &&
      !isNaN(p.elevation)
    );

    // Need at least 1 point to show elevation data
    if (locationPoints.length === 0) {
      return ''; // Don't show section if no elevation data at all
    }

    // For just 1 point, show simple elevation display
    if (locationPoints.length === 1) {
      const elevation = Math.round(locationPoints[0].elevation);
      return `
        <section class="tg-section tg-elevation">
            <h2 class="tg-section-title">📈 <span data-i18n="elevationProfile">${t('elevationProfile')}</span></h2>
            <div class="tg-elevation-stats" style="justify-content: center;">
                <div class="tg-elev-stat">
                    <span class="tg-elev-icon" style="color: #4CAF50;">⛰️</span>
                    <span class="tg-elev-value">${elevation}m</span>
                    <span class="tg-elev-label" data-i18n="elevation">${t('elevation')}</span>
                </div>
            </div>
            <p style="text-align: center; color: #888; font-size: 0.85rem; margin-top: 12px;" data-i18n="singlePointRecorded">
                ${t('singlePointRecorded')}
            </p>
        </section>
      `;
    }

    // Calculate cumulative distance and build raw elevation data
    let cumulativeDistance = 0;
    const rawElevationData = [];

    for (let i = 0; i < locationPoints.length; i++) {
      const point = locationPoints[i];

      if (i > 0) {
        const prevPoint = locationPoints[i - 1];
        const distance = this.haversineDistance(
          prevPoint.coords.lat, prevPoint.coords.lng,
          point.coords.lat, point.coords.lng
        );
        cumulativeDistance += distance;
      }

      rawElevationData.push({
        distance: cumulativeDistance,
        elevation: point.elevation
      });
    }

    // Apply smoothing to reduce GPS noise
    const elevationData = this.smoothElevationData(rawElevationData);

    // Calculate stats from smoothed data
    const elevations = elevationData.map(p => p.elevation);
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);

    // Calculate total ascent and descent with threshold to ignore noise
    const { totalAscent, totalDescent } = this.calculateElevationGainLoss(elevationData, 3);

    // Calculate gradient segments with minimum segment length to reduce noise
    const segments = this.calculateGradientSegments(elevationData, 0.015);

    // Analyze steep sections (only significant ones will remain after smoothing)
    const steepAnalysis = this.analyzeSteepSections(segments, lang);

    // Generate SVG chart
    const chartSvg = this.generateElevationSvg(elevationData, segments, 600, 180);

    return `
        <section class="tg-section tg-elevation">
            <h2 class="tg-section-title">📈 <span data-i18n="elevationProfile">${t('elevationProfile')}</span></h2>

            <!-- Elevation Stats -->
            <div class="tg-elevation-stats">
                <div class="tg-elev-stat">
                    <span class="tg-elev-icon" style="color: #4CAF50;">↑</span>
                    <span class="tg-elev-value">${Math.round(totalAscent)}m</span>
                    <span class="tg-elev-label" data-i18n="ascent">${t('ascent')}</span>
                </div>
                <div class="tg-elev-stat">
                    <span class="tg-elev-icon" style="color: #f44336;">↓</span>
                    <span class="tg-elev-value">${Math.round(totalDescent)}m</span>
                    <span class="tg-elev-label" data-i18n="descent">${t('descent')}</span>
                </div>
                <div class="tg-elev-stat">
                    <span class="tg-elev-icon" style="color: #2196F3;">▽</span>
                    <span class="tg-elev-value">${Math.round(minElevation)}m</span>
                    <span class="tg-elev-label" data-i18n="minElevation">${t('minElevation')}</span>
                </div>
                <div class="tg-elev-stat">
                    <span class="tg-elev-icon" style="color: #FF9800;">△</span>
                    <span class="tg-elev-value">${Math.round(maxElevation)}m</span>
                    <span class="tg-elev-label" data-i18n="maxElevation">${t('maxElevation')}</span>
                </div>
            </div>

            <!-- Elevation Chart -->
            <div class="tg-elevation-chart">
                ${chartSvg}
            </div>

            <!-- Gradient Legend -->
            <div class="tg-gradient-legend">
                <span class="tg-legend-item"><span class="tg-legend-color" style="background: #4CAF50;"></span> 0-5% <span data-i18n="flat">${t('flat')}</span></span>
                <span class="tg-legend-item"><span class="tg-legend-color" style="background: #FFC107;"></span> 5-10% <span data-i18n="moderate">${t('moderate')}</span></span>
                <span class="tg-legend-item"><span class="tg-legend-color" style="background: #FF9800;"></span> 10-15% <span data-i18n="steep">${t('steep')}</span></span>
                <span class="tg-legend-item"><span class="tg-legend-color" style="background: #f44336;"></span> >15% <span data-i18n="verySteep">${t('verySteep')}</span></span>
            </div>

            ${steepAnalysis.hasSteepSections ? `
            <!-- Steep Sections Warning -->
            <div class="tg-steep-warning">
                <div class="tg-steep-header">
                    <span class="tg-steep-icon">⚠️</span>
                    <span class="tg-steep-title"><span data-i18n="steepSections">${t('steepSections')}</span> (${steepAnalysis.count})</span>
                </div>
                <div class="tg-steep-details">
                    ${steepAnalysis.details}
                </div>
            </div>
            ` : ''}
        </section>
    `;
  }

  /**
   * Get gradient category based on percentage
   */
  getGradientCategory(gradientPercent) {
    if (gradientPercent <= 5) return 'flat';
    if (gradientPercent <= 10) return 'moderate';
    if (gradientPercent <= 15) return 'steep';
    return 'verysteep';
  }

  /**
   * Get color for gradient category
   */
  getGradientColor(category) {
    const colors = {
      flat: '#4CAF50',
      moderate: '#FFC107',
      steep: '#FF9800',
      verysteep: '#f44336'
    };
    return colors[category] || colors.flat;
  }

  /**
   * Generate SVG elevation chart
   */
  generateElevationSvg(elevationData, segments, width, height) {
    const padding = { top: 15, right: 15, bottom: 25, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const elevations = elevationData.map(p => p.elevation);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const elevRange = maxElev - minElev || 1;
    
    const maxDist = elevationData[elevationData.length - 1].distance;

    // Scale functions
    const xScale = (dist) => padding.left + (dist / maxDist) * chartWidth;
    const yScale = (elev) => padding.top + chartHeight - ((elev - minElev) / elevRange) * chartHeight;

    // Build filled area path
    let areaPath = `M ${xScale(elevationData[0].distance)} ${padding.top + chartHeight}`;
    areaPath += ` L ${xScale(elevationData[0].distance)} ${yScale(elevationData[0].elevation)}`;
    
    for (let i = 1; i < elevationData.length; i++) {
      areaPath += ` L ${xScale(elevationData[i].distance)} ${yScale(elevationData[i].elevation)}`;
    }
    
    areaPath += ` L ${xScale(elevationData[elevationData.length - 1].distance)} ${padding.top + chartHeight} Z`;

    // Generate colored line segments
    let segmentLines = '';
    segments.forEach(seg => {
      const x1 = xScale(seg.startDistance);
      const y1 = yScale(seg.startElevation);
      const x2 = xScale(seg.endDistance);
      const y2 = yScale(seg.endElevation);
      const color = this.getGradientColor(seg.category);
      
      segmentLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
        stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    });

    // Y-axis labels (5 labels)
    let yLabels = '';
    for (let i = 0; i < 5; i++) {
      const elev = minElev + (elevRange / 4) * i;
      const y = yScale(elev);
      yLabels += `<text x="${padding.left - 5}" y="${y + 3}" 
        fill="#888" font-size="9" text-anchor="end">${Math.round(elev)}</text>`;
    }
    
    // X-axis labels (5 labels)
    let xLabels = '';
    for (let i = 0; i < 5; i++) {
      const dist = (maxDist / 4) * i;
      const x = xScale(dist);
      xLabels += `<text x="${x}" y="${height - 5}" 
        fill="#888" font-size="9" text-anchor="middle">${dist.toFixed(1)}km</text>`;
    }

    return `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <!-- Filled area -->
        <path d="${areaPath}" fill="rgba(76, 175, 80, 0.15)" stroke="none"/>
        
        <!-- Colored line segments -->
        ${segmentLines}
        
        <!-- Axis labels -->
        ${yLabels}
        ${xLabels}
        
        <!-- Y-axis title -->
        <text x="12" y="${height / 2}" 
          transform="rotate(-90, 12, ${height / 2})"
          fill="#888" font-size="9" text-anchor="middle">m</text>
      </svg>
    `;
  }

  /**
   * Analyze steep sections
   */
  analyzeSteepSections(segments, lang = 'en') {
    const t = (key) => this.t(key, lang);
    const steepSegments = segments.filter(s =>
      s.category === 'steep' || s.category === 'verysteep'
    );

    if (steepSegments.length === 0) {
      return { hasSteepSections: false };
    }

    // Group consecutive steep sections
    const groups = [];
    let currentGroup = null;

    steepSegments.forEach(seg => {
      if (!currentGroup) {
        currentGroup = { ...seg, maxGradient: Math.abs(seg.gradient) };
      } else if (Math.abs(seg.startDistance - currentGroup.endDistance) < 0.05) {
        currentGroup.endDistance = seg.endDistance;
        currentGroup.endElevation = seg.endElevation;
        currentGroup.maxGradient = Math.max(currentGroup.maxGradient, Math.abs(seg.gradient));
      } else {
        groups.push(currentGroup);
        currentGroup = { ...seg, maxGradient: Math.abs(seg.gradient) };
      }
    });

    if (currentGroup) groups.push(currentGroup);

    const details = groups.map(g => {
      const length = ((g.endDistance - g.startDistance) * 1000).toFixed(0);
      const elevChange = Math.abs(g.endElevation - g.startElevation).toFixed(0);
      const direction = g.gradient > 0 ? '↗️' : '↘️';
      const desc = t('steepSectionDesc')
        .replace('{length}', length)
        .replace('{elevation}', elevChange)
        .replace('{grade}', g.maxGradient.toFixed(0));
      return `<div class="tg-steep-item">${direction} ${desc}</div>`;
    }).join('');

    return {
      hasSteepSections: true,
      count: groups.length,
      details: details
    };
  }

  /**
   * Haversine distance calculation (km)
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Smooth elevation data to reduce GPS noise
   * Uses a combination of outlier removal and moving average
   * @param {Array} elevationData - Array of {distance, elevation} objects
   * @returns {Array} - Smoothed elevation data
   */
  smoothElevationData(elevationData) {
    if (elevationData.length < 3) return elevationData;

    // Step 1: Remove outliers using median-based detection
    const cleaned = this.removeElevationOutliers(elevationData);

    // Step 2: Apply weighted moving average
    const windowSize = Math.min(5, Math.floor(cleaned.length / 3));
    if (windowSize < 2) return cleaned;

    const smoothed = [];
    for (let i = 0; i < cleaned.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(cleaned.length, i + Math.floor(windowSize / 2) + 1);

      // Weighted average - center point has more weight
      let weightedSum = 0;
      let totalWeight = 0;
      for (let j = start; j < end; j++) {
        const distFromCenter = Math.abs(j - i);
        const weight = 1 / (distFromCenter + 1); // Center gets weight 1, neighbors get 0.5, 0.33, etc.
        weightedSum += cleaned[j].elevation * weight;
        totalWeight += weight;
      }

      smoothed.push({
        distance: cleaned[i].distance,
        elevation: weightedSum / totalWeight
      });
    }

    return smoothed;
  }

  /**
   * Remove elevation outliers using median-based detection
   * @param {Array} elevationData - Array of {distance, elevation} objects
   * @returns {Array} - Cleaned elevation data
   */
  removeElevationOutliers(elevationData) {
    if (elevationData.length < 5) return elevationData;

    const cleaned = [elevationData[0]]; // Keep first point

    for (let i = 1; i < elevationData.length - 1; i++) {
      const prev = elevationData[i - 1];
      const curr = elevationData[i];
      const next = elevationData[i + 1];

      // Calculate distances
      const distToPrev = (curr.distance - prev.distance) * 1000; // meters
      const distToNext = (next.distance - curr.distance) * 1000; // meters

      // Calculate elevation changes
      const elevChangeToPrev = curr.elevation - prev.elevation;
      const elevChangeToNext = next.elevation - curr.elevation;

      // Detect spike: large change then reversal, over short distance
      const isSpike = (
        Math.abs(elevChangeToPrev) > 10 && // More than 10m change
        Math.sign(elevChangeToPrev) !== Math.sign(elevChangeToNext) && // Direction reversal
        Math.abs(elevChangeToNext) > 10 && // Reverses significantly
        distToPrev < 50 && distToNext < 50 // Over short distance
      );

      // Detect unrealistic gradient (>100% grade is very rare in nature)
      const gradientToPrev = distToPrev > 0 ? Math.abs(elevChangeToPrev / distToPrev) * 100 : 0;
      const gradientToNext = distToNext > 0 ? Math.abs(elevChangeToNext / distToNext) * 100 : 0;
      const hasUnrealisticGradient = gradientToPrev > 100 || gradientToNext > 100;

      if (isSpike || hasUnrealisticGradient) {
        // Replace with interpolated value
        const interpolatedElev = (prev.elevation + next.elevation) / 2;
        cleaned.push({
          distance: curr.distance,
          elevation: interpolatedElev
        });
      } else {
        cleaned.push(curr);
      }
    }

    cleaned.push(elevationData[elevationData.length - 1]); // Keep last point
    return cleaned;
  }

  /**
   * Calculate elevation gain/loss with a threshold to ignore small fluctuations
   * @param {Array} elevationData - Smoothed elevation data
   * @param {number} threshold - Minimum elevation change to count (meters)
   * @returns {Object} - {totalAscent, totalDescent}
   */
  calculateElevationGainLoss(elevationData, threshold = 2) {
    if (elevationData.length < 2) {
      return { totalAscent: 0, totalDescent: 0 };
    }

    let totalAscent = 0;
    let totalDescent = 0;
    let pendingChange = 0;
    let lastSignificantElev = elevationData[0].elevation;
    let direction = 0; // 0 = undetermined, 1 = ascending, -1 = descending

    for (let i = 1; i < elevationData.length; i++) {
      const diff = elevationData[i].elevation - lastSignificantElev;

      // Check if we've accumulated enough change to count
      if (Math.abs(diff) >= threshold) {
        if (diff > 0) {
          // If we were descending, first apply any pending descent
          if (direction === -1 && pendingChange < 0) {
            totalDescent += Math.abs(pendingChange);
          }
          totalAscent += diff;
          direction = 1;
          pendingChange = 0;
        } else {
          // If we were ascending, first apply any pending ascent
          if (direction === 1 && pendingChange > 0) {
            totalAscent += pendingChange;
          }
          totalDescent += Math.abs(diff);
          direction = -1;
          pendingChange = 0;
        }
        lastSignificantElev = elevationData[i].elevation;
      } else {
        // Accumulate small changes
        pendingChange = diff;
      }
    }

    return {
      totalAscent: Math.round(totalAscent),
      totalDescent: Math.round(totalDescent)
    };
  }

  /**
   * Calculate gradient segments from smoothed data with minimum segment length
   * @param {Array} elevationData - Smoothed elevation data
   * @param {number} minSegmentLength - Minimum segment length in km
   * @returns {Array} - Gradient segments
   */
  calculateGradientSegments(elevationData, minSegmentLength = 0.02) {
    if (elevationData.length < 2) return [];

    const segments = [];
    let segmentStart = 0;

    for (let i = 1; i < elevationData.length; i++) {
      const segmentDist = elevationData[i].distance - elevationData[segmentStart].distance;

      // Only calculate gradient for segments that are long enough
      if (segmentDist >= minSegmentLength || i === elevationData.length - 1) {
        const startElev = elevationData[segmentStart].elevation;
        const endElev = elevationData[i].elevation;
        const horizontalDistance = segmentDist * 1000; // Convert to meters
        const elevationChange = endElev - startElev;
        const gradient = horizontalDistance > 0 ? (elevationChange / horizontalDistance) * 100 : 0;

        segments.push({
          startDistance: elevationData[segmentStart].distance,
          endDistance: elevationData[i].distance,
          startElevation: startElev,
          endElevation: endElev,
          gradient: gradient,
          category: this.getGradientCategory(Math.abs(gradient))
        });

        segmentStart = i;
      }
    }

    return segments;
  }

  renderGoodForSection(data, lang = 'en') {
    const t = (key) => this.t(key, lang);
    const badges = [];
    const wheelchair = data?.wheelchairAccess || '';
    
    if (wheelchair.toLowerCase().includes('fully')) {
      badges.push({ icon: '♿', labelKey: 'wheelchairs' });
      badges.push({ icon: '👶', labelKey: 'strollers' });
    } else if (wheelchair.toLowerCase().includes('partial') || wheelchair.toLowerCase().includes('assistance')) {
      badges.push({ icon: '🦯', labelKey: 'walkers' });
    }
    
    // Always good for these if accessible
    if (!wheelchair.toLowerCase().includes('not')) {
      badges.push({ icon: '🐕', labelKey: 'serviceDogs' });
      badges.push({ icon: '👴', labelKey: 'seniors' });
    }
    
    const surfaces = data?.trailSurface || '';
    const surfaceStr = Array.isArray(surfaces) ? surfaces.join(' ') : surfaces;
    if (surfaceStr.includes('Asphalt') || surfaceStr.includes('Concrete')) {
      badges.push({ icon: '🛴', labelKey: 'scooters' });
    }
    
    if (badges.length === 0) return '';
    
    return `
        <section class="tg-section tg-good-for">
            <h2 class="tg-section-title">✅ <span data-i18n="goodFor">${t('goodFor')}</span></h2>
            <div class="tg-badges">
                ${badges.map(b => `
                    <div class="tg-badge-item">
                        <span class="tg-badge-icon">${b.icon}</span>
                        <span class="tg-badge-label" data-i18n="${b.labelKey}">${t(b.labelKey)}</span>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
  }

  renderConditionsSection(data, lang = 'en') {
    const t = (key) => this.t(key, lang);
    const conditions = [];
    
    // Surface quality
    const quality = data?.surfaceQuality || '';
    if (quality) {
      let percent = 50;
      let labelKey = 'fair';
      if (quality.includes('Excellent')) { percent = 100; labelKey = 'excellent'; }
      else if (quality.includes('Fair')) { percent = 65; labelKey = 'fair'; }
      else if (quality.includes('Poor')) { percent = 30; labelKey = 'poor'; }
      else if (quality.includes('Vegetation')) { percent = 15; labelKey = 'overgrown'; }
      conditions.push({ labelKey: 'surface', percent, textKey: labelKey });
    }
    
    // Slopes
    const slopes = data?.trailSlopes || '';
    if (slopes) {
      let percent = 50;
      let labelKey = 'moderate';
      if (slopes.includes('No slopes') || slopes.includes('mild')) { percent = 100; labelKey = 'flatMild'; }
      else if (slopes.includes('Moderate')) { percent = 50; labelKey = 'moderate'; }
      else if (slopes.includes('Steep')) { percent = 20; labelKey = 'steep'; }
      conditions.push({ labelKey: 'slope', percent, textKey: labelKey });
    }
    
    // Shade
    const shade = data?.shadeCoverage || '';
    if (shade) {
      let percent = 50;
      let labelKey = 'some';
      if (shade.includes('Plenty')) { percent = 100; labelKey = 'plenty'; }
      else if (shade.includes('Intermittent')) { percent = 50; labelKey = 'some'; }
      else if (shade.includes('No shade')) { percent = 10; labelKey = 'none'; }
      conditions.push({ labelKey: 'shade', percent, textKey: labelKey });
    }
    
    if (conditions.length === 0) return '';
    
    return `
        <section class="tg-section">
            <h2 class="tg-section-title">📊 <span data-i18n="trailConditions">${t('trailConditions')}</span></h2>
            <div class="tg-conditions">
                ${conditions.map(c => `
                    <div class="tg-condition-row">
                        <span class="tg-condition-label" data-i18n="${c.labelKey}">${t(c.labelKey)}</span>
                        <div class="tg-condition-bar">
                            <div class="tg-condition-fill ${this.getBarClass(c.percent)}" style="width: ${c.percent}%"></div>
                        </div>
                        <span class="tg-condition-text" data-i18n="${c.textKey}">${t(c.textKey)}</span>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
  }

  getBarClass(percent) {
    if (percent >= 70) return 'good';
    if (percent >= 40) return 'moderate';
    return 'poor';
  }

  renderFacilitiesSection(data, lang = 'en') {
    const t = (key) => this.t(key, lang);
    console.log('🏛️ Rendering facilities with data:', data);
    const facilities = [];
    
    // Helper function to check if value indicates "available"
    const isAvailable = (value) => {
      if (!value) return false;
      if (typeof value === 'string') return value.toLowerCase().includes('available') || value.toLowerCase().includes('yes');
      if (Array.isArray(value)) return value.some(v => v && (v.toLowerCase?.().includes('available') || v.toLowerCase?.().includes('yes')));
      return !!value;
    };
    
    // Helper to check if value indicates "none" or "not available"
    const isNone = (value) => {
      if (!value) return true;
      if (typeof value === 'string') return value.toLowerCase().includes('none') || value.toLowerCase().includes('not available') || value.toLowerCase().includes('no ');
      return false;
    };
    
    // Parking
    const parking = data?.disabledParking;
    console.log('  - disabledParking:', parking, 'isAvailable:', isAvailable(parking));
    if (isAvailable(parking)) {
      const spaces = data?.parkingSpaces || '?';
      facilities.push({ icon: '🅿️', labelKey: 'parking', statusKey: 'spaces', statusPrefix: spaces + ' ', available: true });
    } else {
      facilities.push({ icon: '🅿️', labelKey: 'parking', statusKey: 'none', available: false });
    }

    // Restrooms
    const restrooms = data?.restrooms || '';
    console.log('  - restrooms:', restrooms, 'isNone:', isNone(restrooms));
    if (restrooms && !isNone(restrooms)) {
      facilities.push({ icon: '🚻', labelKey: 'restrooms', statusKey: 'yes', available: true });
    } else {
      facilities.push({ icon: '🚻', labelKey: 'restrooms', statusKey: 'none', available: false });
    }

    // Water
    const water = data?.waterFountains || '';
    console.log('  - waterFountains:', water, 'isNone:', isNone(water));
    if (water && !isNone(water)) {
      facilities.push({ icon: '🚰', labelKey: 'water', statusKey: 'yes', available: true });
    } else {
      facilities.push({ icon: '🚰', labelKey: 'water', statusKey: 'none', available: false });
    }

    // Seating
    const seating = data?.seating || [];
    const seatingArr = Array.isArray(seating) ? seating : [seating];
    console.log('  - seating:', seating, 'arr:', seatingArr);
    if (seatingArr.some(s => s && !isNone(s))) {
      facilities.push({ icon: '🪑', labelKey: 'benches', statusKey: 'yes', available: true });
    } else {
      facilities.push({ icon: '🪑', labelKey: 'benches', statusKey: 'none', available: false });
    }

    // Picnic
    const picnic = data?.picnicAreas;
    console.log('  - picnicAreas:', picnic, 'isAvailable:', isAvailable(picnic));
    if (isAvailable(picnic)) {
      facilities.push({ icon: '🧺', labelKey: 'restAreas', statusKey: 'yes', available: true });
    }

    // Viewpoint
    const viewpoint = data?.accessibleViewpoint;
    console.log('  - accessibleViewpoint:', viewpoint, 'isAvailable:', isAvailable(viewpoint));
    if (isAvailable(viewpoint)) {
      facilities.push({ icon: '🏔️', labelKey: 'facilities', statusKey: 'yes', available: true });
    }

    // Lighting
    const lighting = data?.lighting;
    console.log('  - lighting:', lighting);
    if (lighting && (typeof lighting === 'string' || (Array.isArray(lighting) && lighting.length > 0))) {
      facilities.push({ icon: '💡', labelKey: 'lighting', statusKey: 'yes', available: true });
    }

    console.log('  - Final facilities count:', facilities.length);

    return `
        <section class="tg-section">
            <h2 class="tg-section-title">🏛️ <span data-i18n="facilities">${t('facilities')}</span></h2>
            <div class="tg-facilities">
                ${facilities.map(f => `
                    <div class="tg-facility ${f.available ? 'available' : 'unavailable'}">
                        <span class="tg-facility-icon">${f.icon}</span>
                        <span class="tg-facility-label" data-i18n="${f.labelKey}">${t(f.labelKey)}</span>
                        <span class="tg-facility-status">${f.statusPrefix || ''}<span data-i18n="${f.statusKey}">${t(f.statusKey)}</span></span>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
  }

  buildTimeline(routeData, routeInfo, lang = 'en') {
    const t = (key) => this.t(key, lang);
    console.log('📍 Building timeline with routeData:', routeData?.length, 'points');
    const items = [];
    const startTime = new Date(routeInfo.date).getTime();

    // Add start point
    items.push({
      type: 'start',
      icon: '🟢',
      titleKey: 'start',
      title: t('start'),
      time: null,
      distance: 0
    });

    // Add photos and notes
    routeData.forEach((point, index) => {
      if (point.type === 'photo') {
        // Handle both 'content' (from storage) and 'data' (from live tracking) field names
        const photoContent = point.content || point.data;
        console.log(`  - Photo ${index}: content=${!!point.content}, data=${!!point.data}, result=${!!photoContent}`);
        if (photoContent) {
          items.push({
            type: 'photo',
            icon: '📸',
            titleKey: 'photo',
            title: t('photo'),
            content: photoContent,
            time: point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : null,
            distance: point.distance || null,
            coords: point.coords || null
          });
        }
      } else if (point.type === 'text') {
        // Handle both 'content' (from storage) and 'text'/'data' field names
        const noteContent = point.content || point.text || point.data;
        console.log(`  - Note ${index}: content=${!!point.content}, text=${!!point.text}, data=${!!point.data}, result=${!!noteContent}`);
        if (noteContent) {
          items.push({
            type: 'note',
            icon: '📝',
            titleKey: 'note',
            title: t('note'),
            content: noteContent,
            time: point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : null,
            distance: point.distance || null,
            coords: point.coords || null
          });
        }
      }
    });

    // Add end point
    items.push({
      type: 'end',
      icon: '🔴',
      titleKey: 'end',
      title: t('end'),
      time: null,
      distance: routeInfo.totalDistance || null
    });

    console.log('  - Timeline items created:', items.length, '(start + end + photos + notes)');
    return items;
  }

  renderTimelineItem(item) {
    let content = '';

    if (item.type === 'photo' && item.content) {
      content = `<img src="${item.content}" class="tg-timeline-photo" alt="Trail photo">`;
    } else if (item.type === 'note' && item.content) {
      content = `<p class="tg-timeline-text">"${item.content}"</p>`;
    }

    const distanceText = item.distance ? `${(item.distance / 1000).toFixed(1)} km` : '';

    return `
        <div class="tg-timeline-item ${item.type}">
            <div class="tg-timeline-marker">${item.icon}</div>
            <div class="tg-timeline-content">
                <div class="tg-timeline-header">
                    <span class="tg-timeline-title" data-i18n="${item.titleKey}">${item.title}</span>
                    ${distanceText ? `<span class="tg-timeline-distance">${distanceText}</span>` : ''}
                </div>
                ${content}
            </div>
        </div>
    `;
  }

  renderHeadsUpSection(data, notes, lang = 'en') {
    const t = (key) => this.t(key, lang);
    const warnings = []; // Array of { key, text } or { text } for user notes

    // Check for accessibility concerns
    const wheelchair = data?.wheelchairAccess || '';
    if (wheelchair.toLowerCase().includes('not') || wheelchair.toLowerCase().includes('assistance')) {
      warnings.push({ key: 'warningAssistanceNeeded' });
    }

    const slopes = data?.trailSlopes || '';
    if (slopes.includes('Steep')) {
      warnings.push({ key: 'warningSteepNotAccessible' });
    } else if (slopes.includes('Moderate')) {
      warnings.push({ key: 'warningModerateSlopes' });
    }

    const shade = data?.shadeCoverage || '';
    if (shade.includes('No shade')) {
      warnings.push({ key: 'warningNoShade' });
    }

    const quality = data?.surfaceQuality || '';
    if (quality.includes('Poor')) {
      warnings.push({ key: 'warningPoorSurface' });
    } else if (quality.includes('Vegetation')) {
      warnings.push({ key: 'warningOvergrown' });
    }

    // Add any notes as potential warnings (user notes remain in original language)
    const warningNotes = notes.filter(n => {
      const text = (n.text || n.data || '').toLowerCase();
      return text.includes('watch') || text.includes('careful') || text.includes('warning') ||
             text.includes('caution') || text.includes('avoid') || text.includes('note');
    });

    warningNotes.forEach(n => {
      warnings.push({ text: n.text || n.data });
    });

    // Additional notes (user notes remain in original language)
    if (data?.additionalNotes) {
      warnings.push({ text: data.additionalNotes });
    }

    if (warnings.length === 0) return '';

    return `
        <section class="tg-section tg-heads-up">
            <h2 class="tg-section-title">⚠️ <span data-i18n="headsUp">${t('headsUp')}</span></h2>
            <ul class="tg-warnings">
                ${warnings.map(w => w.key
                  ? `<li data-i18n="${w.key}">${t(w.key)}</li>`
                  : `<li>${w.text}</li>`
                ).join('')}
            </ul>
        </section>
    `;
  }

  renderFullSurveyDetails(data, lang = 'en') {
    const t = (key) => this.t(key, lang);
    if (!data) return `<p style="color:#666;" data-i18n="noSurveyData">${t('noSurveyData')}</p>`;

    const items = [];

    // Helper to add item if value exists - stores key for data-i18n
    const addItem = (labelKey, value) => {
      if (value && value !== 'Unknown' && value !== '') {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        items.push({ labelKey, label: t(labelKey), value: displayValue });
      }
    };

    // Basic Info
    addItem('surveyTrailName', data.trailName);
    addItem('surveyLocation', data.location);
    addItem('surveyRouteType', data.routeType);
    addItem('surveyDifficulty', data.difficulty);

    // Accessibility
    addItem('surveyWheelchairAccess', data.wheelchairAccess);
    addItem('surveyTrailSurface', data.trailSurface);
    addItem('surveySurfaceQuality', data.surfaceQuality);
    addItem('surveyTrailSlopes', data.trailSlopes);

    // Facilities
    addItem('surveyAccessibleParking', data.disabledParking);
    addItem('surveyParkingSpaces', data.parkingSpaces);
    addItem('surveyRestrooms', data.restrooms);
    addItem('surveyWaterFountains', data.waterFountains);
    addItem('surveySeating', data.seating);

    // Environment
    addItem('surveyShadeCoverage', data.shadeCoverage);
    addItem('surveyLighting', data.lighting);
    addItem('surveySignage', data.signage);
    addItem('surveyVisualAccess', data.visualAccess);
    addItem('surveyTrailWidth', data.trailWidth);

    // Extras
    addItem('surveyPicnicAreas', data.picnicAreas);
    addItem('surveyAccessibleViewpoint', data.accessibleViewpoint);

    // Notes
    addItem('surveyAdditionalNotes', data.additionalNotes);

    if (items.length === 0) {
      return `<p style="color:#666;" data-i18n="noSurveyData">${t('noSurveyData')}</p>`;
    }

    return `
      <div class="tg-survey-grid">
        ${items.map(item => `
          <div class="tg-survey-item">
            <div class="tg-survey-label" data-i18n="${item.labelKey}">${item.label}</div>
            <div class="tg-survey-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getMapScript(locationPoints, bounds, photos, notes) {
    const pathCoords = locationPoints.map(p => `[${p.coords.lat}, ${p.coords.lng}]`).join(',');
    const startCoord = locationPoints[0]?.coords;
    const endCoord = locationPoints[locationPoints.length - 1]?.coords;
    
    // Filter photos and notes that have coordinates
    const geoPhotos = photos.filter(p => p.coords);
    const geoNotes = notes.filter(n => n.coords);
    
    return `
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([${bounds ? (bounds.north + bounds.south) / 2 : 0}, ${bounds ? (bounds.east + bounds.west) / 2 : 0}], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        const pathCoords = [${pathCoords}];
        
        if (pathCoords.length > 0) {
            const polyline = L.polyline(pathCoords, {
                color: '#4a7c59',
                weight: 4,
                opacity: 0.8
            }).addTo(map);
            
            map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
            
            // Start marker
            L.marker([${startCoord?.lat || 0}, ${startCoord?.lng || 0}], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background:#22c55e;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">S</div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(map).bindPopup('<strong>🟢 Start</strong>');
            
            // End marker
            L.marker([${endCoord?.lat || 0}, ${endCoord?.lng || 0}], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background:#ef4444;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">E</div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(map).bindPopup('<strong>🔴 End</strong>');
            
            // Photo markers
            ${geoPhotos.map(photo => `
            L.marker([${photo.coords.lat}, ${photo.coords.lng}], {
                icon: L.divIcon({
                    className: 'photo-marker',
                    html: '<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📷</div>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            }).addTo(map).bindPopup('<div style="text-align:center;"><img src="${photo.content || photo.data}" style="width:200px;max-height:150px;object-fit:cover;border-radius:8px;"><p style="margin:8px 0 0;font-size:12px;color:#666;">${photo.timestamp ? new Date(photo.timestamp).toLocaleTimeString() : ''}</p></div>', { maxWidth: 220 });
            `).join('')}
            
            // Note markers
            ${geoNotes.map(note => `
            L.marker([${note.coords.lat}, ${note.coords.lng}], {
                icon: L.divIcon({
                    className: 'note-marker',
                    html: '<div style="background:#f59e0b;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📝</div>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            }).addTo(map).bindPopup('<div style="max-width:200px;"><strong style="color:#92400e;">📝 Note</strong><p style="margin:8px 0 0;font-size:13px;color:#333;">${(note.text || note.content || note.data || '').replace(/'/g, "\\'")}</p></div>');
            `).join('')}
        }
    </script>`;
  }

  getStyles(isRTL = false) {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${isRTL ? "'Arial Hebrew', 'Heebo', " : ''}-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            direction: ${isRTL ? 'rtl' : 'ltr'};
            ${isRTL ? `
            /* RTL-specific text rendering fixes for PDF export */
            word-spacing: 0.05em;
            letter-spacing: 0;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            ` : ''}
        }

        ${isRTL ? `
        /* Hebrew/RTL text fixes for proper rendering in PDF */
        * {
            unicode-bidi: embed;
        }
        p, span, div, h1, h2, h3, h4, li, td, th {
            word-spacing: normal;
            white-space: normal;
        }
        ` : ''}

        .tg-container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
        }
        
        /* Header */
        .tg-header {
            background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
            color: white;
            padding: 30px 24px;
            text-align: center;
        }
        
        .tg-header .tg-badge {
            background: rgba(255,255,255,0.2);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            display: inline-block;
            margin-bottom: 16px;
        }
        
        .tg-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .tg-location {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 4px;
        }
        
        .tg-date {
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        /* Accessibility Banner */
        .tg-access-banner {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px 24px;
            color: white;
        }
        
        .tg-access-banner.fully {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }
        
        .tg-access-banner.partial {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        
        .tg-access-banner.not {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        .tg-access-banner.unknown {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }
        
        .tg-access-icon {
            font-size: 2.5rem;
        }
        
        .tg-access-level {
            font-size: 1.2rem;
            font-weight: 700;
            letter-spacing: 1px;
        }
        
        .tg-access-desc {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        /* Stats Row */
        .tg-stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border-bottom: 1px solid #e5e5e5;
        }
        
        .tg-stat {
            text-align: center;
            padding: 16px 8px;
            border-right: 1px solid #e5e5e5;
        }
        
        .tg-stat:last-child {
            border-right: none;
        }
        
        .tg-stat-value {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: #2c5530;
        }
        
        .tg-stat-label {
            display: block;
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Sections */
        .tg-section {
            padding: 24px;
            border-bottom: 1px solid #e5e5e5;
        }
        
        .tg-section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 16px;
        }
        
        /* Elevation Profile Section */
        .tg-elevation-stats {
            display: flex;
            justify-content: space-around;
            gap: 16px;
            margin-bottom: 16px;
        }
        
        .tg-elev-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .tg-elev-icon {
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        .tg-elev-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #333;
        }
        
        .tg-elev-label {
            font-size: 0.75rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .tg-elevation-chart {
            background: #fafafa;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }
        
        .tg-gradient-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            font-size: 0.75rem;
            color: #666;
            margin-bottom: 12px;
        }
        
        .tg-legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .tg-legend-color {
            width: 16px;
            height: 4px;
            border-radius: 2px;
        }
        
        .tg-steep-warning {
            background: #fff8e1;
            border: 1px solid #ffe082;
            border-radius: 8px;
            padding: 12px;
        }
        
        .tg-steep-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .tg-steep-icon {
            font-size: 1.2rem;
        }
        
        .tg-steep-title {
            font-weight: 600;
            color: #f57c00;
        }
        
        .tg-steep-details {
            font-size: 0.85rem;
            color: #666;
        }
        
        .tg-steep-item {
            padding: 4px 0;
        }
        
        /* Good For Badges */
        .tg-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .tg-badge-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 8px 14px;
            border-radius: 20px;
        }
        
        .tg-badge-icon {
            font-size: 1.2rem;
        }
        
        .tg-badge-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: #166534;
        }
        
        /* Conditions */
        .tg-conditions {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .tg-condition-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .tg-condition-label {
            width: 70px;
            font-size: 0.9rem;
            color: #666;
        }
        
        .tg-condition-bar {
            flex: 1;
            height: 8px;
            background: #e5e5e5;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .tg-condition-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s;
        }
        
        .tg-condition-fill.good {
            background: linear-gradient(to right, #22c55e, #16a34a);
        }
        
        .tg-condition-fill.moderate {
            background: linear-gradient(to right, #f59e0b, #d97706);
        }
        
        .tg-condition-fill.poor {
            background: linear-gradient(to right, #ef4444, #dc2626);
        }
        
        .tg-condition-text {
            width: 80px;
            font-size: 0.85rem;
            font-weight: 500;
            text-align: right;
        }
        
        /* Facilities */
        .tg-facilities {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
        }
        
        .tg-facility {
            text-align: center;
            padding: 16px 8px;
            border-radius: 12px;
            background: #f9fafb;
        }
        
        .tg-facility.available {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }
        
        .tg-facility.unavailable {
            opacity: 0.5;
        }
        
        .tg-facility-icon {
            display: block;
            font-size: 1.5rem;
            margin-bottom: 4px;
        }
        
        .tg-facility-label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #333;
        }
        
        .tg-facility-status {
            display: block;
            font-size: 0.75rem;
            color: #666;
        }
        
        /* Map */
        .tg-map-container {
            height: 300px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        #map {
            height: 100%;
            width: 100%;
        }
        
        .tg-map-hint {
            text-align: center;
            font-size: 0.85rem;
            color: #666;
            margin-top: 8px;
        }
        
        .tg-map-legend {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 12px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .tg-legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            color: #555;
        }
        
        .tg-legend-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .tg-legend-dot.start { background: #22c55e; }
        .tg-legend-dot.end { background: #ef4444; }
        .tg-legend-dot.photo { background: #3b82f6; }
        .tg-legend-dot.note { background: #f59e0b; }
        
        /* Timeline */
        .tg-timeline {
            position: relative;
            padding-left: 30px;
        }
        
        .tg-timeline::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e5e5e5;
        }
        
        .tg-timeline-item {
            position: relative;
            padding-bottom: 20px;
        }
        
        .tg-timeline-item:last-child {
            padding-bottom: 0;
        }
        
        .tg-timeline-marker {
            position: absolute;
            left: -30px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            background: white;
            border-radius: 50%;
            z-index: 1;
        }
        
        .tg-timeline-content {
            background: #f9fafb;
            padding: 12px 16px;
            border-radius: 10px;
        }
        
        .tg-timeline-item.start .tg-timeline-content,
        .tg-timeline-item.end .tg-timeline-content {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }
        
        .tg-timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .tg-timeline-title {
            font-weight: 600;
            color: #333;
        }
        
        .tg-timeline-distance {
            font-size: 0.8rem;
            color: #666;
            background: #e5e5e5;
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .tg-timeline-photo {
            width: 100%;
            border-radius: 8px;
            margin-top: 8px;
        }
        
        .tg-timeline-text {
            color: #555;
            font-style: italic;
        }
        
        /* Heads Up */
        .tg-heads-up {
            background: #fef3c7;
        }
        
        .tg-warnings {
            list-style: none;
        }
        
        .tg-warnings li {
            padding: 8px 0 8px 24px;
            position: relative;
            color: #92400e;
        }
        
        .tg-warnings li::before {
            content: '•';
            position: absolute;
            left: 8px;
            color: #f59e0b;
            font-weight: bold;
        }
        
        /* Footer */
        .tg-footer {
            padding: 30px 24px;
            text-align: center;
            background: #f9fafb;
        }
        
        .tg-footer p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .tg-footer p:first-child {
            font-weight: 600;
            color: #2c5530;
            margin-bottom: 4px;
        }
        
        /* Mobile */
        @media (max-width: 480px) {
            .tg-stats-row {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .tg-stat:nth-child(2) {
                border-right: none;
            }
            
            .tg-stat:nth-child(1),
            .tg-stat:nth-child(2) {
                border-bottom: 1px solid #e5e5e5;
            }
            
            .tg-title {
                font-size: 1.5rem;
            }
            
            .tg-access-banner {
                flex-direction: column;
                text-align: center;
            }
            
            .tg-facilities {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        /* Print */
        @media print {
            .tg-container {
                max-width: 100%;
            }

            .tg-map-container {
                height: 250px;
            }

            .tg-action-bar {
                display: none !important;
            }

            .tg-survey-panel {
                display: block !important;
                page-break-before: always;
            }
        }

        /* PDF export mode - applied via .pdf-export class on body */
        body.pdf-export .tg-stats-row {
            grid-template-columns: repeat(4, 1fr) !important;
        }
        body.pdf-export .leaflet-marker-pane,
        body.pdf-export .leaflet-shadow-pane,
        body.pdf-export .leaflet-popup-pane {
            display: none !important;
        }
        body.pdf-export .tg-map-hint,
        body.pdf-export .tg-map-legend {
            display: none !important;
        }
        
        /* Action Bar */
        .tg-action-bar {
            display: flex;
            gap: 10px;
            padding: 16px 24px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e5e5;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .tg-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            color: white;
        }
        
        .tg-action-navigate {
            background: #3b82f6;
        }
        
        .tg-action-navigate:hover {
            background: #2563eb;
        }
        
        .tg-action-pdf {
            background: #10b981;
        }
        
        .tg-action-pdf:hover {
            background: #059669;
        }
        
        .tg-action-details {
            background: #8b5cf6;
        }
        
        .tg-action-details:hover {
            background: #7c3aed;
        }
        
        .tg-action-lang {
            background: #64748b;
            padding: 10px 12px;
            font-size: 1.2rem;
        }
        
        .tg-action-lang:hover {
            background: #475569;
        }
        
        /* Dropdown */
        .tg-action-dropdown {
            position: relative;
            display: inline-block;
        }
        
        .tg-dropdown-content {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            min-width: 160px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 8px;
            overflow: hidden;
            z-index: 100;
            margin-top: 4px;
        }
        
        .tg-dropdown-content.show {
            display: block;
        }
        
        .tg-dropdown-content a {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            text-decoration: none;
            color: #333;
            transition: background 0.2s;
        }
        
        .tg-dropdown-content a:hover {
            background: #f3f4f6;
        }
        
        /* PDF Loading Overlay */
        .tg-pdf-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .tg-pdf-loading {
            background: white;
            padding: 40px 60px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .tg-pdf-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e5e7eb;
            border-top-color: #2c5530;
            border-radius: 50%;
            margin: 0 auto 20px;
            animation: tg-spin 1s linear infinite;
        }
        
        @keyframes tg-spin {
            to { transform: rotate(360deg); }
        }
        
        .tg-pdf-loading p {
            margin: 0;
            color: #333;
            font-size: 1.1rem;
            font-weight: 500;
        }
        
        .tg-pdf-hint {
            color: #666 !important;
            font-size: 0.9rem !important;
            font-weight: 400 !important;
            margin-top: 8px !important;
        }
        
        /* Survey Details Panel */
        .tg-survey-panel {
            display: none;
            padding: 24px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            margin: 16px 24px;
            border-radius: 12px;
        }
        
        .tg-survey-panel.show {
            display: block;
        }
        
        .tg-survey-panel h3 {
            margin: 0 0 16px 0;
            color: #0369a1;
            font-size: 1.1rem;
        }
        
        .tg-survey-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .tg-survey-item {
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 3px solid #0ea5e9;
        }
        
        .tg-survey-label {
            font-size: 0.8rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .tg-survey-value {
            font-weight: 500;
            color: #333;
        }
        
        @media (max-width: 480px) {
            .tg-action-bar {
                flex-direction: column;
                padding: 12px 16px;
            }
            
            .tg-action-btn {
                width: 100%;
                justify-content: center;
            }
            
            .tg-dropdown-content {
                position: static;
                box-shadow: none;
                border: 1px solid #e5e5e5;
                margin-top: 8px;
            }
            
            .tg-survey-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
  }
}

// Create singleton instance
const trailGuideGeneratorV2 = new TrailGuideGeneratorV2();

export { trailGuideGeneratorV2 };

console.log('📄 Trail Guide Generator V2 loaded');