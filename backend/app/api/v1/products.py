from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.product import ProductResponse
from app.ai.recommendation.engine import recommendation_engine

router = APIRouter(prefix="/products", tags=["Product Marketplace"])


@router.get("", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(None, description="skincare, nutrition, fitness"),
    concern: Optional[str] = Query(None, description="e.g. acne, pigmentation, dryness, posture"),
    skin_type: Optional[str] = Query(None, description="dry, oily, combination, sensitive, normal"),
    tag: Optional[str] = Query(None, description="vegan, fragrance-free, etc."),
    max_price: Optional[float] = Query(None, description="Maximum price in USD"),
    search: Optional[str] = Query(None, description="Search keyword in name or brand")
):
    """Retrieves verified catalogue products with multi-dimensional filtering."""
    products = recommendation_engine.products

    if category:
        products = [p for p in products if p.get("category", "").lower() == category.lower()]

    if concern:
        concern_lower = concern.lower()
        products = [p for p in products if any(concern_lower in c.lower() for c in p.get("target_concerns", []))]

    if skin_type:
        st_lower = skin_type.lower()
        products = [p for p in products if "all" in p.get("skin_types", []) or st_lower in [s.lower() for s in p.get("skin_types", [])]]

    if tag:
        tag_lower = tag.lower()
        products = [p for p in products if any(tag_lower in t.lower() for t in p.get("tags", []))]

    if max_price:
        products = [p for p in products if p.get("price", 0) <= max_price]

    if search:
        s_lower = search.lower()
        products = [
            p for p in products
            if s_lower in p.get("name", "").lower() or s_lower in p.get("brand", "").lower() or s_lower in p.get("description", "").lower()
        ]

    return products


@router.get("/{id}", response_model=ProductResponse)
async def get_product_by_id(id: str):
    """Retrieves single product specification."""
    for p in recommendation_engine.products:
        if p["id"] == id:
            return p

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Product with ID '{id}' was not found in catalogue"
    )
