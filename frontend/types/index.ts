export interface UserProfile {
  id: string;
  user_id: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  fitness_goal?: string;
  self_reported_skin_type?: string;
  skin_concerns: string[];
  known_allergies: string[];
  dietary_preferences: string[];
  budget_tier?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QualityCheckResult {
  is_valid: boolean;
  face_detected: boolean;
  face_count: number;
  face_bounding_box?: BoundingBox;
  lighting_condition: string;
  brightness_mean: number;
  sharpness_score: number;
  is_blurry: boolean;
  feedback_messages: string[];
}

export interface SkinFinding {
  id?: string;
  feature_type: "acne_lesion" | "pigmentation_spot" | "fine_line_wrinkle" | "texture_roughness";
  anatomical_region: string;
  bounding_box: BoundingBox;
  severity: "mild" | "moderate" | "pronounced";
  confidence: number;
}

export interface SkinAssessment {
  id: string;
  user_id: string;
  image_id?: string;
  overall_clarity_score: number;
  estimated_skin_type?: string;
  ita_angle?: number;
  skin_tone_label?: string;
  lighting_quality: string;
  sharpness_score: number;
  confidence_score: number;
  acne_count: number;
  pigmentation_count: number;
  wrinkle_score: number;
  texture_score: number;
  summary?: string;
  limitations: string[];
  findings?: SkinFinding[];
  annotated_image_url?: string;
  created_at: string;
}

export interface BMICalculation {
  bmi: number;
  category: string;
  healthy_weight_range_kg: {
    min: number;
    max: number;
  };
  safeguards: string[];
  bmr_calories_est?: number;
  tdee_sedentary_est?: number;
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  z?: number;
  visibility: number;
}

export interface PoseAnalysis {
  is_valid_pose: boolean;
  posture_score: number;
  neck_inclination_deg?: number;
  shoulder_tilt_deg?: number;
  torso_inclination_deg?: number;
  deviations_detected: string[];
  keypoints: PoseKeypoint[];
  recommendations: string[];
  limitations: string[];
}

export interface BodyAssessment {
  id: string;
  user_id: string;
  height_cm: number;
  weight_kg: number;
  bmi_value: number;
  bmi_category: string;
  posture_score: number;
  neck_inclination_deg?: number;
  shoulder_tilt_deg?: number;
  torso_inclination_deg?: number;
  detected_deviations: string[];
  limitations: string[];
  created_at: string;
}

export interface MealPlan {
  id: string;
  day_of_week: string;
  meal_type: string;
  title: string;
  description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  dietary_tags: string[];
}

export interface WellnessPlan {
  id: string;
  user_id: string;
  title: string;
  goal: string;
  daily_calorie_target: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  hydration_liters: number;
  posture_focus_areas: string[];
  safety_guardrails: string[];
  is_active: boolean;
  created_at: string;
  meals: MealPlan[];
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  target_muscle: string;
  difficulty: string;
  equipment: string;
  duration_seconds: number;
  calories_burned_est: number;
  instructions: string[];
  posture_benefit?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  micronutrients: string[];
  dietary_flags: string[];
  skin_wellness_benefits?: string;
  recipe_summary?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  description: string;
  ingredients: string[];
  skin_types: string[];
  target_concerns: string[];
  tags: string[];
  affiliate_url: string;
  image_url: string;
  is_demo: boolean;
}

export interface Recommendation {
  id: string;
  user_id: string;
  product_id: string;
  match_score: number;
  rationale: string;
  routine_step?: string;
  category: string;
  safety_notes: string[];
  created_at: string;
  product?: Product;
}

export interface Citation {
  source: string;
  snippet: string;
  relevance_score?: number;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  created_at?: string;
}

export interface ProgressRecord {
  id: string;
  user_id: string;
  record_date: string;
  weight_kg?: number;
  waist_cm?: number;
  skin_clarity_score?: number;
  water_intake_liters: number;
  workout_completed: boolean;
  notes?: string;
  created_at: string;
}

export interface ProgressSummary {
  current_streak_days: number;
  total_workouts: number;
  latest_weight_kg?: number;
  weight_change_kg?: number;
  latest_skin_score?: number;
  history: ProgressRecord[];
}
