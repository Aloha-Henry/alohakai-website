import json
import re
import os
from typing import Dict, List

def sanitize_id(name: str) -> str:
    return re.sub(r'[^a-zA-Z0-9-]', '-', name.lower()).strip('-')

def get_cuisine_label(place: Dict) -> str:
    """Map food subtypes to display labels"""
    name = place.get('name', '').lower()
    subtype = place.get('subtype', '')
    price = place.get('details', {}).get('price_range', '')
    
    # Special cases
    if 'beach house' in name or price == '$$$':
        return 'FINE DINING'
    
    cuisine_map = {
        'mexican': 'TACOS',
        'pizza': 'PIZZA',
        'italian': 'ITALIAN',
        'sushi': 'SUSHI',
        'seafood': 'SEAFOOD',
        'american': 'AMERICAN',
        'asian': 'ASIAN',
        'thai': 'THAI',
        'japanese': 'JAPANESE',
        'coffee': 'COFFEE',
        'bar': 'BAR',
        'bakery': 'BAKERY'
    }
    
    return cuisine_map.get(subtype, subtype.upper().replace('_', ' '))


def generate_tags(place: Dict) -> List[str]:
    """Generate relevant tags from JSON fields"""
    tags = []
    
    category = place.get('category')
    
    # Price always first
    price = place.get('details', {}).get('price_range', '')
    if price:
        tags.append(f'<span class="tag">{price}</span>')
    elif category == 'beach':
        tags.append('<span class="tag">FREE</span>')
    
    # Food places - vibe and must try
    if category == 'food':
        vibe = place.get('details', {}).get('vibe', [])
        if vibe:
            tags.append(f'<span class="tag">{vibe[0].upper().replace("_", " ")}</span>')
        
        must_try = place.get('food_intel', {}).get('must_try', [])
        if must_try:
            item = must_try[0].split()[0]  # Just first word
            tags.append(f'<span class="tag hot">{item.upper()}</span>')
    
    # Beaches - best for and conditions
    elif category == 'beach':
        best_for = place.get('best_for', [])
        if best_for:
            tags.append(f'<span class="tag">{best_for[0].upper()}</span>')
        
        # Check conditions
        conditions = place.get('conditions', {})
        if conditions.get('snorkeling') == 'excellent':
            tags.append('<span class="tag hot">SNORKEL</span>')
        elif conditions.get('surfing') in ['good', 'excellent']:
            tags.append('<span class="tag hot">SURF</span>')
    
    # Activities - from details.best_for
    elif category == 'activity':
        best_for = place.get('details', {}).get('best_for', [])
        if best_for:
            tags.append(f'<span class="tag">{best_for[0].upper()}</span>')
        
        price_level = place.get('details', {}).get('price_level', '')
        if price_level:
            tags.append(f'<span class="tag">{price_level}</span>')
    
    # Local favorite badge
    if place.get('details', {}).get('local_favorite'):
        tags.append('<span class="tag hot">LOCAL</span>')
    
    return tags[:4]  # Max 4 tags
    
def generate_card_html(place: Dict) -> str:
    place_id = place.get('place_id', sanitize_id(place['name']))
    name = place['name']
    category = place.get('category', 'place')
    
    # Visual labels
    if category == 'food':
        category_label = get_cuisine_label(place)
    elif category == 'beach':
        category_label = 'BEACH'
    elif category == 'activity':
        category_label = place.get('subtype', 'ADVENTURE').upper().replace('_', ' ')
    else:
        category_label = category.upper()
    
    city = place.get('specific_area', place.get('locality', 'Kauai'))
    
    # Subtitle
    if category == 'food':
        subtitle = place.get('subtype', '').replace('_', ' ').title()
    elif category == 'beach':
        features = place.get('best_for', [])
        subtitle = ' • '.join(features[:2]) if features else 'Beach'
    else:
        subtitle = place.get('subtype', 'Adventure').replace('_', ' ').title()
    
    # Kai 100
    is_kai100 = place.get('kai100', {}).get('selected', False)
    kai100_rank = place.get('kai100_rank', '')
    
    kai100_class = 'kai100' if is_kai100 else ''
    kai100_badge = ''
    if is_kai100 and kai100_rank:
        kai100_badge = f'''
                    <div class="kai100-badge">
                        <span class="kai-text">KAI 100</span>
                        <span class="kai-number">{kai100_rank:02d}</span>
                    </div>'''
    
    # Generate tags
    tags = generate_tags(place)
    tags_html = '\n                    '.join(tags)
    
    return f'''
            <div class="place-card {kai100_class}" data-id="{place_id}">
                <div class="visual-header">
                    <div class="category-label">{category_label}</div>
                    <div class="city-label">{city.upper()}</div>{kai100_badge}
                </div>
                <div class="place-title">{name}</div>
                <div class="place-subtitle">{subtitle}</div>
                <div class="tag-row">
                    {tags_html}
                </div>
                <div class="card-actions">
                    <button class="action-btn" onclick="openMap(event, '{place_id}')">MAP</button>
                    <button class="action-btn" onclick="openWebsite(event, '{place_id}')">INFO</button>
                </div>
            </div>
'''

def generate_js_data(places: List[Dict]) -> str:
    js_data = {}
    for place in places:
        place_id = place.get('place_id', sanitize_id(place['name']))
        coords = place.get('coordinates', {})
        contact = place.get('contact', place.get('logistics', {}))
        
        js_data[place_id] = {
            'name': place['name'],
            'lat': coords.get('lat'),
            'lng': coords.get('lng'),
            'website': contact.get('website', ''),
            'phone': contact.get('phone', '')
        }
    
    return f"const placeData = {json.dumps(js_data, indent=4)};"

def organize_by_category(places: List[Dict]) -> Dict:
    organized = {
        'kai100': [],
        'food': [],
        'beach': [],
        'activity': []
    }
    
    for place in places:
        if place.get('kai100', {}).get('selected'):
            organized['kai100'].append(place)
        
        category = place.get('category', 'activity')
        if category in organized:
            organized[category].append(place)
    
    # Sort Kai100 by rank
    organized['kai100'].sort(key=lambda x: x.get('kai100_rank', 999))
    
    return organized

def main():
    # Find data file
    if os.path.exists('production/full-data.json'):
        data_file = 'production/full-data.json'
        print("Using production data...")
    elif os.path.exists('test/test-data.json'):
        data_file = 'test/test-data.json'
        print("Using test data...")
    else:
        print("No data file found!")
        return
    
    # Load data
    with open(data_file, 'r') as f:
        places = json.load(f)
    
    # Organize by category
    organized = organize_by_category(places)
    
    # Generate HTML files
    for category, items in organized.items():
        if items:  # Only create file if category has items
            filename = f'generated_{category}_cards.html'
            with open(filename, 'w') as f:
                for place in items:
                    f.write(generate_card_html(place))
            print(f"   - {category}: {len(items)} cards")
    
    # Generate JavaScript data
    with open('generated_place_data.js', 'w') as f:
        f.write(generate_js_data(places))
    
    print(f"✅ Generated cards for {len(places)} places")

if __name__ == "__main__":
    main()