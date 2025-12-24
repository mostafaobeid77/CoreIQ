import json
import os

# File paths
grains_path = r'D:\CoreIQ\backend\data\food-data\grains_carbs.json'
proteins_path = r'D:\CoreIQ\backend\data\food-data\protiens.json'

# Arabic Grains & Breads
arabic_grains = [
    {
        "name": "Manakish (Za'atar)",
        "description": "Traditional Lebanese flatbread topped with za'atar, olive oil, and sesame seeds.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 280, "protein": 7, "fat": 10, "carbs": 40},
        "servings": [{"size": "1 piece (120g)", "calories": 336, "protein": 8.4, "fat": 12, "carbs": 48}],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Manakish (Cheese)",
        "description": "Lebanese flatbread topped with cheese blend.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 300, "protein": 12, "fat": 12, "carbs": 35},
        "servings": [{"size": "1 piece (120g)", "calories": 360, "protein": 14.4, "fat": 14.4, "carbs": 42}],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Manakish (Lahmacun - Meat)",
        "description": "Turkish/Arabic flatbread topped with minced meat, tomatoes, and spices.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 260, "protein": 13, "fat": 9, "carbs": 32},
        "servings": [{"size": "1 piece (150g)", "calories": 390, "protein": 19.5, "fat": 13.5, "carbs": 48}],
        "mealTypes": ["breakfast", "lunch", "dinner"]
    },
    {
        "name": "Pita Bread (Arabic)",
        "description": "Traditional pocket bread, common in Middle Eastern cuisine.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 275, "protein": 9, "fat": 1.2, "carbs": 56},
        "servings": [{"size": "1 pita (60g)", "calories": 165, "protein": 5.4, "fat": 0.7, "carbs": 33.6}],
        "mealTypes": ["lunch", "dinner", "any"]
    },
    {
        "name": "Saj Bread",
        "description": "Thin unleavened flatbread baked on a convex metal griddle.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 260, "protein": 8, "fat": 1, "carbs": 53},
        "servings": [{"size": "1 bread (80g)", "calories": 208, "protein": 6.4, "fat": 0.8, "carbs": 42.4}],
        "mealTypes": ["breakfast", "lunch", "dinner"]
    },
    {
        "name": "Khubz (Arabic Bread)",
        "description": "Standard round Arabic bread, soft and fluffy.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 265, "protein": 8.5, "fat": 1, "carbs": 54},
        "servings": [{"size": "1 loaf (75g)", "calories": 199, "protein": 6.4, "fat": 0.8, "carbs": 40.5}],
        "mealTypes": ["lunch", "dinner", "any"]
    },
    {
        "name": "Bulgur (Cooked)",
        "description": "Cracked wheat, staple in Middle Eastern cuisine, used in tabbouleh and kibbeh.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 83, "protein": 3, "fat": 0.2, "carbs": 18.6},
        "servings": [{"size": "1 cup (182g)", "calories": 151, "protein": 5.5, "fat": 0.4, "carbs": 33.8}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Freekeh (Cooked)",
        "description": "Roasted green wheat, high in fiber and protein, popular in Levantine cuisine.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 130, "protein": 5, "fat": 0.5, "carbs": 25},
        "servings": [{"size": "1 cup (180g)", "calories": 234, "protein": 9, "fat": 0.9, "carbs": 45}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Foul Medames",
        "description": "Slow-cooked fava beans with olive oil, lemon, and garlic - traditional breakfast.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 110, "protein": 7, "fat": 3, "carbs": 16},
        "servings": [{"size": "1 bowl (250g)", "calories": 275, "protein": 17.5, "fat": 7.5, "carbs": 40}],
        "mealTypes": ["breakfast"]
    },
    {
        "name": "Hummus (Classic)",
        "description": "Chickpea dip with tahini, lemon, and garlic.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 166, "protein": 8, "fat": 10, "carbs": 14},
        "servings": [{"size": "2 tbsp (30g)", "calories": 50, "protein": 2.4, "fat": 3, "carbs": 4.2}],
        "mealTypes": ["breakfast", "lunch", "snack"]
    },
    {
        "name": "Fatteh (Hummus Fatteh)",
        "description": "Crispy bread layered with chickpeas, yogurt, tahini, and pine nuts.",
        "category": "grains_carbs",
        "nutrients_per_100g": {"calories": 210, "protein": 9, "fat": 12, "carbs": 18},
        "servings": [{"size": "1 serving (200g)", "calories": 420, "protein": 18, "fat": 24, "carbs": 36}],
        "mealTypes": ["breakfast", "lunch"]
    }
]

# Arabic Proteins
arabic_proteins = [
    {
        "name": "Shawarma (Chicken, Meat Only)",
        "description": "Marinated chicken shawarma without bread, with spices and marinade.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 190, "protein": 25, "fat": 9, "carbs": 3},
        "servings": [{"size": "1 serving (150g)", "calories": 285, "protein": 37.5, "fat": 13.5, "carbs": 4.5}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Kofta (Grilled Meat Kebab)",
        "description": "Spiced ground meat (beef or lamb) grilled kebab.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 250, "protein": 20, "fat": 18, "carbs": 2},
        "servings": [{"size": "2 skewers (120g)", "calories": 300, "protein": 24, "fat": 21.6, "carbs": 2.4}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Shish Kebab (Lamb)",
        "description": "Marinated lamb chunks grilled on skewers.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 270, "protein": 22, "fat": 20, "carbs": 1},
        "servings": [{"size": "1 skewer (100g)", "calories": 270, "protein": 22, "fat": 20, "carbs": 1}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Musakhan (Chicken)",
        "description": "Palestinian roasted chicken with sumac, onions, and pine nuts.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 210, "protein": 23, "fat": 12, "carbs": 4},
        "servings": [{"size": "1 serving (200g)", "calories": 420, "protein": 46, "fat": 24, "carbs": 8}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Makloubeh (Upside-Down Rice - Meat Portion)",
        "description": "Meat portion of traditional Levantine dish with spices.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 200, "protein": 18, "fat": 13, "carbs": 3},
        "servings": [{"size": "1 serving (150g)", "calories": 300, "protein": 27, "fat": 19.5, "carbs": 4.5}],
        "mealTypes": ["lunch", "dinner"]
    },
    {
        "name": "Arayes (Meat-Stuffed Pita)",
        "description": "Pita bread stuffed with spiced ground meat and grilled.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 280, "protein": 15, "fat": 14, "carbs": 25},
        "servings": [{"size": "1 piece (120g)", "calories": 336, "protein": 18, "fat": 16.8, "carbs": 30}],
        "mealTypes": ["lunch", "dinner", "snack"]
    },
    {
        "name": "Sambousek (Meat, Baked)",
        "description": "Triangular savory pastry filled with spiced meat.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 290, "protein": 12, "fat": 16, "carbs": 25},
        "servings": [{"size": "2 pieces (80g)", "calories": 232, "protein": 9.6, "fat": 12.8, "carbs": 20}],
        "mealTypes": ["snack", "lunch"]
    },
    {
        "name": "Labneh Balls (in Olive Oil)",
        "description": "Strained yogurt cheese balls preserved in olive oil with herbs.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 180, "protein": 8, "fat": 15, "carbs": 4},
        "servings": [{"size": "3 balls (50g)", "calories": 90, "protein": 4, "fat": 7.5, "carbs": 2}],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Shanklish (Aged Cheese)",
        "description": "Fermented cheese rolled in za'atar and chili oil.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 220, "protein": 18, "fat": 16, "carbs": 3},
        "servings": [{"size": "50g", "calories": 110, "protein": 9, "fat": 8, "carbs": 1.5}],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Eggs with Awarma",
        "description": "Scrambled eggs with preserved meat (awarma) in fat.",
        "category": "protiens",
        "nutrients_per_100g": {"calories": 250, "protein": 16, "fat": 20, "carbs": 2},
        "servings": [{"size": "1 serving (150g)", "calories": 375, "protein": 24, "fat": 30, "carbs": 3}],
        "mealTypes": ["breakfast"]
    }
]

# Load existing data and append
print("Loading existing grains_carbs.json...")
with open(grains_path, 'r', encoding='utf-8') as f:
    grains_data = json.load(f)

print("Loading existing protiens.json...")
with open(proteins_path, 'r', encoding='utf-8') as f:
    proteins_data = json.load(f)

# Add Arabic foods
print(f"\nAdding {len(arabic_grains)} Arabic grains/breads...")
grains_data.extend(arabic_grains)

print(f"Adding {len(arabic_proteins)} Arabic proteins...")
proteins_data.extend(arabic_proteins)

# Save updated files
print("\nSaving updated grains_carbs.json...")
with open(grains_path, 'w', encoding='utf-8') as f:
    json.dump(grains_data, f, indent=2, ensure_ascii=False)

print("Saving updated protiens.json...")
with open(proteins_path, 'w', encoding='utf-8') as f:
    json.dump(proteins_data, f, indent=2, ensure_ascii=False)

print("\n✅ SUCCESS!")
print(f"Total grains/carbs: {len(grains_data)}")
print(f"Total proteins: {len(proteins_data)}")
print(f"\nAdded Arabic Foods:")
print(f"  - Breakfast: Manakish, Foul Medames, Eggs with Awarma, Labneh Balls")
print(f"  - Lunch/Dinner: Shawarma, Kofta, Shish Kebab, Musakhan, Arayes")
print(f"  - Snacks: Sambousek, Shanklish, Hummus")
