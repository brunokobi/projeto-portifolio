"""
IBTrACS API - Tropical Cyclone data server
Serves historical + recent cyclone tracks from IBTrACS
Format compatible with NOAA NHC
"""

from flask import Flask, jsonify
import pandas as pd
import requests
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# Cache
cache = {"data": None, "timestamp": None}
CACHE_TTL = 3600  # 1 hour

def load_ibtracs():
    """Load IBTrACS data from public NetCDF"""
    try:
        # IBTrACS public data (CSV format available)
        url = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/IBTrACS.since1851.list.v04r01.csv"

        # Load only recent data (last 30 days) to save memory
        df = pd.read_csv(url, usecols=[
            'SID', 'SEASON', 'NUMBER', 'BASIN', 'SUBBASIN',
            'NAME', 'ISO_TIME', 'NATURE', 'LAT', 'LON', 'WMO_WIND', 'WMO_PRES'
        ])

        # Filter last 30 days
        df['ISO_TIME'] = pd.to_datetime(df['ISO_TIME'])
        cutoff = datetime.utcnow() - timedelta(days=30)
        df = df[df['ISO_TIME'] >= cutoff]

        return df
    except Exception as e:
        print(f"Error loading IBTrACS: {e}")
        return None

def parse_tracks(df):
    """Convert IBTrACS to NOAA format"""
    if df is None or df.empty:
        return []

    tracks = []
    for _, row in df.iterrows():
        if pd.isna(row['LAT']) or pd.isna(row['LON']):
            continue

        track = {
            'id': row['SID'],
            'name': row['NAME'],
            'lat': float(row['LAT']),
            'lon': float(row['LON']),
            'windSpeed': float(row['WMO_WIND']) if pd.notna(row['WMO_WIND']) else 0,
            'pressure': float(row['WMO_PRES']) if pd.notna(row['WMO_PRES']) else 1013,
            'time': row['ISO_TIME'].isoformat(),
            'type': str(row['NATURE']).lower() if pd.notna(row['NATURE']) else 'tropical storm'
        }
        tracks.append(track)

    return tracks

@app.route('/api/ibtracs', methods=['GET'])
def get_ibtracs():
    """Return IBTrACS data in NOAA-compatible format"""
    now = datetime.utcnow()

    # Check cache
    if cache['data'] and cache['timestamp']:
        if (now - cache['timestamp']).total_seconds() < CACHE_TTL:
            return jsonify(cache['data'])

    # Load fresh data
    df = load_ibtracs()
    data = parse_tracks(df)

    # Update cache
    cache['data'] = data
    cache['timestamp'] = now

    return jsonify(data)

@app.route('/api/ibtracs/count', methods=['GET'])
def get_count():
    """Return count of active cyclones"""
    data = cache.get('data', [])
    return jsonify({'count': len(data), 'timestamp': cache['timestamp'].isoformat() if cache['timestamp'] else None})

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3012, debug=False)
