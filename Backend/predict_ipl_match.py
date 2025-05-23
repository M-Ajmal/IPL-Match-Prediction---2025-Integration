import numpy as np
import pickle
import os
from datetime import datetime
import textwrap
import pandas as pd

print("======== IPL Match Win Prediction - Enhanced Statistics Tool ========")

# Load the trained model and necessary files
def load_model_files():
    try:
        with open('models/Match_Prediction/best_rf_model.pkl', 'rb') as f:
            model = pickle.load(f)
        
        with open('models/Match_Prediction/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        
        with open('models/Match_Prediction/feature_list.pkl', 'rb') as f:
            features = pickle.load(f)
        
        with open('models/Match_Prediction/team_stats.pkl', 'rb') as f:
            team_stats = pickle.load(f)
        
        with open('models/Match_Prediction/label_encoders.pkl', 'rb') as f:
            label_encoders = pickle.load(f)
        
        # Load match history to track team-vs-team combinations
        with open('models/Match_Prediction/team_matchups.pkl', 'rb') as f:
            team_matchups = pickle.load(f)
        
        return model, scaler, features, team_stats, label_encoders, team_matchups
    
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please run the preprocessing and model training scripts first.")
        return None, None, None, None, None, None

# Function to display a stats card with formatted text
def display_stats_card(title, stats_dict):
    width = 60
    print("\n" + "=" * width)
    print(f" {title} ".center(width, "="))
    print("=" * width)
    
    for key, value in stats_dict.items():
        # Format percentages nicely
        if isinstance(value, float) and 0 <= value <= 1:
            formatted_value = f"{value*100:.2f}%"
        else:
            formatted_value = str(value)
        
        # Print each stat with description
        print(f"{key}: {formatted_value}")
    
    print("=" * width)

# Function to display head-to-head statistics
def display_head_to_head(team1, team2, team_stats):
    if 'head_to_head' not in team_stats[team1] or team2 not in team_stats[team1]['head_to_head']:
        print(f"\nNo head-to-head data available for {team1} vs {team2}")
        return
    
    h2h_data = team_stats[team1]['head_to_head'][team2]
    total_matches = h2h_data['matches']
    team1_wins = h2h_data['wins']
    team2_wins = total_matches - team1_wins
    
    h2h_stats = {
        f"Total matches between {team1} and {team2}": total_matches,
        f"{team1} wins": team1_wins,
        f"{team2} wins": team2_wins,
        f"{team1} win percentage": team1_wins / max(1, total_matches),
        f"Last encounter winner": h2h_data.get('last_winner', 'No data')
    }
    
    display_stats_card("HEAD-TO-HEAD STATISTICS", h2h_stats)

# Function to display team form and momentum
def display_team_form(team, team_stats):
    if team not in team_stats:
        print(f"\nNo form data available for {team}")
        return
    
    # Get last 5 match results (1 for win, 0 for loss)
    last_5 = team_stats[team]['last_5'][-5:] if 'last_5' in team_stats[team] and team_stats[team]['last_5'] else []
    
    # Format results for display (W for win, L for loss)
    form_display = ['W' if result == 1 else 'L' for result in last_5]
    form_string = ' → '.join(form_display) if form_display else 'No recent form data'
    
    # Calculate streak (consecutive wins or losses)
    streak = 0
    streak_type = None
    
    if last_5:
        streak = 1
        streak_type = 'W' if last_5[-1] == 1 else 'L'
        
        for i in range(len(last_5)-2, -1, -1):
            if (last_5[i] == 1 and streak_type == 'W') or (last_5[i] == 0 and streak_type == 'L'):
                streak += 1
            else:
                break
    
    streak_display = f"{streak} {streak_type}'s in a row" if streak_type else "No streak data"
    
    # Calculate form percentage
    form_percentage = sum(last_5) / len(last_5) if last_5 else 0
    
    form_stats = {
        "Recent form (last 5 matches)": form_string,
        "Current streak": streak_display,
        "Win rate in last 5 matches": form_percentage,
        "Overall win rate": team_stats[team]['wins'] / max(1, team_stats[team]['matches']),
        "Total matches played": team_stats[team]['matches'],
        "Total wins": team_stats[team]['wins']
    }
    
    display_stats_card(f"{team.upper()} FORM ANALYSIS", form_stats)

# Function to display venue statistics
def display_venue_stats(team, venue, team_stats):
    venue_stats = {}
    
    if team in team_stats and 'venues' in team_stats[team] and venue in team_stats[team]['venues']:
        v_stats = team_stats[team]['venues'][venue]
        venue_stats = {
            f"{team}'s matches at {venue}": v_stats['played'],
            f"{team}'s wins at {venue}": v_stats['wins'],
            f"{team}'s win rate at {venue}": v_stats['wins'] / max(1, v_stats['played'])
        }
    else:
        venue_stats = {
            "Status": f"No venue data available for {team} at {venue}"
        }
    
    display_stats_card(f"{team.upper()} AT {venue.upper()}", venue_stats)

# Function to display toss statistics
def display_toss_stats(team, team_stats, label_encoders):
    toss_stats = {}
    
    if team in team_stats:
        toss_wins = team_stats[team].get('toss_wins', 0)
        toss_total = team_stats[team].get('toss_total', 0)
        
        toss_stats = {
            f"{team}'s toss win rate": toss_wins / max(1, toss_total) if toss_total > 0 else 0,
            "Matches after winning toss": toss_wins
        }
    else:
        toss_stats = {
            "Status": f"No toss data available for {team}"
        }
    
    display_stats_card(f"{team.upper()} TOSS ANALYSIS", toss_stats)

# Function to prepare features for prediction with enhanced statistics
def prepare_prediction_features(team1, team2, venue, toss_winner, toss_decision, team_stats, label_encoders, features):
    # Create a dictionary to store features
    pred_data = {}
    
    # Basic inputs
    pred_data['team1'] = team1
    pred_data['team2'] = team2
    pred_data['venue'] = venue
    pred_data['toss_winner'] = toss_winner
    pred_data['toss_decision'] = toss_decision
    
    # Current date info
    current_date = datetime.now()
    pred_data['year'] = current_date.year
    pred_data['month'] = current_date.month
    
    # Get team stats
    if team1 in team_stats:
        pred_data['team1_win_rate'] = team_stats[team1]['wins'] / max(1, team_stats[team1]['matches'])
        last_5 = team_stats[team1]['last_5'][-5:] if 'last_5' in team_stats[team1] and team_stats[team1]['last_5'] else []
        pred_data['team1_last_5_form'] = sum(last_5) / max(1, len(last_5))
        
        # Venue win rate
        if venue in team_stats[team1]['venues']:
            venue_stats = team_stats[team1]['venues'][venue]
            pred_data['team1_venue_win_rate'] = venue_stats['wins'] / max(1, venue_stats['played'])
            pred_data['team1_venue_avg_runs'] = venue_stats.get('avg_runs', 0)
        else:
            pred_data['team1_venue_win_rate'] = 0.0
            pred_data['team1_venue_avg_runs'] = 0.0
        
        # Toss win rate
        pred_data['team1_toss_win_rate'] = team_stats[team1].get('toss_wins', 0) / max(1, team_stats[team1].get('toss_total', 0))
        pred_data['team1_win_after_toss_win_rate'] = team_stats[team1].get('wins_after_toss_win', 0) / max(1, team_stats[team1].get('toss_wins', 0))
        
        # Head-to-head stats
        if 'head_to_head' in team_stats[team1] and team2 in team_stats[team1]['head_to_head']:
            h2h = team_stats[team1]['head_to_head'][team2]
            pred_data['team1_h2h_win_rate'] = h2h['wins'] / max(1, h2h['matches'])
        else:
            pred_data['team1_h2h_win_rate'] = 0.0
    else:
        pred_data['team1_win_rate'] = 0.0
        pred_data['team1_last_5_form'] = 0.0
        pred_data['team1_venue_win_rate'] = 0.0
        pred_data['team1_venue_avg_runs'] = 0.0
        pred_data['team1_toss_win_rate'] = 0.0
        pred_data['team1_win_after_toss_win_rate'] = 0.0
        pred_data['team1_h2h_win_rate'] = 0.0
    
    if team2 in team_stats:
        pred_data['team2_win_rate'] = team_stats[team2]['wins'] / max(1, team_stats[team2]['matches'])
        last_5 = team_stats[team2]['last_5'][-5:] if 'last_5' in team_stats[team2] and team_stats[team2]['last_5'] else []
        pred_data['team2_last_5_form'] = sum(last_5) / max(1, len(last_5))
        
        # Venue win rate
        if venue in team_stats[team2]['venues']:
            venue_stats = team_stats[team2]['venues'][venue]
            pred_data['team2_venue_win_rate'] = venue_stats['wins'] / max(1, venue_stats['played'])
            pred_data['team2_venue_avg_runs'] = venue_stats.get('avg_runs', 0)
        else:
            pred_data['team2_venue_win_rate'] = 0.0
            pred_data['team2_venue_avg_runs'] = 0.0
        
        # Toss win rate
        pred_data['team2_toss_win_rate'] = team_stats[team2].get('toss_wins', 0) / max(1, team_stats[team2].get('toss_total', 0))
        pred_data['team2_win_after_toss_win_rate'] = team_stats[team2].get('wins_after_toss_win', 0) / max(1, team_stats[team2].get('toss_wins', 0))
        
        # Head-to-head stats (inverse of team1's perspective)
        if 'head_to_head' in team_stats[team1] and team2 in team_stats[team1]['head_to_head']:
            h2h = team_stats[team1]['head_to_head'][team2]
            pred_data['team2_h2h_win_rate'] = (h2h['matches'] - h2h['wins']) / max(1, h2h['matches'])
        else:
            pred_data['team2_h2h_win_rate'] = 0.0
    else:
        pred_data['team2_win_rate'] = 0.0
        pred_data['team2_last_5_form'] = 0.0
        pred_data['team2_venue_win_rate'] = 0.0
        pred_data['team2_venue_avg_runs'] = 0.0
        pred_data['team2_toss_win_rate'] = 0.0
        pred_data['team2_win_after_toss_win_rate'] = 0.0
        pred_data['team2_h2h_win_rate'] = 0.0
    
    # Calculate comparative features
    pred_data['win_rate_diff'] = pred_data['team1_win_rate'] - pred_data['team2_win_rate']
    pred_data['form_diff'] = pred_data['team1_last_5_form'] - pred_data['team2_last_5_form']
    pred_data['venue_win_rate_diff'] = pred_data['team1_venue_win_rate'] - pred_data['team2_venue_win_rate']
    pred_data['h2h_win_rate_diff'] = pred_data['team1_h2h_win_rate'] - pred_data['team2_h2h_win_rate']
    
    # Toss win match win feature
    pred_data['toss_win_match_win'] = 1 if toss_winner in [team1, team2] else 0
    
    # Enhanced toss features
    if toss_winner == team1:
        pred_data['toss_winner_win_rate'] = pred_data['team1_win_after_toss_win_rate']
    elif toss_winner == team2:
        pred_data['toss_winner_win_rate'] = pred_data['team2_win_after_toss_win_rate']
    else:
        pred_data['toss_winner_win_rate'] = 0.0
    
    # Encode categorical variables
    for col in ['team1', 'team2', 'venue', 'toss_winner', 'toss_decision']:
        if col in label_encoders and pred_data[col] in label_encoders[col].classes_:
            pred_data[f'{col}_encoded'] = label_encoders[col].transform([pred_data[col]])[0]
        else:
            # If the value is not in the encoder's classes, use -1 as default
            pred_data[f'{col}_encoded'] = -1

    # Handle the 'city' feature if it's included in the model features
    if 'city_encoded' in features:
        # If city information is available, use it; otherwise set to default
        if 'city' in label_encoders:
            # Map venue to city if possible (assuming venue is a stadium that maps to a city)
            # This is a placeholder - you'd need proper mapping logic
            # For now, we'll set it to -1 as a default
            pred_data['city_encoded'] = -1
        else:
            pred_data['city_encoded'] = -1
    
    # Check for any missing features that are needed by the model
    for feature in features:
        if feature not in pred_data:
            print(f"Warning: Feature '{feature}' is missing and will be set to default value 0")
            pred_data[feature] = 0
    
    return pred_data

# Function to predict match outcome
def predict_match_outcome(team1, team2, venue, toss_winner, toss_decision):
    # Load model and required files
    model, scaler, features, team_stats, label_encoders, _ = load_model_files()
    
    if model is None:
        return None
    
    # Prepare features for prediction
    pred_data = prepare_prediction_features(team1, team2, venue, toss_winner, toss_decision, team_stats, label_encoders, features)
    
    # Create a dataframe with the required features
    pred_df = pd.DataFrame([pred_data])
    
    # Extract only the features used in the model
    # Make sure all required features exist in pred_df
    for feature in features:
        if feature not in pred_df.columns:
            print(f"Warning: Feature '{feature}' needed by model but not in prediction data")
            # Add missing feature with default value
            pred_df[feature] = 0
    
    X_pred = pred_df[features].values.reshape(1, -1)
    
    # Scale the features
    X_pred_scaled = scaler.transform(X_pred)
    
    # Make prediction
    prediction_proba = model.predict_proba(X_pred_scaled)[0]
    
    # Return prediction results along with key factors
    return {
        "prediction": {
            team1: float(prediction_proba[1]),
            team2: float(prediction_proba[0])
        },
        "key_factors": {
            "win_rate_diff": pred_data['win_rate_diff'],
            "form_diff": pred_data['form_diff'],
            "venue_advantage": pred_data['venue_win_rate_diff'],
            "h2h_advantage": pred_data.get('h2h_win_rate_diff', 0.0),
            "toss_advantage": pred_data['toss_winner_win_rate'] if toss_winner in [team1, team2] else 0.0
        }
    }

# Function to display the prediction in a user-friendly format
def display_prediction(prediction_data, team1, team2, toss_winner):
    if prediction_data is None:
        return
    
    prediction = prediction_data["prediction"]
    key_factors = prediction_data["key_factors"]
    
    teams = list(prediction.keys())
    probabilities = list(prediction.values())
    
    print("\n" + "="*60)
    print(" MATCH PREDICTION SUMMARY ".center(60, "="))
    print("="*60)
    
    print(f"{teams[0]}: {probabilities[0] * 100:.2f}% chance of winning")
    print(f"{teams[1]}: {probabilities[1] * 100:.2f}% chance of winning")
    
    # Determine the favorite
    if probabilities[0] > probabilities[1]:
        favorite = teams[0]
        underdog = teams[1]
        win_prob = probabilities[0]
    else:
        favorite = teams[1]
        underdog = teams[0]
        win_prob = probabilities[1]
    
    print(f"\n🏆 {favorite} is favored to win with a {win_prob * 100:.2f}% probability")
    
    # Display key factors that influenced the prediction
    print("\n" + "="*60)
    print(" KEY INFLUENCING FACTORS ".center(60, "="))
    print("="*60)
    
    # Format the key factors for display
    factors_dict = {}
    
    # Overall win rate comparison
    win_rate_diff = key_factors["win_rate_diff"]
    better_win_rate_team = team1 if win_rate_diff > 0 else team2
    factors_dict["Overall win rate advantage"] = f"{better_win_rate_team} (+{abs(win_rate_diff)*100:.2f}%)"
    
    # Recent form comparison
    form_diff = key_factors["form_diff"]
    better_form_team = team1 if form_diff > 0 else team2
    factors_dict["Recent form advantage"] = f"{better_form_team} (+{abs(form_diff)*100:.2f}%)"
    
    # Venue advantage
    venue_adv = key_factors["venue_advantage"]
    better_venue_team = team1 if venue_adv > 0 else team2
    factors_dict["Venue advantage"] = f"{better_venue_team} (+{abs(venue_adv)*100:.2f}%)"
    
    # Head-to-head advantage
    h2h_adv = key_factors["h2h_advantage"]
    better_h2h_team = team1 if h2h_adv > 0 else team2
    factors_dict["Head-to-head advantage"] = f"{better_h2h_team} (+{abs(h2h_adv)*100:.2f}%)"
    
    # Toss advantage
    toss_adv = key_factors["toss_advantage"]
    if toss_adv > 0:
        factors_dict["Toss advantage"] = f"{toss_winner} (+{toss_adv*100:.2f}%)"
    
    # Display the factors
    for factor, value in factors_dict.items():
        print(f"{factor}: {value}")
    
    print("="*60)

def main():
    print("\nWelcome to the Enhanced IPL Match Prediction Tool!")
    print("This tool provides detailed team statistics and match predictions based on historical data")

    # Load model and required files to access label encoders and team stats
    model, scaler, features, team_stats, label_encoders, team_matchups = load_model_files()
    if model is None:
        return

    # ===== Display teams with numbers =====
    teams = sorted(team_stats.keys())
    print("\nAvailable Teams:")
    for i, team in enumerate(teams, start=1):
        print(f"{i}. {team}")
    
    # Get Team 1 selection
    while True:
        try:
            team1_idx = int(input("Select Team 1 (enter number): ")) - 1
            if 0 <= team1_idx < len(teams):
                team1 = teams[team1_idx]
                break
            else:
                print(f"Please enter a number between 1 and {len(teams)}")
        except ValueError:
            print("Please enter a valid number")
    
    # Display team 1 stats
    display_team_form(team1, team_stats)
    
    # Check which teams Team 1 has played against
    if team_matchups and team1 in team_matchups:
        # Filter teams that Team 1 has played against
        played_against = team_matchups[team1]
        available_opponents = sorted(played_against)
        
        if not available_opponents:
            print(f"\nError: {team1} has not played against any team in the dataset.")
            return
        
        print(f"\nTeams that {team1} has played against:")
        for i, team in enumerate(available_opponents, start=1):
            print(f"{i}. {team}")
        
        # Get Team 2 selection
        while True:
            try:
                team2_idx = int(input("Select Team 2 (enter number): ")) - 1
                if 0 <= team2_idx < len(available_opponents):
                    team2 = available_opponents[team2_idx]
                    break
                else:
                    print(f"Please enter a number between 1 and {len(available_opponents)}")
            except ValueError:
                print("Please enter a valid number")
    else:
        # If no matchup data available, fall back to showing all teams
        print("\nWarning: No matchup data available. Showing all teams.")
        teams_without_team1 = [t for t in teams if t != team1]
        print("\nAvailable Teams for Team 2:")
        for i, team in enumerate(teams_without_team1, start=1):
            print(f"{i}. {team}")
        
        # Get Team 2 selection
        while True:
            try:
                team2_idx = int(input("Select Team 2 (enter number): ")) - 1
                if 0 <= team2_idx < len(teams_without_team1):
                    team2 = teams_without_team1[team2_idx]
                    break
                else:
                    print(f"Please enter a number between 1 and {len(teams_without_team1)}")
            except ValueError:
                print("Please enter a valid number")
    
    # Display team 2 stats
    display_team_form(team2, team_stats)
    
    # Display head-to-head stats
    display_head_to_head(team1, team2, team_stats)

    # ===== Display venues with numbers =====
    venues = sorted(label_encoders['venue'].classes_)
    print("\nAvailable Venues:")
    for i, venue in enumerate(venues, start=1):
        print(f"{i}. {venue}")
    
    # Get venue selection
    while True:
        try:
            venue_idx = int(input("Select Venue (enter number): ")) - 1
            if 0 <= venue_idx < len(venues):
                venue = venues[venue_idx]
                break
            else:
                print(f"Please enter a number between 1 and {len(venues)}")
        except ValueError:
            print("Please enter a valid number")
    
    # Display venue stats for both teams
    display_venue_stats(team1, venue, team_stats)
    display_venue_stats(team2, venue, team_stats)

    # ===== Display toss decision options =====
    toss_options = ['Bat', 'Field']
    print("\nToss Decision Options:")
    for i, option in enumerate(toss_options, start=1):
        print(f"{i}. {option}")
    
    # Get toss decision
    while True:
        try:
            toss_input = int(input("Toss Decision (enter number): ")) - 1
            if 0 <= toss_input < len(toss_options):
                toss_decision = toss_options[toss_input].lower()
                break
            else:
                print(f"Please enter a number between 1 and {len(toss_options)}")
        except ValueError:
            print("Please enter a valid number")

    # ===== Toss Winner Selection via number =====
    print("\nToss Winner:")
    print(f"1. {team1}")
    print(f"2. {team2}")
    
    # Get toss winner
    while True:
        try:
            toss_winner_num = int(input("Toss Winner (enter number): "))
            if toss_winner_num in [1, 2]:
                toss_winner = team1 if toss_winner_num == 1 else team2
                break
            else:
                print("Please enter either 1 or 2")
        except ValueError:
            print("Please enter a valid number")
    
    # Display toss stats for the winner
    display_toss_stats(toss_winner, team_stats, label_encoders)

    # ===== Make Prediction =====
    prediction_data = predict_match_outcome(team1, team2, venue, toss_winner, toss_decision)
    display_prediction(prediction_data, team1, team2, toss_winner)
    
    print("\nThank you for using the Enhanced IPL Match Prediction Tool!")


# Run the prediction tool if script is executed directly
if __name__ == "__main__":
    main()