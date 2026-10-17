from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings


class BaseLLMProvider:
    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        conversation_history: List[Dict[str, str]],
        rag_context: List[str]
    ) -> str:
        raise NotImplementedError


class DeterministicLocalLLMProvider(BaseLLMProvider):
    """
    Offline local rule and retrieval-grounded conversational engine.
    Ensures the application operates 100% locally without cloud API keys,
    adhering strictly to clinical guardrails and retrieved context.
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        conversation_history: List[Dict[str, str]],
        rag_context: List[str]
    ) -> str:
        query_lower = prompt.lower()
        
        # Check for medical emergency / diagnosis queries
        if any(w in query_lower for w in ["diagnose", "cancer", "melanoma", "infection", "rash", "bleeding", "disease", "cure"]):
            return (
                "**Clinical Safety Guidance:**\n\n"
                "As an AI wellness assistant, I cannot provide medical diagnoses, pathology evaluations, or prescription treatments. "
                "For active bleeding, sudden dark or irregular mole evolutions, painful cystic nodules, or infectious symptoms, "
                "please schedule an evaluation promptly with a board-certified dermatologist or primary care physician.\n\n"
                "*Disclaimer: SkinFit AI is an educational digital coaching platform and not a replacement for clinical medical diagnosis.*"
            )

        # Build response incorporating RAG passages if present
        context_summary = ""
        if rag_context:
            context_summary = "\n\n**Grounded Knowledge Reference:**\n" + "\n".join([f"- {p.strip().splitlines()[0]}" for p in rag_context[:2]])

        if any(w in query_lower for w in ["acne", "breakout", "pimple", "blemish", "pore"]):
            return (
                "**Blemish & Pore Clarification Coaching:**\n\n"
                "Acneiform blemishes typically arise from follicular hyperkeratinization, excess sebum, and cutaneous inflammation. "
                "Here is an evidence-backed approach to restoring clarity:\n"
                "1. **Gentle Chemical Exfoliation:** Consider a 2% Salicylic Acid (BHA) solution 2-3 times per week. Because BHA is lipophilic, it penetrates deep into pores to dissolve compacted desmosomes.\n"
                "2. **Sebum Balancing:** Niacinamide (2-5%) and Zinc PCA help regulate surface sebum without stripping the moisture barrier.\n"
                "3. **Barrier Preservation:** Avoid harsh physical scrubs or high-pH soaps that increase Transepidermal Water Loss (TEWL)."
                f"{context_summary}\n\n"
                "*Tip: Always protect recovering skin with a non-comedogenic broad-spectrum sunscreen.*"
            )

        elif any(w in query_lower for w in ["posture", "neck", "back", "ergonomic", "desk", "shoulder"]):
            return (
                "**Kinetic Posture & Ergonomics Coaching:**\n\n"
                "Sedentary desk work frequently induces forward head translation and protracted scapulae (Upper Crossed Syndrome). "
                "Here are corrective actions to re-align your posture:\n"
                "1. **Suboccipital Decompression:** Practice chin tucks (retracting the head backward into a double-chin position) for 10 reps every 2 hours.\n"
                "2. **Thoracic Extension:** Lie over a foam roller positioned at mid-scapula height to gently open the anterior rib cage and counter kyphosis.\n"
                "3. **Workstation Plumb Line:** Elevate your monitor so your eye level aligns with the top third of the screen, and keep forearms parallel to your desk."
                f"{context_summary}"
            )

        elif any(w in query_lower for w in ["nutrition", "diet", "protein", "weight", "calorie", "meal", "food"]):
            return (
                "**Nutritional Vitality & Gut-Skin Axis:**\n\n"
                "Nutrition directly influences skin inflammation markers and musculoskeletal recovery:\n"
                "1. **Anti-Inflammatory Omega-3s:** Wild salmon, chia seeds, and walnuts supply EPA and DHA to enhance cell membrane fluidity.\n"
                "2. **Optimal Protein Synthesis:** Target 1.4 to 1.8 grams of protein per kilogram of body weight to support collagen matrix repair and satiety.\n"
                "3. **Glycemic Balance:** Minimize refined high-glycemic carbohydrates to avoid spikes in IGF-1, which can overstimulate sebaceous gland activity.\n"
                "4. **Hydration Benchmark:** Aim for 30 to 35 mL of water per kg of body mass daily."
                f"{context_summary}"
            )

        elif any(w in query_lower for w in ["sunscreen", "spf", "sun", "uv", "wrinkle", "aging"]):
            return (
                "**Photoprotection & Skin Longevity:**\n\n"
                "Ultraviolet radiation accounts for up to 80% of visible premature facial photoaging:\n"
                "1. **Broad Spectrum Daily Defense:** Use an SPF 30 to SPF 50+ mineral or organic sunscreen every morning, even on overcast days.\n"
                "2. **Antioxidant Shield:** Layer a 15% Vitamin C (L-Ascorbic Acid) serum beneath your sunscreen to scavenge UV-induced reactive oxygen species (ROS).\n"
                "3. **Barrier Moisture:** Finish your evening routine with biomimetic ceramides and hyaluronic acid to replenish hydration."
                f"{context_summary}"
            )

        # General helpful wellness response
        return (
            f"Hello! I am your SkinFit AI Personal Health & Wellness Advisor.\n\n"
            f"Based on your profile and recent assessments, I can provide personalized recommendations on:\n"
            f"• **Targeted Skincare Routines** (AM/PM routines tailored to your skin tone, ITA index, and concerns)\n"
            f"• **Biomechanics & Posture Drills** (exercises to correct forward head tilt or shoulder imbalances)\n"
            f"• **Evidence-Based Nutrition & Hydration** (macro breakdowns, gut-skin axis foods, and meal planning)\n"
            f"• **Product Formulation Analysis** (ingredient safety checks for active serums and cleansers)\n\n"
            f"How can I assist your health and wellness goals today?"
            f"{context_summary}"
        )


class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        conversation_history: List[Dict[str, str]],
        rag_context: List[str]
    ) -> str:
        messages = [{"role": "system", "content": system_instruction}]
        if rag_context:
            context_block = "\n---\n".join(rag_context)
            messages.append({"role": "system", "content": f"Verified Knowledge Passages:\n{context_block}"})
            
        for msg in conversation_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": prompt})

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": messages,
                        "temperature": 0.4,
                        "max_tokens": 800
                    }
                )
                data = res.json()
                return data["choices"][0]["message"]["content"]
        except Exception:
            # Fallback to deterministic local engine
            return await DeterministicLocalLLMProvider().generate_response(
                prompt, system_instruction, conversation_history, rag_context
            )


class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        conversation_history: List[Dict[str, str]],
        rag_context: List[str]
    ) -> str:
        context_str = "\n".join(rag_context) if rag_context else ""
        full_prompt = f"System: {system_instruction}\nContext:\n{context_str}\nUser: {prompt}"
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    url,
                    json={
                        "contents": [{"parts": [{"text": full_prompt}]}],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800}
                    }
                )
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return await DeterministicLocalLLMProvider().generate_response(
                prompt, system_instruction, conversation_history, rag_context
            )


def get_llm_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAILLMProvider(settings.OPENAI_API_KEY)
    elif settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(settings.GEMINI_API_KEY)
    return DeterministicLocalLLMProvider()
