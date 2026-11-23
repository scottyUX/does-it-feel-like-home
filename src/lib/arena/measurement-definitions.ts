export type MeasurementDefinition = {
  label: string;
  calculation: string;
  paper?: { title: string; url: string };
};

const webDesign = { title: "Li et al. (2022), Cultural Differences in Web Design", url: "https://doi.org/10.1109/procomm53155.2022.00023" };
const aesthetics = { title: "Reinecke et al. (2013), Website aesthetics", url: "https://doi.org/10.1145/2470654.2481281" };

export const measurementDefinitions: Record<string, MeasurementDefinition> = {
  visible_text_chars: { label: "Text characters", calculation: "Counts non-whitespace characters in text nodes whose immediate parent passes the worker's visibility check. This can include text below the viewport and is not an exact count of what a viewer sees.", paper: webDesign },
  cjk_characters: { label: "Chinese, Japanese and Korean characters", calculation: "Counts characters in Unicode range U+4E00–U+9FFF in the same text as Text characters. This range includes characters used in Chinese, Japanese and Korean, but does not cover all characters in those languages or identify which language is being used." },
  visible_elements: { label: "Elements", calculation: "Counts body descendants with a bounding box larger than 2 pixels in each dimension, display other than none, visible visibility, and opacity above 0.05. Offscreen and occluded elements can be included.", paper: aesthetics },
  visible_buttons: { label: "Buttons", calculation: "Counts elements passing the visibility check that are button elements or have role=button. It can include offscreen elements." },
  visible_links: { label: "Links", calculation: "Counts anchor elements passing the visibility check, including anchors without an href and possibly offscreen links.", paper: webDesign },
  css_animated_elements: { label: "CSS-animated elements", calculation: "Counts elements passing the visibility check whose computed animation-name is not none, 2.5 seconds after load. It does not establish that the animation is running and misses other motion." },
  page_height_px: { label: "Page height", calculation: "Reads document.documentElement.scrollHeight in CSS pixels at the measurement viewport. This is not the number of screens viewed." },
  screenshot_mean_rgb_brightness: { label: "Screenshot brightness", calculation: "Averages 0.2126 × red + 0.7152 × green + 0.0722 × blue over the first-screen screenshot, scaled from 0 to 1. This is a project-specific RGB brightness proxy, not a validated light/dark classification.", paper: aesthetics },
  javascript_error_count: { label: "JavaScript errors", calculation: "Counts uncaught pageerror events observed by Playwright during loading and the 2.5-second wait. It does not include every possible failure." },
};
