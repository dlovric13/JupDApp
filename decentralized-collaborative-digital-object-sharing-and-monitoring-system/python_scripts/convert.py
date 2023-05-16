from flask import Flask, request, jsonify
from nbconvert import HTMLExporter
from flask_cors import CORS
import nbformat
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/convert": {"origins": "http://localhost:8080"}})


@app.route('/convert', methods=['POST'])
def convert():
    try:
        notebook_json = request.get_json()
        notebook = nbformat.reads(json.dumps(notebook_json), as_version=4)
        html_exporter = HTMLExporter()
        body, resources = html_exporter.from_notebook_node(notebook)
        return jsonify({'html': body})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

