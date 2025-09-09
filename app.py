from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow ESP and frontend to access it

# Store data here
sensor_data = {
    "temperature": None,
    "relay": None
}

@app.route('/')
def home():
    return render_template('dashboard.html')  # Your beautiful HTML

@app.route('/data', methods=['POST'])
def receive_data():
    global sensor_data
    data = request.json
    sensor_data['temperature'] = data.get('temperature')
    sensor_data['relay'] = data.get('relay')
    return jsonify({"status": "success"})

@app.route('/get-data')
def get_data():
    return jsonify(sensor_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
