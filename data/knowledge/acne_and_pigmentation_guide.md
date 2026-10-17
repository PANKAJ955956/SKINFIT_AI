# Clinical Overview of Acne, Hyperpigmentation, and Visible Skin Textures

## 1. Pathophysiology of Acneiform Lesions
Acne vulgaris involves four primary interrelated pathogenic factors:
1. Follicular hyperkeratinization (retention hyperkeratosis obstructing the pilosebaceous orifice).
2. Excess androgen-mediated sebum production.
3. Proliferation of Cutibacterium acnes (C. acnes) within microcomedones.
4. Perifollicular immune activation and inflammatory cascades mediated by Toll-like receptor 2 (TLR-2).

### Distinguishing Non-Inflammatory vs. Inflammatory Lesions
* **Closed Comedones (Whiteheads):** Microscopic follicular plugging beneath an intact epidermal roof.
* **Open Comedones (Blackheads):** Dilated follicular orifices with melanin-oxidized sebum compacting at the surface.
* **Papules and Pustules:** Rupture of the follicular wall releasing lipids and bacterial antigens into the surrounding dermis, recruiting neutrophils and lymphocytes.
* **Cysts and Nodules:** Severe deep-seated dermal destructive inflammation requiring formal medical dermatological care (such as systemic retinoids or oral antibiotics).

## 2. Post-Inflammatory Hyperpigmentation (PIH) and Melasma
* **PIH:** Darkened macules that emerge following cutaneous trauma or resolving acne lesions. Inflammatory mediators (prostaglandins, leukotrienes) stimulate melanocytic tyrosinase, resulting in excess melanin deposition in either epidermal basal layers or dermal melanophages.
* **Melasma:** Symmetric, reticulated hyperpigmented patches primarily affecting cheeks, forehead, and upper lip. Exacerbated by ultraviolet light, visible high-energy blue light, and hormonal fluctuations.
* **Cosmetic Management:** Consistent use of tyrosinase inhibitors (Azelaic acid 10%, Niacinamide, Vitamin C, Tranexamic acid, Alpha Arbutin) combined with rigorous broad-spectrum UVA/UVB/visible light mineral sunscreens containing iron oxides.

## 3. Computer Vision Skin Feature Detection Principles
* **Acne and Erythema Detection:** Evaluates localized spectral anomalies in the red-green color channels, relative redness contrast indices, and morphological blob contours within the designated facial bounding region.
* **Pigmentation Mapping:** Evaluates melanin proxy values using the CIE L*a*b* color space (specifically variations in luminance L* and b* yellow-blue balance), identifying focal deviations from the individual's baseline facial skin tone.
* **Wrinkles and Rhytids:** Detected through high-pass filtering (Sobel/Laplacian gradient analysis and Canny edge detectors) across anatomical landmark zones (glabella, periorbital crow's feet, forehead lines, and nasolabial folds).
