import json
import os

# Load the drinks.json file
file_path = r'D:\CoreIQ\backend\data\food-data\drinks.json'

with open(file_path, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

# Define mealType rules based on drink characteristics
def assign_meal_types(drink):
    name = drink['name'].lower()
    nutrients = drink['nutrients_per_100g']
    calories = nutrients['calories']
    carbs = nutrients['carbs']
    
    meal_types = []
    
    # Zero-calorie drinks - perfect for any meal, especially low-carb
    if calories == 0:
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
    # Coffee and tea (breakfast primarily, but any time)
    elif 'coffee' in name or ('tea' in name and 'iced tea (sweetened)' not in name):
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
    # Juices - primarily breakfast
    elif 'juice' in name and 'vegetable' not in name:
        if carbs < 5:  # Low-carb juice (like tomato)
            meal_types = ['breakfast', 'lunch', 'snack']
        else:
            meal_types = ['breakfast', 'snack']
    # Milk alternatives - breakfast primarily
    elif 'milk' in name or 'latte' in name or 'cappuccino' in name:
        meal_types = ['breakfast', 'snack']
    # Smoothies - breakfast or snack
    elif 'smoothie' in name:
        meal_types = [' breakfast', 'snack']
    # Vegetable juices - any meal
    elif 'vegetable' in name or 'tomato' in name or 'celery' in name or 'cucumber' in name or 'beetroot' in name or 'carrot' in name:
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
    # Coconut water, sparkling water - any meal
    elif 'coconut water' in name or 'sparkling water' in name or 'club soda' in name:
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
    # Sodas - lunch, dinner, snack (not breakfast typically)
    elif 'soda' in name or 'cola' in name or 'pepsi' in name or 'sprite' in name or 'fanta' in name or '7 up' in name or 'mountain dew' in name or 'dr. pepper' in name or 'mirinda' in name:
        if calories == 0:  # Diet sodas
            meal_types = ['lunch', 'dinner', 'snack']
        else:  # Regular sodas
            meal_types = ['lunch', 'dinner', 'snack']
    # Lemonade and sweet drinks - primarily snack/lunch
    elif 'lemonade' in name or 'ginger ale' in name or 'ginger beer' in name or 'tonic' in name or 'birch beer' in name or 'root beer' in name or 'cream soda' in name:
        if calories == 0:
            meal_types = ['lunch', 'dinner', 'snack']
        else:
            meal_types = ['snack', 'lunch']
    # Kombucha - any time
    elif 'kombucha' in name:
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
    # Lemon/lime juice (for cooking/flavoring) - any meal
    elif 'lemon juice' in name or 'lime juice' in name:
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
    # Default for any other drinks
    else:
        meal_types = ['lunch', 'dinner', 'snack']
    
    return meal_types

# Add mealTypes to each drink
drinks_updated = []
for drink in drinks:
    drink['mealTypes'] = assign_meal_types(drink)
    drinks_updated.append(drink)

# Add Arabic/Middle Eastern drinks
arabic_drinks = [
    {
        "name": "Arabic Coffee (Qahwa)",
        "description": "Traditional Arabic coffee, strong and lightly spiced with cardamom.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 2,
            "protein": 0.1,
            "fat": 0.0,
            "carbs": 0.0
        },
        "servings": [
            {"size": "1 small cup (60ml)", "calories": 1, "protein": 0.1, "fat": 0.0, "carbs": 0.0}
        ],
        "mealTypes": ["breakfast", "lunch", "dinner", "snack"]
    },
    {
        "name": "Turkish Coffee",
        "description": "Strong, finely ground coffee brewed in a cezve.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 2,
            "protein": 0.1,
            "fat": 0.0,
            "carbs": 0.0
        },
        "servings": [
            {"size": "1 small cup (60ml)", "calories": 1, "protein": 0.1, "fat": 0.0, "carbs": 0.0}
        ],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Mint Tea (Arabic Style)",
        "description": "Sweet mint tea, popular in Middle Eastern cuisine.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 1,
            "protein": 0.0,
            "fat": 0.0,
            "carbs": 0.2
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 2, "protein": 0.0, "fat": 0.0, "carbs": 0.5}
        ],
        "mealTypes": ["breakfast", "lunch", "dinner", "snack"]
    },
    {
        "name": "Jallab",
        "description": "Traditional Middle Eastern drink made from dates, grape molasses, and rose water.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 45,
            "protein": 0.2,
            "fat": 0.1,
            "carbs": 11.0
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 108, "protein": 0.5, "fat": 0.2, "carbs": 26.4}
        ],
        "mealTypes": ["snack", "dessert"]
    },
    {
        "name": "Tamar Hindi (Tamarind Juice)",
        "description": "Tangy tamarind juice, popular during Ramadan.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 40,
            "protein": 0.3,
            "fat": 0.1,
            "carbs": 10.0
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 96, "protein": 0.7, "fat": 0.2, "carbs": 24.0}
        ],
        "mealTypes": ["lunch", "dinner", "snack"]
    },
    {
        "name": "Ayran (Salted Yogurt Drink)",
        "description": "Refreshing salted yogurt drink, popular in Middle Eastern and Turkish cuisine.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 30,
            "protein": 1.5,
            "fat": 1.0,
            "carbs": 3.5
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 72, "protein": 3.6, "fat": 2.4, "carbs": 8.4}
        ],
        "mealTypes": ["lunch", "dinner", "snack"]
    },
    {
        "name": "Laban (Buttermilk)",
        "description": "Traditional Middle Eastern cultured buttermilk, similar to ayran.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 40,
            "protein": 3.3,
            "fat": 1.0,
            "carbs": 4.8
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 96, "protein": 7.9, "fat": 2.4, "carbs": 11.5}
        ],
        "mealTypes": ["breakfast", "lunch", "dinner", "snack"]
    },
    {
        "name": "Sahlab (Hot Milk Drink)",
        "description": "Warm, creamy Middle Eastern drink made from milk, orchid root powder, and topped with cinnamon and nuts.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 80,
            "protein": 3.0,
            "fat": 3.5,
            "carbs": 9.0
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 192, "protein": 7.2, "fat": 8.4, "carbs": 21.6}
        ],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Karkade (Hibiscus Tea)",
        "description": "Ruby-red tea made from dried hibiscus flowers, served hot or cold.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 1,
            "protein": 0.0,
            "fat": 0.0,
            "carbs": 0.1
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 2, "protein": 0.0, "fat": 0.0, "carbs": 0.2}
        ],
        "mealTypes": ["breakfast", "lunch", "dinner", "snack"]
    },
    {
        "name": "Qamar al-Din Juice",
        "description": "Apricot juice made from dried apricot leather, popular during Ramadan.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 50,
            "protein": 0.5,
            "fat": 0.1,
            "carbs": 12.0
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 120, "protein": 1.2, "fat": 0.2, "carbs": 28.8}
        ],
        "mealTypes": ["breakfast", "snack"]
    },
    {
        "name": "Limonana (Mint Lemonade)",
        "description": "Refreshing Middle Eastern frozen mint lemonade.",
        "category": "drinks",
        "nutrients_per_100g": {
            "calories": 38,
            "protein": 0.1,
            "fat": 0.0,
            "carbs": 9.5
        },
        "servings": [
            {"size": "1 cup (240ml)", "calories": 91, "protein": 0.2, "fat": 0.0, "carbs": 22.8}
        ],
        "mealTypes": ["lunch", "snack"]
    }
]

# Add Arabic drinks to the list
drinks_updated.extend(arabic_drinks)

# Save the updated drinks.json
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(drinks_updated, f, indent=2, ensure_ascii=False)

print(f"✅ Updated {len(drinks)} existing drinks with mealTypes")
print(f"✅ Added {len(arabic_drinks)} Arabic drinks")
print(f"✅ Total drinks: {len(drinks_updated)}")
print(f"✅ File saved to: {file_path}")
