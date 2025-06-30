// Navigation utility functions for consistent navigation behavior

/**
 * Navigate to survey section with proper screen handling
 * @param {Object} navigation - Navigation object
 * @param {string} screen - Target screen name
 * @param {Object} params - Navigation parameters
 */
export const navigateToSurvey = (navigation, screen, params = {}) => {
  navigation.navigate("Survey", { screen, ...params });
};

/**
 * Navigate to profile section with proper screen handling
 * @param {Object} navigation - Navigation object
 * @param {string} screen - Target screen name
 * @param {Object} params - Navigation parameters
 */
export const navigateToProfile = (navigation, screen, params = {}) => {
  navigation.navigate("Profile", { screen, ...params });
};

/**
 * Navigate back with proper fallback
 * @param {Object} navigation - Navigation object
 * @param {string} fallbackScreen - Fallback screen if can't go back
 */
export const navigateBack = (navigation, fallbackScreen = null) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else if (fallbackScreen) {
    navigation.navigate(fallbackScreen);
  }
};

/**
 * Navigate to survey result with proper parameters
 * @param {Object} navigation - Navigation object
 * @param {Object} survey - Survey object
 * @param {Object} result - Survey result object
 * @param {string} fromScreen - Screen that navigated to result
 */
export const navigateToSurveyResult = (
  navigation,
  survey,
  result,
  fromScreen
) => {
  navigation.navigate("SurveyResult", {
    survey,
    result,
    screen: fromScreen,
  });
};

/**
 * Navigate to survey taking with proper parameters
 * @param {Object} navigation - Navigation object
 * @param {Object} survey - Survey object
 */
export const navigateToSurveyTaking = (navigation, survey) => {
  navigation.navigate("SurveyTaking", { survey });
};

/**
 * Navigate to survey info with proper parameters
 * @param {Object} navigation - Navigation object
 * @param {Object} survey - Survey object
 * @param {Object} params - Additional parameters
 */
export const navigateToSurveyInfo = (navigation, survey, params = {}) => {
  navigation.navigate("SurveyInfo", { survey, ...params });
};

/**
 * Navigate to survey record
 * @param {Object} navigation - Navigation object
 */
export const navigateToSurveyRecord = (navigation) => {
  navigation.navigate("SurveyRecord");
};

/**
 * Navigate to home screen
 * @param {Object} navigation - Navigation object
 */
export const navigateToHome = (navigation) => {
  navigation.popTo("Home");
};

/**
 * Navigate to profile main screen
 * @param {Object} navigation - Navigation object
 */
export const navigateToProfileMain = (navigation) => {
  navigation.navigate("Profile");
};

/**
 * Navigate to survey info with progress saved flag (for exiting SurveyTaking)
 * @param {Object} navigation - Navigation object
 * @param {Object} survey - Survey object
 * @param {boolean} progressSaved - Whether progress was saved
 */
export const navigateFromSurveyTaking = (navigation) => {
  navigation.navigate("Home");
};
