import asyncio
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal, Base, async_engine
from app.models.product import Product
from app.models.wellness import ExerciseCatalogue

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))


async def seed():
    print("Initializing tables if needed...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Products
        prod_path = os.path.join(DATA_DIR, "sample_products.json")
        if os.path.exists(prod_path):
            with open(prod_path, "r", encoding="utf-8") as f:
                products = json.load(f)
                
            for p in products:
                res = await session.execute(select(Product).where(Product.id == p["id"]))
                if not res.scalar_one_or_none():
                    db_prod = Product(
                        id=p["id"],
                        name=p["name"],
                        brand=p["brand"],
                        category=p["category"],
                        subcategory=p["subcategory"],
                        price=p["price"],
                        currency=p.get("currency", "USD"),
                        rating=p.get("rating", 4.5),
                        review_count=p.get("review_count", 0),
                        description=p["description"],
                        ingredients=p.get("ingredients", []),
                        skin_types=p.get("skin_types", []),
                        target_concerns=p.get("target_concerns", []),
                        tags=p.get("tags", []),
                        affiliate_url=p["affiliate_url"],
                        image_url=p.get("image_url", "/products/placeholder.jpg"),
                        is_demo=p.get("is_demo", True)
                    )
                    session.add(db_prod)
            print(f"Products seeded: {len(products)}")

        # 2. Seed Exercises
        ex_path = os.path.join(DATA_DIR, "sample_exercises.json")
        if os.path.exists(ex_path):
            with open(ex_path, "r", encoding="utf-8") as f:
                exercises = json.load(f)

            for ex in exercises:
                res = await session.execute(select(ExerciseCatalogue).where(ExerciseCatalogue.id == ex["id"]))
                if not res.scalar_one_or_none():
                    db_ex = ExerciseCatalogue(
                        id=ex["id"],
                        name=ex["name"],
                        category=ex["category"],
                        target_muscle=ex["target_muscle"],
                        difficulty=ex.get("difficulty", "beginner"),
                        equipment=ex.get("equipment", "none"),
                        duration_seconds=ex.get("duration_seconds", 180),
                        calories_burned_est=ex.get("calories_burned_est", 20),
                        instructions=ex.get("instructions", []),
                        posture_benefit=ex.get("posture_benefit", "")
                    )
                    session.add(db_ex)
            print(f"Exercises seeded: {len(exercises)}")

        await session.commit()
    print("Database seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
