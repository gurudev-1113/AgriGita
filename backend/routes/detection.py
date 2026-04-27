from flask import Blueprint, request, jsonify
from services.disease_detector import detector
import os
import uuid
from werkzeug.utils import secure_filename

detection_bp = Blueprint('detection', __name__)

UPLOAD_FOLDER = 'uploads/diseases'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@detection_bp.route('/analyze', methods=['POST'])
def analyze_disease():
    print("DEBUG: Received analysis request")
    if 'image' not in request.files:
        print("DEBUG: No image in request.files")
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        print("DEBUG: Filename is empty")
        return jsonify({'error': 'No file selected'}), 400
    
    # Ensure directory exists every time to be safe
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filename = secure_filename(file.filename)
    if not filename:
        filename = f"scan_{uuid.uuid4().hex[:8]}.jpg"
        
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    print(f"DEBUG: Saving to {filepath}")
    file.save(filepath)
    
    try:
        results = detector.analyze_image(filepath)
        lang = request.form.get('lang', 'en')
        
        # Add automated AI advice & products based on results
        for res in results:
            info = get_treatment_advice(res['class'], lang=lang)
            res['advice'] = info['advice']
            res['product'] = info['product']
            res['price'] = info['price']
            res['category'] = info['category']
            
        return jsonify({
            'success': True,
            'detections': results,
            'summary': f"Found {len(results)} issues in the crop sample."
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_treatment_advice(disease_name, lang='en'):
    # Multi-lingual Agricultural Wisdom Repository
    translations_map = {
        'en': {
            'rust': {'advice': 'Apply copper-based fungicide and remove infected leaves.', 'product': 'AgriShield Copper-Max'},
            'blight': {'advice': 'Increase air circulation and reduce watering from above.', 'product': 'BioGuard BlightControl'},
            'mildew': {'advice': 'Use a neem oil spray and ensure more sunlight.', 'product': 'EcoNeem Pure Extract'},
            'no_disease': {'advice': 'No significant diseases detected! Healthy crop.', 'product': 'General Nutrients'}
        },
        'hi': {
            'rust': {'advice': 'कॉपर आधारित कवकनाशी लगाएं और संक्रमित पत्तियों को हटा दें।', 'product': 'एग्रीशील्ड कॉपर-मैक्स'},
            'blight': {'advice': 'हवा का संचार बढ़ाएं और ऊपर से पानी डालना कम करें।', 'product': 'बायोगार्ड ब्लाइटकंट्रोल'},
            'mildew': {'advice': 'नीम के तेल का स्प्रे करें और अधिक धूप सुनिश्चित करें।', 'product': 'इकोनीम प्योर एक्सट्रैक्ट'},
            'no_disease': {'advice': 'कोई बीमारी नहीं मिली! स्वस्थ फसल।', 'product': 'सामान्य पोषक तत्व'}
        },
        'mr': {
            'rust': {'advice': 'तांबेवर आधारित बुरशीनाशक वापरा आणि संक्रमित पाने काढून टाका.', 'product': 'अॅग्रिशिल्ड कॉपर-मॅक्स'},
            'blight': {'advice': 'हवा खेळती ठेवा आणि वरून पाणी देणे कमी करा.', 'product': 'बायोगार्ड ब्लाइट कंट्रोल'},
            'mildew': {'advice': 'कडुलिंबाच्या तेलाची फवारणी करा आणि जास्त सूर्यप्रकाश मिळेल याची खात्री करा.', 'product': 'इकोनीम प्युअर एक्सट्रॅक्ट'},
            'no_disease': {'advice': 'कोणताही आजार आढळला नाही! निरोगी पीक.', 'product': 'सामान्य पोषक तत्व'}
        },
        'ta': {
            'rust': {'advice': 'தாமிரம் சார்ந்த பூஞ்சைக் கொல்லியைப் பயன்படுத்தவும், பாதிக்கப்பட்ட இலைகளை அகற்றவும்.', 'product': 'அக்ரிஷீல்ட் காப்பர்-மேக்ஸ்'},
            'blight': {'advice': 'காற்று சுழற்சியை அதிகரிக்கவும், மேலிருந்து தண்ணீர் பாய்ச்சுவதைக் குறைக்கவும்.', 'product': 'பயோகார்ட் பிளைய்ட் கன்ட்ரோல்'},
            'mildew': {'advice': 'வேப்ப எண்ணெய் ஸ்ப்ரே பயன்படுத்தவும் மற்றும் அதிக சூரிய ஒளியை உறுதி செய்யவும்.', 'product': 'ஈகோநீம் பியூர் எக்ஸ்ட்ராக்ட்'},
            'no_disease': {'advice': 'நோய் எதுவும் இல்லை! ஆரோக்கியமான பயிர்.', 'product': 'பொதுவான ஊட்டச்சத்துக்கள்'}
        }
    }

    lang_data = translations_map.get(lang.lower(), translations_map['en'])
    info = lang_data.get(disease_name.lower(), lang_data.get('no_disease'))
    
    # Pricing remains constant globally
    prices = {'rust': 24.99, 'blight': 18.50, 'mildew': 12.99, 'no_disease': 0.0}
    
    return {
        'advice': info['advice'],
        'product': info['product'],
        'price': prices.get(disease_name.lower(), 15.00),
        'category': 'Treatment'
    }
