# Responsible AI, Medical Disclaimers, and Ethical Wellness Safeguards

## 1. Statutory Medical Disclaimer & Boundaries
SkinFit AI is an educational, computer vision-assisted wellness and digital coaching platform. 
* **Not Medical Advice:** Neither the software algorithms, computer vision pipelines, nor generative AI conversational modules provide clinical diagnoses, pathology determinations, prescription medications, or curative therapies.
* **Non-Diagnostic Nature of Facial Scans:** Standard 2D RGB digital photographs obtained via mobile phones or webcams are subject to ambient color temperature, uneven lux levels, optical lens distortion, and compression artifacts. They cannot measure subcutaneous histology, true epidermal melanin density in micromoles, physiological hydration percentages, or vitamin levels.
* **Emergency & Physician Referral Protocol:** Users presenting with rapidly changing, irregularly bordered, or multi-colored pigmented lesions (following ABCDE criteria for melanoma), severe cystic/nodular acne lesions, open bleeding lesions, or acute musculoskeletal pain must seek immediate evaluation by a board-certified dermatologist or qualified healthcare provider.

## 2. Weight Management and Nutritional Safeguards
* **Age Restrictions:** Automated weight-loss regimes, calorie deficit calculations, or restrictive macronutrient recommendations are strictly disabled for minors under 18 years of age without explicit pediatric guidance.
* **Eating Disorder Safeguards:** Users with Body Mass Index (BMI) categorized as underweight (<18.5 kg/m²) are blocked from selecting calorie-deficit goals and are gently advised on nutrient density and consulting clinical professionals.
* **Calorie Floors:** The system enforces strict minimum daily calorie floors (1,200 kcal for adult females, 1,500 kcal for adult males) regardless of user target speed. Rapid weight loss goals exceeding 1 kg per week are flagged as unsafe.

## 3. Data Privacy and Right to Erasure (GDPR / CCPA)
* All facial imagery, biometric landmarks, and pose estimations must remain strictly confidential.
* Users have the unilateral right to delete their biometric records, uploaded imagery, and historical assessments instantly through the user interface or API endpoint (`DELETE /api/v1/account/images`).
