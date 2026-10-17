import pytest


@pytest.mark.asyncio
async def test_get_products_list_and_filter(client):
    res = await client.get("/api/v1/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0

    # Filter by category
    res_skin = await client.get("/api/v1/products?category=skincare")
    assert res_skin.status_code == 200
    skin_prods = res_skin.json()
    assert all(p["category"] == "skincare" for p in skin_prods)

    # Filter by search
    res_search = await client.get("/api/v1/products?search=niacinamide")
    assert res_search.status_code == 200
    search_prods = res_search.json()
    assert len(search_prods) > 0
    assert any("niacinamide" in p["name"].lower() for p in search_prods)


@pytest.mark.asyncio
async def test_get_product_by_id(client):
    res = await client.get("/api/v1/products/prod-001")
    assert res.status_code == 200
    prod = res.json()
    assert prod["id"] == "prod-001"
    assert "Barrier Defense" in prod["name"]
