import pandas as pd
from joblib import load
import numpy as np

def predict_match(model_path, batting_team, bowling_team, venue, target, current_score, balls_played, wickets_fallen):
    """
    Predict match outcome for specific match parameters.
    
    Args:
        model_path: Path to the saved model file (e.g., 'ipl_predictor_model.joblib')
        batting_team: Name of the batting team
        bowling_team: Name of the bowling team  
        venue: Full venue name (e.g., 'Eden Gardens, Kolkata')
        target: Target score for the batting team
        current_score: Current score of the batting team
        balls_played: Number of balls played so far
        wickets_fallen: Number of wickets fallen
        
    Returns:
        Dictionary with prediction results
    """
    
    # Load the model if model_path is a string
    if isinstance(model_path, str):
        try:
            model = load(model_path)
        except Exception as e:
            return {'error': f"Error loading model: {e}"}
    else:
        model = model_path  # model is already a loaded object
    
    # Basic validation to avoid NaN values
    if not all(isinstance(x, (int, float)) for x in [target, current_score, balls_played, wickets_fallen]):
        return {'error': "All numerical inputs must be numbers"}
    
    # Calculate derived values with safety checks
    runs_left = target - current_score
    balls_left = 120 - balls_played
    wickets = 10 - wickets_fallen
    
    # Avoid division by zero
    if balls_played > 0:
        crr = (current_score * 6) / balls_played
    else:
        crr = 0.0
    
    if balls_left > 0:
        rrr = (runs_left * 6) / balls_left
    else:
        # If no balls left, set a very high required rate
        rrr = 99.99
    
    # Extract city from venue (assuming city is the last part after comma)
    city = venue.split(',')[-1].strip() if ',' in venue else venue
    
    # Create input DataFrame
    input_df = pd.DataFrame({
        'batting_team': [batting_team],
        'bowling_team': [bowling_team],
        'city': [city],
        'runs_left': [runs_left],
        'balls_left': [balls_left],
        'wickets': [wickets],
        'total_runs_x': [target],
        'crr': [crr],
        'rrr': [rrr]
    })
    
    # Make prediction
    try:
        # Check if any values are NaN and replace them
        if input_df.isna().any().any():
            input_df = input_df.fillna(0)  # Fill NaN values with 0
        
        win_prob = model.predict_proba(input_df)[0, 1] * 100
        
        # Check if win_prob is NaN and handle it
        if np.isnan(win_prob):
            return {'error': "Model produced NaN prediction. Please check your input parameters."}
            
        lose_prob = 100 - win_prob
        
        # Prepare results
        results = {
            'batting_team': batting_team,
            'bowling_team': bowling_team,
            'venue': venue,
            'target': target,
            'current_situation': f"{current_score}/{wickets_fallen} in {balls_played/6:.1f} overs",
            'runs_needed': runs_left,
            'balls_remaining': balls_left,
            'wickets_in_hand': wickets,
            'current_run_rate': round(crr, 2),
            'required_run_rate': round(rrr, 2),
            'win_probability': round(win_prob, 2),
            'lose_probability': round(lose_prob, 2),
            'analysis': get_match_analysis(win_prob, batting_team, bowling_team)
        }
        
        return results
        
    except Exception as e:
        return {'error': f"Error making prediction: {str(e)}"}

def get_match_analysis(win_prob, batting_team, bowling_team):
    """
    Generate analysis based on win probability.
    
    Args:
        win_prob: Win probability percentage
        batting_team: Name of the batting team
        bowling_team: Name of the bowling team
        
    Returns:
        String with match analysis
    """
    if win_prob > 80:
        return f"{batting_team} is in a very strong position to win."
    elif win_prob > 60:
        return f"{batting_team} has the advantage, but the match is still competitive."
    elif win_prob > 40:
        return "The match is evenly balanced, could go either way."
    elif win_prob > 20:
        return f"{bowling_team} has the advantage, but {batting_team} still has a chance."
    else:
        return f"{bowling_team} is in a very strong position to win."

# Quick API-like call with model loading
def quick_prediction(model_path, batting_team, bowling_team, venue, target, current_score, balls_played, wickets_fallen):
    """Make a quick prediction and return just the win probability and analysis."""
    
    results = predict_match(model_path, batting_team, bowling_team, venue, target, 
                                   current_score, balls_played, wickets_fallen)
    
    if 'error' in results:
        return results
    
    return {
        'win_probability': results['win_probability'],
        'analysis': results['analysis']
    }

# Example function to debug prediction issues
def debug_prediction(model_path, batting_team, bowling_team, venue, target, current_score, balls_played, wickets_fallen):
    """
    Debug prediction issues by printing intermediate values.
    """
    print(f"Input parameters:")
    print(f"- batting_team: {batting_team}")
    print(f"- bowling_team: {bowling_team}")
    print(f"- venue: {venue}")
    print(f"- target: {target}")
    print(f"- current_score: {current_score}")
    print(f"- balls_played: {balls_played}")
    print(f"- wickets_fallen: {wickets_fallen}")
    
    # Calculate derived values
    runs_left = target - current_score
    balls_left = 120 - balls_played
    wickets = 10 - wickets_fallen
    crr = (current_score * 6) / balls_played if balls_played > 0 else 0
    rrr = (runs_left * 6) / balls_left if balls_left > 0 else float('inf')
    
    print(f"\nDerived values:")
    print(f"- runs_left: {runs_left}")
    print(f"- balls_left: {balls_left}")
    print(f"- wickets: {wickets}")
    print(f"- crr: {crr}")
    print(f"- rrr: {rrr}")
    
    # Try to make prediction
    try:
        if isinstance(model_path, str):
            model = load(model_path)
        else:
            model = model_path
            
        city = venue.split(',')[-1].strip() if ',' in venue else venue
        
        input_df = pd.DataFrame({
            'batting_team': [batting_team],
            'bowling_team': [bowling_team],
            'city': [city],
            'runs_left': [runs_left],
            'balls_left': [balls_left],
            'wickets': [wickets],
            'total_runs_x': [target],
            'crr': [crr],
            'rrr': [rrr]
        })
        
        print("\nInput DataFrame:")
        print(input_df)
        print("\nChecking for NaN values:")
        print(input_df.isna().sum())
        
        # Get model's expected features
        if hasattr(model, 'feature_names_in_'):
            print("\nModel's expected features:")
            print(model.feature_names_in_)
            
            # Check if our input features match the model's expected features
            missing_features = set(model.feature_names_in_) - set(input_df.columns)
            extra_features = set(input_df.columns) - set(model.feature_names_in_)
            
            if missing_features:
                print(f"\nMissing features: {missing_features}")
            if extra_features:
                print(f"\nExtra features: {extra_features}")
        
        win_prob = model.predict_proba(input_df)[0, 1] * 100
        print(f"\nPredicted win probability: {win_prob}%")
        
        return {"win_probability": round(win_prob, 2)}
        
    except Exception as e:
        print(f"\nError during prediction: {str(e)}")
        return {"error": str(e)}