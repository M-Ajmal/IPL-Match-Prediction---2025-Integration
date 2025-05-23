from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import pickle
import csv
import pandas as pd
import numpy as np
from collections import defaultdict
from functools import wraps
import logging
from pathlib import Path

import points_table
import Orangecap_2025
import Mosthalfcenturies
import BestBattingAvg
import PurpleCap
import BestBowlingFigures
import GreenDotBalls
import team_player
from predict_ipl_match import (
    load_model_files,
    prepare_prediction_features,
    predict_match_outcome,
    display_team_form,
    display_head_to_head
)
from TeamPerformanceAnalysis import (
    comprehensive_team_analysis,
    display_team_analysis,
    get_team_analysis,
    list_available_teams
)


app = Flask(__name__)

IPL_DATA = None
def initialize():
    global IPL_DATA
    try:
        IPL_DATA = pd.read_csv('dataset/preprocessed_ipl_data.csv')
        print("IPL dataset loaded successfully!")
    except Exception as e:
        print(f"Failed to load IPL dataset: {e}")
        IPL_DATA = None

initialize()

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

matches_df = None
ipl_2025_df = None
model, scaler, features, team_stats, label_encoders, team_matchups = load_model_files()


# === DATASET ===
def load_data():
    global matches_df, ipl_2025_df
    try:
        matches_df = pd.read_csv('dataset/processed/match_df_standardized.csv')
        ipl_2025_df = pd.read_csv('dataset/processed/ipl_2025_raw.csv')
        logger.info("Data loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return False

def error_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({
                "error": str(e),
                "status": "error"
            }), 500
    return decorated_function

if not load_data():
    logger.warning("Failed to load initial data")

@app.route('/api/points-table', methods=['GET'])
def get_points_table():
    """Get points table for specified year"""
    year = request.args.get('year', '2025')
    try:
        year = int(year)
    except ValueError:
        return jsonify({"error": "Invalid year format"}), 400

    refresh = request.args.get('refresh', 'false').lower() == 'true'

    if refresh:
        try:
            data = points_table.fetch_points_table(year)
            return jsonify({"year": year, "data": data, "source": "live"})
        except Exception as e:
            return jsonify({"error": f"Failed to fetch data: {str(e)}"}), 500

    try:
        data = points_table.get_saved_points_table(year)
        if data:
            return jsonify({"year": year, "data": data, "source": "cached"})
        else:
            data = points_table.fetch_points_table(year)
            return jsonify({"year": year, "data": data, "source": "live"})
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve data: {str(e)}"}), 500


@app.route('/api/available-years', methods=['GET', 'OPTIONS'])
def get_available_years():
    """Get available years for points tables"""
    if request.method == 'OPTIONS':
        return '', 200
        
    folder_name = "IPL Points Tables"
    try:
        years = []
        if os.path.exists(folder_name):
            for file in os.listdir(folder_name):
                if file.startswith("IPL_Points_Table_") and file.endswith(".csv"):
                    year = file.replace("IPL_Points_Table_", "").replace(".csv", "")
                    try:
                        years.append(int(year))
                    except ValueError:
                        pass
        return jsonify({"years": sorted(years, reverse=True)})
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve available years: {str(e)}"}), 500


@app.route('/api/all-points-tables', methods=['GET'])
def get_all_points_tables():
    """Get all points tables by year"""
    folder_name = "IPL Points Tables"
    try:
        years = []
        if os.path.exists(folder_name):
            for file in os.listdir(folder_name):
                if file.startswith("IPL_Points_Table_") and file.endswith(".csv"):
                    year = file.replace("IPL_Points_Table_", "").replace(".csv", "")
                    try:
                        years.append(int(year))
                    except ValueError:
                        pass

        years = sorted(years, reverse=True)
        all_data = {}
        for year in years:
            data = points_table.get_saved_points_table(year)
            if data:
                all_data[str(year)] = data

        return jsonify({"years": years, "data": all_data})
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve all points tables: {str(e)}"}), 500

@app.route('/api/points-teams', methods=['GET'])
def get_points_table_teams():
    """Get list of teams with abbreviations"""
    return jsonify({
        "teams": [
            {"abbreviation": abbr, "name": full_name}
            for abbr, full_name in points_table.team_name_map.items()
        ]
    })

@app.route('/api/update-points-table-2025', methods=['POST'])
def update_points_table_2025():
    """Update 2025 points table"""
    try:
        points_table.update_all_points_tables(years=[2025])
        updated_data = points_table.get_saved_points_table(2025)
        return jsonify({
            "message": "Points table for 2025 updated successfully.",
            "year": 2025,
            "data": updated_data,
            "source": "live"
        })
    except Exception as e:
        return jsonify({"error": f"Failed to update 2025 points table: {str(e)}"}), 500

# === ORANGE CAP ROUTES ===
@app.route('/api/orange-cap-2025', methods=['GET', 'POST'])
def handle_orange_cap_2025():
    """Handle Orange Cap data retrieval and updates"""
    file_path = os.path.join("Ipl_Stat_2025", "batting", "orange_cap.csv")

    if request.method == 'POST':
        try:
            Orangecap_2025.fetch_orange_cap_data()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch Orange Cap data: {str(e)}"}), 500

    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
                if not rows:
                    return jsonify({"error": "Orange Cap CSV is empty"}), 500
                headers = rows[0]
                data = [dict(zip(headers, row)) for row in rows[1:] if len(row) == len(headers)]
            return jsonify({
                "message": "Orange Cap data for 2025 retrieved successfully." if request.method == 'GET' else "Orange Cap data for 2025 updated successfully.",
                "year": 2025,
                "data": data,
                "source": "live" if request.method == 'POST' else "cached"
            })
        except Exception as e:
            return jsonify({"error": f"Failed to read Orange Cap CSV: {str(e)}"}), 500
    else:
        return jsonify({"error": "Orange Cap CSV not found"}), 404

# === BATTING STATISTICS ROUTES ===
@app.route('/api/most-centuries-2025', methods=['GET', 'POST'])
def handle_most_centuries_2025():
    """Handle Most Centuries data retrieval and updates"""
    file_path = os.path.join("Ipl_Stat_2025", "batting", "most_centuries.csv")
    if request.method == 'POST':
        try:
            Mosthalfcenturies.fetch_most_centuries_data()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch Most Centuries data: {str(e)}"}), 500
    
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
                if not rows:
                    return jsonify({"error": "Most Centuries CSV is empty"}), 500
                headers = rows[0]
                data = [dict(zip(headers, row)) for row in rows[1:] if len(row) == len(headers)]
            return jsonify({
                "message": "Most Centuries data for 2025 retrieved successfully." if request.method == 'GET' else "Most Centuries data for 2025 updated successfully.",
                "year": 2025,
                "data": data,
                "source": "live" if request.method == 'POST' else "cached"
            })
        except Exception as e:
            return jsonify({"error": f"Failed to read Most Centuries CSV: {str(e)}"}), 500
    else:
        return jsonify({"error": "Most Centuries CSV not found"}), 404

@app.route('/api/best-batting-average-2025', methods=['GET', 'POST'])
def handle_best_batting_average_2025():
    """Handle Best Batting Average data retrieval and updates"""
    file_path = os.path.join("Ipl_Stat_2025", "batting", "best_batting_average.csv")
    
    if request.method == 'POST':
        try:
            BestBattingAvg.fetch_best_batting_average_data()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch Best Batting Average data: {str(e)}"}), 500

    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
                if not rows:
                    return jsonify({"error": "Best Batting Average CSV is empty"}), 500
                headers = rows[0]
                data = [dict(zip(headers, row)) for row in rows[1:] if len(row) == len(headers)]
            return jsonify({
                "message": "Best Batting Average data for 2025 retrieved successfully." if request.method == 'GET' else "Best Batting Average data for 2025 updated successfully.",
                "year": 2025,
                "data": data,
                "source": "live" if request.method == 'POST' else "cached"
            })
        except Exception as e:
            return jsonify({"error": f"Failed to read Best Batting Average CSV: {str(e)}"}), 500
    else:
        return jsonify({"error": "Best Batting Average CSV not found"}), 404

# === BOWLING STATISTICS ROUTES ===
@app.route('/api/purple-cap-2025', methods=['GET', 'POST'])
def handle_purple_cap_2025():
    """Handle Purple Cap data retrieval and updates"""
    file_path = os.path.join("Ipl_Stat_2025", "bowling", "purple_cap.csv")
    
    if request.method == 'POST':
        try:
            PurpleCap.fetch_purple_cap_data()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch Purple Cap data: {str(e)}"}), 500

    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
                if not rows:
                    return jsonify({"error": "Purple Cap CSV is empty"}), 500
                headers = rows[0]
                data = [dict(zip(headers, row)) for row in rows[1:] if len(row) == len(headers)]
            return jsonify({
                "message": "Purple Cap data for 2025 retrieved successfully." if request.method == 'GET' else "Purple Cap data for 2025 updated successfully.",
                "year": 2025,
                "data": data,
                "source": "live" if request.method == 'POST' else "cached"
            })
        except Exception as e:
            return jsonify({"error": f"Failed to read Purple Cap CSV: {str(e)}"}), 500
    else:
        return jsonify({"error": "Purple Cap CSV not found"}), 404

@app.route('/api/best-bowling-figures-2025', methods=['GET', 'POST'])
def handle_best_bowling_figures_2025():
    """Handle Best Bowling Figures data retrieval and updates"""
    file_path = os.path.join("Ipl_Stat_2025", "bowling", "best_bowling_figures.csv")
    
    if request.method == 'POST':
        try:
            BestBowlingFigures.fetch_best_bowling_figures_data()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch Best Bowling Figures data: {str(e)}"}), 500

    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
                if not rows:
                    return jsonify({"error": "Best Bowling Figures CSV is empty"}), 500
                headers = rows[0]
                data = [dict(zip(headers, row)) for row in rows[1:] if len(row) == len(headers)]
            return jsonify({
                "message": "Best Bowling Figures data for 2025 retrieved successfully." if request.method == 'GET' else "Best Bowling Figures data for 2025 updated successfully.",
                "year": 2025,
                "data": data,
                "source": "live" if request.method == 'POST' else "cached"
            })
        except Exception as e:
            return jsonify({"error": f"Failed to read Best Bowling Figures CSV: {str(e)}"}), 500
    else:
        return jsonify({"error": "Best Bowling Figures CSV not found"}), 404

@app.route('/api/green-dot-balls-2025', methods=['GET', 'POST'])
def handle_green_dot_balls_2025():
    """Handle Green Dot Balls data retrieval and updates"""
    file_path = os.path.join("Ipl_Stat_2025", "bowling", "tata_ipl_green_dot_balls.csv")

    if request.method == 'POST':
        try:
            GreenDotBalls.fetch_green_dot_balls_data()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch Green Dot Balls data: {str(e)}"}), 500

    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
                if not rows:
                    return jsonify({"error": "Green Dot Balls CSV is empty"}), 500
                headers = rows[0]
                data = [dict(zip(headers, row)) for row in rows[1:] if len(row) == len(headers)]
            return jsonify({
                "message": "Green Dot Balls data for 2025 retrieved successfully." if request.method == 'GET' else "Green Dot Balls data for 2025 updated successfully.",
                "year": 2025,
                "data": data,
                "source": "live" if request.method == 'POST' else "cached"
            })
        except Exception as e:
            return jsonify({"error": f"Failed to read Green Dot Balls CSV: {str(e)}"}), 500
    else:
        return jsonify({"error": "Green Dot Balls CSV not found"}), 404

# === PLAYER ROUTES ===
@app.route('/api/player', methods=['GET'])
def get_teams():
    """Get all teams"""
    try:
        teams = team_player.get_all_teams()
        return jsonify(teams)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/player/<string:team_id>', methods=['GET'])
def get_team_info(team_id):
    """Get team info by ID"""
    try:
        info = team_player.get_team_info(team_id)
        if 'error' in info:
            return jsonify(info), 404
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/player/<string:team_id>/players', methods=['GET'])
def get_team_players(team_id):
    """Get team players with optional role filter"""
    try:
        role = request.args.get('role', 'All')
        players = team_player.get_team_players(team_id, role_filter=role)
        if 'error' in players:
            return jsonify(players), 404
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/player/roles', methods=['GET'])
def get_roles():
    """Get all unique roles"""
    try:
        roles = team_player.get_all_roles()
        return jsonify(roles)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === PREDICTION ROUTES ===

@app.route('/api/venues', methods=['GET'])
def get_venues():
    """Get all available venues"""
    if label_encoders is None or 'venue' not in label_encoders:
        return jsonify({"error": "Venue data not loaded properly"}), 500
    
    venues = sorted(label_encoders['venue'].classes_)
    return jsonify({"venues": venues})

@app.route('/api/team/<team_name>/stats', methods=['GET'])
def get_team_stats(team_name):
    """Get detailed stats for a specific team"""
    if team_stats is None:
        return jsonify({"error": "Model files not loaded properly"}), 500
    
    if team_name not in team_stats:
        return jsonify({"error": f"Team '{team_name}' not found"}), 404
    
    team_data = team_stats[team_name]
    win_rate = team_data['wins'] / max(1, team_data['matches'])
    last_5 = team_data.get('last_5', [])[-5:] if 'last_5' in team_data else []
    form_display = ['W' if result == 1 else 'L' for result in last_5]
    form_percentage = sum(last_5) / len(last_5) if last_5 else 0
    
    response_data = {
        "team_name": team_name,
        "total_matches": team_data['matches'],
        "total_wins": team_data['wins'],
        "win_rate": win_rate,
        "recent_form": form_display,
        "form_percentage": form_percentage,
    }
    
    if 'venues' in team_data:
        venue_stats = {}
        for venue, stats in team_data['venues'].items():
            venue_win_rate = stats['wins'] / max(1, stats['played'])
            venue_stats[venue] = {
                "matches_played": stats['played'],
                "wins": stats['wins'],
                "win_rate": venue_win_rate,
                "avg_runs": stats.get('avg_runs', 0),
            }
        response_data["venue_stats"] = venue_stats
    
    toss_wins = team_data.get('toss_wins', 0)
    toss_total = team_data.get('toss_total', 0)
    response_data["toss_stats"] = {
        "toss_wins": toss_wins,
        "toss_total": toss_total,
        "toss_win_rate": toss_wins / max(1, toss_total) if toss_total > 0 else 0,
        "wins_after_toss_win": team_data.get('wins_after_toss_win', 0),
    }
    
    return jsonify(response_data)

@app.route('/api/predict', methods=['POST'])
def predict_match():
    try:
        data = request.get_json()
        
        required_fields = ['team1', 'team2', 'venue', 'toss_winner', 'toss_decision']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        team1 = data['team1']
        team2 = data['team2']
        venue = data['venue']
        toss_winner = data['toss_winner']
        toss_decision = data['toss_decision']
        
        prediction_data = predict_match_outcome(team1, team2, venue, toss_winner, toss_decision)
        if prediction_data is None:
            return jsonify({"error": "Failed to make prediction"}), 500
        
        response = {
            "match_details": {
                "team1": team1,
                "team2": team2,
                "venue": venue,
                "toss_winner": toss_winner,
                "toss_decision": toss_decision
            },
            "prediction": prediction_data["prediction"],
            "key_factors": prediction_data["key_factors"]
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/venue/<venue_name>/stats', methods=['GET'])
def get_venue_stats(venue_name):
    venue_name = venue_name.strip().lower()
    venue_stats_data = {}

    for team, data in team_stats.items():
        venues = data.get('venues', {})
        if venue_name in [v.lower() for v in venues]:
            actual_venue_key = next(v for v in venues if v.lower() == venue_name)
            venue_info = venues[actual_venue_key]
            venue_stats_data[team] = {
                "played": venue_info.get("played", 0),
                "wins": venue_info.get("wins", 0),
                "win_rate": venue_info.get("wins", 0) / max(1, venue_info.get("played", 1)),
                "avg_runs": venue_info.get("avg_runs", None)
            }

    return jsonify({"team_stats": venue_stats_data})


# === TEAM ANALYSIS ROUTES ===
@app.route('/api/teams', methods=['GET'])
@error_handler
def get_all_teams():
    """Get list of all available teams"""
    if matches_df is None or ipl_2025_df is None:
        return jsonify({
            "error": "Data not loaded",
            "status": "error"
        }), 500
    
    teams = list_available_teams(matches_df, ipl_2025_df, return_list=True)
    return jsonify({
        "teams": teams,
        "count": len(teams),
        "status": "success"
    })

@app.route('/api/teams/<team_name>', methods=['GET'])
@error_handler
def get_team_analysis_api(team_name):
    """Get analysis for a specific team"""
    if matches_df is None or ipl_2025_df is None:
        return jsonify({
            "error": "Data not loaded",
            "status": "error"
        }), 500
    
    team_stats = comprehensive_team_analysis(matches_df, ipl_2025_df, team_name)
    
    if team_stats is None:
        return jsonify({
            "error": f"Team '{team_name}' not found",
            "status": "error",
            "available_teams": list_available_teams(matches_df, ipl_2025_df, return_list=True)
        }), 404
    
    return jsonify({
        "team": team_name,
        "stats": team_stats,
        "status": "success"
    })

@app.route('/api/teams/all', methods=['GET'])
@error_handler
def get_all_teams_analysis():
    if matches_df is None or ipl_2025_df is None:
        return jsonify({
            "error": "Data not loaded",
            "status": "error"
        }), 500
    
    all_stats = comprehensive_team_analysis(matches_df, ipl_2025_df)
    
    return jsonify({
        "teams": all_stats,
        "count": len(all_stats),
        "status": "success"
    })

# === HEALTH CHECK ===
@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    if model is None or scaler is None or features is None or team_stats is None or label_encoders is None:
        return jsonify({
            "status": "error",
            "message": "One or more required model components not loaded",
            "components": {
                "model": model is not None,
                "scaler": scaler is not None,
                "features": features is not None,
                "team_stats": team_stats is not None,
                "label_encoders": label_encoders is not None,
                "team_matchups": team_matchups is not None
            }
        }), 500
    
    return jsonify({
        "status": "healthy",
        "message": "API is running and all model components are loaded",
        "model_info": {
            "num_teams": len(team_stats),
            "num_venues": len(label_encoders['venue'].classes_) if 'venue' in label_encoders else 0,
            "num_features": len(features) if features else 0
        }
    })


from predict_match_ongoing import predict_match  
MODEL_PATH = 'models/ipl_predictor_model_new.joblib'

@app.route('/api/predict_match_ongoing', methods=['POST'])
def predict_match_ongoing_outcome():
    data = request.get_json()

    required_fields = [
        'batting_team', 'bowling_team', 'venue',
        'target', 'current_score', 'balls_played', 'wickets_fallen'
    ]

    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    try:
        model_result = predict_match(
            MODEL_PATH,
            data['batting_team'],
            data['bowling_team'],
            data['venue'],
            int(data['target']),
            int(data['current_score']),
            int(data['balls_played']),
            int(data['wickets_fallen'])
        )
        
        if 'error' in model_result:
            return jsonify(model_result), 400
            
        batting_team_win_probability = model_result['win_probability'] / 100 
        bowling_team_win_probability = model_result['lose_probability'] / 100 
        
        response = {
            'batting_team_win_probability': batting_team_win_probability,
            'bowling_team_win_probability': bowling_team_win_probability,
            'key_factors': {
                'runs_needed': model_result['runs_needed'],
                'balls_remaining': model_result['balls_remaining'],
                'wickets_in_hand': model_result['wickets_in_hand'],
                'current_run_rate': model_result['current_run_rate'],
                'required_run_rate': model_result['required_run_rate']
            },
            'win_factors': {
                'target_score': model_result['target'],
                'current_situation': model_result['current_situation'],
                'venue_factor': model_result['venue']
            },
            'recommendation': model_result['analysis']
        }
        
        return jsonify(response)

    except Exception as e:
        print("Backend error during prediction:", e)
        return jsonify({'error': str(e)}), 500



from ipl_analysis import analyze_team_performance, predict_ipl_2025_playoffs



@app.route('/api/team-performance/<team_name>', methods=['GET'])
def team_performance_api(team_name):
    if IPL_DATA is None:
        return jsonify({'error': 'IPL dataset not loaded'}), 500

    try:
        print(f"Running analysis for {team_name}")
        performance = analyze_team_performance(team_name, IPL_DATA)
        
        performance['season_performance'] = performance['season_performance'].to_dict(orient='records')
        performance['venue_performance'] = performance['venue_performance'].to_dict(orient='records')
        performance['opponent_performance']['best'] = performance['opponent_performance']['best'].to_dict(orient='records')
        performance['opponent_performance']['worst'] = performance['opponent_performance']['worst'].to_dict(orient='records')

        print(f"Analysis complete for {team_name}")
        return jsonify(performance)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/playoff-prediction', methods=['GET'])
def playoff_prediction_api():
    if IPL_DATA is None:
        return jsonify({'error': 'IPL dataset not loaded'}), 500

    try:
        print("Running playoff prediction...")
        predictions = predict_ipl_2025_playoffs(IPL_DATA)

        if 'team_metrics' in predictions:
            predictions['team_metrics'] = predictions['team_metrics'].to_dict(orient='records')

        print("Playoff prediction computed.")
        return jsonify(predictions)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/upload-points-table', methods=['POST'])
def upload_points_table():
    """API endpoint to upload a points table CSV file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.csv'):

        file_path = os.path.join('uploads', 'IPL_Points_Table_2025.csv')
        file.save(file_path)
        
        try:
            predictions = predict_ipl_2025_playoffs(IPL_DATA, file_path)
            
            
            return jsonify({
                'message': 'Points table uploaded successfully',
                'predictions': predictions
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file format. Please upload a CSV file'}), 400


# === MAIN ===
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))