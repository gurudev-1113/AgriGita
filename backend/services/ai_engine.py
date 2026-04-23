import math
import random
import json
import os

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def load_weights():
    weights_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'model_weights.json')
    try:
        if os.path.exists(weights_path):
            with open(weights_path, 'r') as f:
                return json.load(f)
    except: pass
    return None

def get_valve_suggestions(valves, wells):
    suggestions = []
    weights = load_weights()

    if not wells:
        suggestions.append({
            'type': 'info',
            'title': 'Add Wells First',
            'message': 'Add at least one well to get AI-based valve placement suggestions.',
            'location': None
        })
        return suggestions

    if not valves and wells:
        for well in wells:
            offsets = [(0.002, 0.002), (-0.002, 0.002), (0.002, -0.002), (-0.002, -0.002)]
            for i, (dlat, dlon) in enumerate(offsets):
                suggestions.append({
                    'type': 'placement',
                    'title': f'Suggested Valve near {well["name"]}',
                    'message': f'Place a valve at this location for optimal coverage from {well["name"]}. '
                               f'Distance: ~{int(haversine(well["latitude"], well["longitude"], well["latitude"] + dlat, well["longitude"] + dlon))}m',
                    'location': {
                        'latitude': round(well['latitude'] + dlat, 6),
                        'longitude': round(well['longitude'] + dlon, 6)
                    },
                    'score': round(random.uniform(75, 95), 1)
                })
        return suggestions

    # Analyze coverage gaps
    for well in wells:
        nearby_valves = []
        for valve in valves:
            dist = haversine(well['latitude'], well['longitude'], valve['latitude'], valve['longitude'])
            nearby_valves.append({'valve': valve, 'distance': dist})

        nearby_valves.sort(key=lambda x: x['distance'])

        if not nearby_valves or nearby_valves[0]['distance'] > 500:
            suggestions.append({
                'type': 'coverage_gap',
                'title': f'Coverage Gap: {well["name"]}',
                'message': f'No valves within 500m of {well["name"]}. Consider adding a valve nearby.',
                'location': {
                    'latitude': round(well['latitude'] + 0.001, 6),
                    'longitude': round(well['longitude'] + 0.001, 6)
                },
                'score': 90.0
            })

        # Check if valves are too clustered
        if len(nearby_valves) >= 2:
            for i in range(len(nearby_valves)):
                for j in range(i + 1, len(nearby_valves)):
                    v1 = nearby_valves[i]['valve']
                    v2 = nearby_valves[j]['valve']
                    dist = haversine(v1['latitude'], v1['longitude'], v2['latitude'], v2['longitude'])
                    if dist < 50:
                        suggestions.append({
                            'type': 'optimization',
                            'title': f'Valves Too Close',
                            'message': f'{v1["name"]} and {v2["name"]} are only {int(dist)}m apart. Consider removing one.',
                            'location': None,
                            'score': 70.0
                        })

    # Check for damaged valves
    for valve in valves:
        if valve.get('health') == 'damaged':
            suggestions.append({
                'type': 'maintenance',
                'title': f'Replace {valve["name"]}',
                'message': f'{valve["name"]} is damaged and needs replacement.',
                'location': {
                    'latitude': valve['latitude'],
                    'longitude': valve['longitude']
                },
                'score': 95.0
            })

    # General water efficiency suggestions
    active_count = sum(1 for v in valves if v.get('status'))
    if active_count > len(valves) * 0.7:
        suggestions.append({
            'type': 'efficiency',
            'title': 'High Water Usage',
            'message': f'{active_count} of {len(valves)} valves are active. Consider staggering irrigation schedules.',
            'location': None,
            'score': 65.0
        })

    if not suggestions:
        suggestions.append({
            'type': 'info',
            'title': 'System Optimized',
            'message': 'Your current valve placement looks well optimized! No changes recommended.',
            'location': None,
            'score': 100.0
        })

    if weights:
        suggestions.append({
            'type': 'optimization',
            'title': 'ML Model Insight',
            'message': f"System performance is {weights.get('status', 'normal')}. "
                       f"Historical daily usage is {weights.get('daily_avg_usage', 0)}L. "
                       f"Efficiency analysis based on {weights.get('total_trained_on', 0)} valves complete.",
            'location': None,
            'score': 100.0
        })

    suggestions.sort(key=lambda x: x.get('score', 0), reverse=True)
    return suggestions

def get_product_recommendations(damaged_valves):
    products = [
        {
            'name': 'AquaFlow Pro 3000 Irrigation Valve',
            'price': '₹2,499',
            'rating': 4.5,
            'description': 'Heavy-duty brass gate valve with 25mm bore. Corrosion-resistant, suitable for underground pipelines.',
            'link': '#',
            'image': '🔧'
        },
        {
            'name': 'FarmGuard Smart Solenoid Valve',
            'price': '₹3,999',
            'rating': 4.7,
            'description': 'IoT-enabled 12V DC solenoid valve with remote control capability. Weatherproof design.',
            'link': '#',
            'image': '⚡'
        },
        {
            'name': 'IrriMax Ball Valve 40mm',
            'price': '₹899',
            'rating': 4.2,
            'description': 'PVC ball valve for drip irrigation. Lightweight, UV-resistant, easy to install.',
            'link': '#',
            'image': '💧'
        },
        {
            'name': 'HydroTech Butterfly Valve',
            'price': '₹5,499',
            'rating': 4.8,
            'description': 'Industrial-grade butterfly valve for main pipeline. Stainless steel disc, EPDM seat.',
            'link': '#',
            'image': '🏭'
        }
    ]

    recommendations = []
    for valve in damaged_valves:
        recs = random.sample(products, min(3, len(products)))
        recommendations.append({
            'valve': valve,
            'products': recs
        })

    return recommendations
