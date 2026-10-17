import json
import os
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data"))


class HybridRecommendationEngine:
    """
    Hybrid recommendation engine combining deterministic clinical/safety logic,
    content-based attribute matching, and user profile constraints.
    """

    def __init__(self):
        self.products: List[Dict[str, Any]] = []
        self.exercises: List[Dict[str, Any]] = []
        self.foods: List[Dict[str, Any]] = []
        self._load_catalogues()

    def _load_catalogues(self):
        prod_path = os.path.join(DATA_DIR, "sample_products.json")
        ex_path = os.path.join(DATA_DIR, "sample_exercises.json")
        food_path = os.path.join(DATA_DIR, "sample_foods.json")

        if os.path.exists(prod_path):
            with open(prod_path, "r", encoding="utf-8") as f:
                self.products = json.load(f)
        if os.path.exists(ex_path):
            with open(ex_path, "r", encoding="utf-8") as f:
                self.exercises = json.load(f)
        if os.path.exists(food_path):
            with open(food_path, "r", encoding="utf-8") as f:
                self.foods = json.load(f)

    def recommend_skincare(
        self,
        skin_type: str,
        detected_concerns: List[str],
        user_allergies: Optional[List[str]] = None,
        budget_tier: Optional[str] = "moderate",
        dietary_prefs: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates structured AM/PM skincare routine recommendations.
        """
        user_allergies = [a.lower() for a in (user_allergies or [])]
        dietary_prefs = [p.lower() for p in (dietary_prefs or [])]
        results = []

        # Map concerns to target ingredients
        target_tags = set()
        if "vegan" in dietary_prefs:
            target_tags.add("vegan")

        for product in self.products:
            if product.get("category") != "skincare":
                continue

            # 1. Deterministic Safety Check: Allergies
            ingredients_lower = [i.lower() for i in product.get("ingredients", [])]
            has_allergen = any(allergy in " ".join(ingredients_lower) for allergy in user_allergies)
            if has_allergen:
                continue

            # 2. Compatibility Score
            score = 0.50
            reasons = []
            safety_notes = []

            # Check skin type match
            prod_skin_types = [st.lower() for st in product.get("skin_types", [])]
            if "all" in prod_skin_types or skin_type.lower() in prod_skin_types:
                score += 0.20
                reasons.append(f"Formulated specifically for {skin_type.replace('_', ' ')} skin.")

            # Check concern overlap
            prod_concerns = [c.lower() for c in product.get("target_concerns", [])]
            matched_concerns = set(detected_concerns).intersection(set(prod_concerns))
            if matched_concerns:
                score += min(0.30, len(matched_concerns) * 0.15)
                reasons.append(f"Contains bioactives targeting {', '.join(matched_concerns)}.")

            # Tag alignment (e.g. fragrance-free, vegan)
            prod_tags = [t.lower() for t in product.get("tags", [])]
            if "fragrance-free" in prod_tags:
                safety_notes.append("Fragrance-free formula minimizes risk of contact sensitization.")
            if "vegan" in target_tags and "vegan" not in prod_tags:
                score -= 0.15

            # Assign routine step
            subcat = product.get("subcategory", "")
            if subcat == "cleanser":
                routine_step = "AM/PM Step 1: Gentle Cleansing"
            elif subcat == "exfoliant":
                routine_step = "PM Step 2 (2-3x weekly): Chemical Exfoliation"
                safety_notes.append("Always follow daytime chemical exfoliants with broad-spectrum SPF 30+.")
            elif subcat == "serum":
                routine_step = "AM/PM Step 2: Targeted Active Serum"
            elif subcat == "moisturizer":
                routine_step = "AM/PM Step 3: Lipid Barrier Lock"
            elif subcat == "sunscreen":
                routine_step = "AM Final Step: Broad Spectrum Photoprotection"
                safety_notes.append("Reapply every 2 hours if exposed to direct sunlight.")
            else:
                routine_step = "Supplementary Daily Routine"

            if score >= 0.65:
                results.append({
                    "product_id": product["id"],
                    "match_score": round(min(0.98, score), 2),
                    "routine_step": routine_step,
                    "category": "skincare",
                    "rationale": " ".join(reasons) if reasons else "Supports overall epidermal barrier equilibrium.",
                    "safety_notes": safety_notes,
                    "product": product
                })

        # Sort by match score descending
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:5]

    def recommend_wellness_and_nutrition(
        self,
        posture_deviations: List[str],
        fitness_goal: str,
        dietary_prefs: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Recommends targeted corrective exercises and nutritional foods."""
        dietary_prefs = [p.lower() for p in (dietary_prefs or [])]

        # Filter exercises based on posture deviations
        matched_exercises = []
        for ex in self.exercises:
            benefit = ex.get("posture_benefit", "").lower()
            ex_cat = ex.get("category", "").lower()
            is_relevant = False
            
            if any("forward head" in dev.lower() for dev in posture_deviations) and ("cervical" in benefit or "posture" in ex_cat):
                is_relevant = True
            elif any("shoulder" in dev.lower() for dev in posture_deviations) and ("shoulder" in benefit or "scapular" in benefit):
                is_relevant = True
            elif any("torso" in dev.lower() for dev in posture_deviations) and ("thoracic" in benefit or "core" in ex_cat):
                is_relevant = True
            elif ex_cat == "posture" or ex_cat == "core":
                is_relevant = True

            if is_relevant:
                matched_exercises.append(ex)

        if not matched_exercises:
            matched_exercises = self.exercises[:3]

        # Filter foods based on dietary preferences
        matched_foods = []
        for food in self.foods:
            flags = [f.lower() for f in food.get("dietary_flags", [])]
            # If user has dietary preferences, make sure food matches or does not violate
            if dietary_prefs:
                if any(pref in flags for pref in dietary_prefs):
                    matched_foods.append(food)
            else:
                matched_foods.append(food)

        if not matched_foods:
            matched_foods = self.foods[:3]

        return {
            "corrective_exercises": matched_exercises[:4],
            "recommended_foods": matched_foods[:4]
        }


recommendation_engine = HybridRecommendationEngine()
