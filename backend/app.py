from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
# You'll need to download your service account key and place it in the backend folder
cred = credentials.Certificate('firebase-service-account-key.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'SmartWaste API is running'})

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all waste reports"""
    try:
        # Get query parameters
        category = request.args.get('category')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))

        # Build query
        reports_ref = db.collection('wasteReports')
        
        if category:
            reports_ref = reports_ref.where('category', '==', category)
        if status:
            reports_ref = reports_ref.where('status', '==', status)
            
        reports_ref = reports_ref.order_by('reportedAt', direction=firestore.Query.DESCENDING).limit(limit)
        
        # Execute query
        reports = []
        for doc in reports_ref.stream():
            report_data = doc.to_dict()
            report_data['id'] = doc.id
            # Convert timestamps to ISO format
            if 'reportedAt' in report_data:
                report_data['reportedAt'] = report_data['reportedAt'].isoformat()
            if 'updatedAt' in report_data:
                report_data['updatedAt'] = report_data['updatedAt'].isoformat()
            reports.append(report_data)

        return jsonify({
            'success': True,
            'data': reports,
            'count': len(reports)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports', methods=['POST'])
def create_report():
    """Create a new waste report"""
    try:
        # Verify Firebase Auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization token required'}), 401

        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']

        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'location', 'priority']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Create report document
        report_data = {
            'title': data['title'],
            'description': data['description'],
            'category': data['category'],
            'location': data['location'],
            'priority': data['priority'],
            'images': data.get('images', []),
            'status': 'Pending',
            'reportedBy': user_id,
            'reportedAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }

        # Add to Firestore
        doc_ref = db.collection('wasteReports').add(report_data)
        
        return jsonify({
            'success': True,
            'message': 'Report created successfully',
            'reportId': doc_ref[1].id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports/<report_id>', methods=['PUT'])
def update_report(report_id):
    """Update a waste report"""
    try:
        # Verify Firebase Auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization token required'}), 401

        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']

        # Get request data
        data = request.get_json()
        
        # Get the existing report
        report_ref = db.collection('wasteReports').document(report_id)
        report_doc = report_ref.get()
        
        if not report_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Report not found'
            }), 404

        # Check if user owns the report or is admin (simplified check)
        report_data = report_doc.to_dict()
        if report_data.get('reportedBy') != user_id:
            # In a real app, you'd check if user is admin
            return jsonify({
                'success': False,
                'error': 'Unauthorized to update this report'
            }), 403

        # Update allowed fields
        update_data = {
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        allowed_fields = ['status', 'title', 'description', 'category', 'priority']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        # Update the document
        report_ref.update(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Report updated successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Delete a waste report"""
    try:
        # Verify Firebase Auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization token required'}), 401

        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']

        # Get the existing report
        report_ref = db.collection('wasteReports').document(report_id)
        report_doc = report_ref.get()
        
        if not report_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Report not found'
            }), 404

        # Check if user owns the report
        report_data = report_doc.to_dict()
        if report_data.get('reportedBy') != user_id:
            return jsonify({
                'success': False,
                'error': 'Unauthorized to delete this report'
            }), 403

        # Delete the document
        report_ref.delete()
        
        return jsonify({
            'success': True,
            'message': 'Report deleted successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile information"""
    try:
        # Verify Firebase Auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authorization token required'}), 401

        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        
        # Get user from Firebase Auth
        user = auth.get_user(decoded_token['uid'])
        
        return jsonify({
            'success': True,
            'data': {
                'uid': user.uid,
                'email': user.email,
                'displayName': user.display_name,
                'emailVerified': user.email_verified
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    try:
        # Get total reports count
        total_reports = len(list(db.collection('wasteReports').stream()))
        
        # Get reports by status
        pending_reports = len(list(db.collection('wasteReports').where('status', '==', 'Pending').stream()))
        in_progress_reports = len(list(db.collection('wasteReports').where('status', '==', 'In Progress').stream()))
        resolved_reports = len(list(db.collection('wasteReports').where('status', '==', 'Resolved').stream()))
        
        # Get reports by category
        categories = ['Garbage Overflow', 'Illegal Dumping', 'Recycling Issue', 'Hazardous Waste', 'Dead Animal', 'Other']
        category_stats = {}
        for category in categories:
            count = len(list(db.collection('wasteReports').where('category', '==', category).stream()))
            category_stats[category] = count

        return jsonify({
            'success': True,
            'data': {
                'totalReports': total_reports,
                'statusStats': {
                    'pending': pending_reports,
                    'inProgress': in_progress_reports,
                    'resolved': resolved_reports
                },
                'categoryStats': category_stats
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Run the app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)