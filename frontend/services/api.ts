import {
  AuthResponse,
  User,
  UserProfile,
  SkinAssessment,
  QualityCheckResult,
  BMICalculation,
  PoseAnalysis,
  BodyAssessment,
  WellnessPlan,
  Exercise,
  FoodItem,
  Product,
  Recommendation,
  ChatMessage,
  ProgressSummary,
  ProgressRecord
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("skinfit_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("skinfit_token", token);
      } else {
        localStorage.removeItem("skinfit_token");
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined" && !this.token) {
      this.token = localStorage.getItem("skinfit_token");
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Do not set Content-Type if FormData is used
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth & Users ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(data: { email: string; password: string; full_name?: string }): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...data, terms_consent: true, biometric_consent: true }),
    });
  }

  logout() {
    this.setToken(null);
  }

  async getMe(): Promise<User> {
    return this.request<User>("/users/me");
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  }

  // --- Skin Assessment ---
  async checkSkinQuality(imageFile: File | Blob): Promise<QualityCheckResult> {
    const formData = new FormData();
    formData.append("file", imageFile, "capture.jpg");
    return this.request<QualityCheckResult>("/skin/quality-check", {
      method: "POST",
      body: formData,
    });
  }

  async analyzeSkin(imageFile: File | Blob): Promise<SkinAssessment> {
    const formData = new FormData();
    formData.append("file", imageFile, "skin_scan.jpg");
    return this.request<SkinAssessment>("/skin/analyze", {
      method: "POST",
      body: formData,
    });
  }

  async getSkinAssessments(): Promise<SkinAssessment[]> {
    return this.request<SkinAssessment[]>("/skin/assessments");
  }

  async getSkinAssessmentById(id: string): Promise<SkinAssessment> {
    return this.request<SkinAssessment>(`/skin/assessments/${id}`);
  }

  // --- Body & Posture ---
  async calculateBMI(data: { height_cm: number; weight_kg: number; age?: number; gender?: string }): Promise<BMICalculation> {
    return this.request<BMICalculation>("/body/bmi", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async analyzePose(imageFile: File | Blob): Promise<PoseAnalysis> {
    const formData = new FormData();
    formData.append("file", imageFile, "body_pose.jpg");
    return this.request<PoseAnalysis>("/body/pose", {
      method: "POST",
      body: formData,
    });
  }

  async createBodyAssessment(data: { height_cm: number; weight_kg: number }): Promise<BodyAssessment> {
    return this.request<BodyAssessment>("/body/assessment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getBodyHistory(): Promise<BodyAssessment[]> {
    return this.request<BodyAssessment[]>("/body/history");
  }

  // --- Wellness & Plans ---
  async generateWellnessPlan(): Promise<WellnessPlan> {
    return this.request<WellnessPlan>("/wellness/plan", {
      method: "POST",
    });
  }

  async getExercises(category?: string): Promise<Exercise[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.request<Exercise[]>(`/wellness/exercises${query}`);
  }

  async getFoods(category?: string): Promise<FoodItem[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.request<FoodItem[]>(`/wellness/foods${query}`);
  }

  // --- Products & Marketplace ---
  async getProducts(params?: { category?: string; concern?: string; skin_type?: string; search?: string }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.concern) searchParams.set("concern", params.concern);
    if (params?.skin_type) searchParams.set("skin_type", params.skin_type);
    if (params?.search) searchParams.set("search", params.search);

    const qs = searchParams.toString();
    return this.request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return this.request<Recommendation[]>("/recommendations", {
      method: "POST",
    });
  }

  async submitRecommendationFeedback(recommendation_id: string, is_helpful: boolean, rating?: number): Promise<any> {
    return this.request("/recommendations/feedback", {
      method: "POST",
      body: JSON.stringify({ recommendation_id, is_helpful, rating }),
    });
  }

  // --- Assistant & RAG ---
  async sendAssistantMessage(message: string, conversation_id?: string): Promise<{ conversation_id: string; message: ChatMessage; disclaimer: string }> {
    return this.request("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversation_id, include_rag: true }),
    });
  }

  async triggerRAGIngest(): Promise<any> {
    return this.request("/rag/ingest", {
      method: "POST",
    });
  }

  // --- Progress & Privacy ---
  async getProgress(): Promise<ProgressSummary> {
    return this.request<ProgressSummary>("/progress");
  }

  async logProgress(data: Partial<ProgressRecord>): Promise<ProgressRecord> {
    return this.request<ProgressRecord>("/progress", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteAccountImages(): Promise<{ status: string; message: string; deleted_count: number }> {
    return this.request("/account/images", {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
