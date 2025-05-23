def analyze_team_performance(team_name, preprocessed_df, model_path='ipl_match_prediction_model.pkl'):
    """
    Analyze comprehensive performance statistics for a specific IPL team
    
    Parameters:
    -----------
    team_name : str
        The name of the team to analyze (e.g., 'Mumbai Indians')
    preprocessed_df : pandas DataFrame
        The preprocessed IPL dataset with features
    model_path : str, optional
        Path to the saved IPL match prediction model
        
    Returns:
    --------
    dict : A dictionary containing team performance statistics
    """
    import pandas as pd
    import numpy as np
    from collections import Counter
    
    print(f"==================================================")
    print(f"PERFORMANCE ANALYSIS FOR {team_name.upper()}")
    print(f"==================================================")
    
    # Make a copy of the dataframe to avoid modifying the original
    df = preprocessed_df.copy()
    
    # Filter matches involving the specified team
    team_matches = df[(df['team1'] == team_name) | (df['team2'] == team_name)].copy()

    team_matches = team_matches[team_matches['Status'] == 'Completed']
    if preprocessed_df is not None:
        preprocessed_df = preprocessed_df[preprocessed_df['Status'] == 'Completed']
    
    # Exclude 'No Result' matches for win calculations
    team_matches_with_result = team_matches[team_matches['winner'] != 'No Result'].copy()
    
    # Basic statistics
    total_matches = len(team_matches)
    total_wins = len(team_matches_with_result[team_matches_with_result['winner'] == team_name])
    win_rate = (total_wins / len(team_matches_with_result)) * 100 if len(team_matches_with_result) > 0 else 0
    
    print(f"\nTotal matches played: {total_matches}")
    print(f"Total wins: {total_wins}")
    print(f"Win rate: {win_rate:.2f}%")

    # Performance by season
    season_performance = []
    for season in sorted(team_matches['year'].unique()):
        season_matches = team_matches[team_matches['year'] == season]
        season_matches_with_result = season_matches[season_matches['winner'] != 'No Result']
        
        matches_count = len(season_matches)
        wins_count = len(season_matches_with_result[season_matches_with_result['winner'] == team_name])
        season_win_rate = (wins_count / len(season_matches_with_result)) * 100 if len(season_matches_with_result) > 0 else 0
        
        season_performance.append({
            'season': season,
            'matches': matches_count,
            'wins': wins_count,
            'win_rate': season_win_rate
        })
    
    season_df = pd.DataFrame(season_performance)
    print("\nPerformance by season:")
    print(season_df)
    
    # Home vs Away performance
    home_matches = team_matches[team_matches['team1'] == team_name]
    home_matches_with_result = home_matches[home_matches['winner'] != 'No Result']
    
    away_matches = team_matches[team_matches['team2'] == team_name]
    away_matches_with_result = away_matches[away_matches['winner'] != 'No Result']
    
    home_wins = len(home_matches_with_result[home_matches_with_result['winner'] == team_name])
    away_wins = len(away_matches_with_result[away_matches_with_result['winner'] == team_name])
    
    home_win_rate = (home_wins / len(home_matches_with_result)) * 100 if len(home_matches_with_result) > 0 else 0
    away_win_rate = (away_wins / len(away_matches_with_result)) * 100 if len(away_matches_with_result) > 0 else 0
    
    print(f"\nHome performance: {home_wins} wins out of {len(home_matches_with_result)} matches ({home_win_rate:.2f}%)")
    print(f"Away performance: {away_wins} wins out of {len(away_matches_with_result)} matches ({away_win_rate:.2f}%)")

    # Player of the match awards
    potm_awards = team_matches[team_matches['player_of_match'].notna()]
    potm_counts = potm_awards['player_of_match'].value_counts().head(5)
    print("\nTop 5 players of the match:")
    for player, count in potm_counts.items():
        print(f"{player}: {count} awards")

    # Performance by venue
    venue_performance = []
    for venue in team_matches['venue'].unique():
        venue_matches = team_matches[team_matches['venue'] == venue]
        venue_matches_with_result = venue_matches[venue_matches['winner'] != 'No Result']
        
        if len(venue_matches_with_result) < 3:  # Skip venues with too few matches
            continue
            
        venue_wins = len(venue_matches_with_result[venue_matches_with_result['winner'] == team_name])
        venue_win_rate = (venue_wins / len(venue_matches_with_result)) * 100 if len(venue_matches_with_result) > 0 else 0
        
        venue_performance.append({
            'venue': venue,
            'matches': len(venue_matches_with_result),
            'wins': venue_wins,
            'win_rate': venue_win_rate
        })
    
    venue_df = pd.DataFrame(venue_performance)
    venue_df = venue_df.sort_values('win_rate', ascending=False)
    
    print("\nPerformance by venue (top 5):")
    print(venue_df.head(5))
    
    # Performance against other teams
    opponent_performance = []
    
    for opponent in df['team1'].unique():
        if opponent == team_name or opponent == 'No Result' or opponent == 'TBD':
            continue
            
        # Matches where team_name vs opponent
        vs_matches = df[((df['team1'] == team_name) & (df['team2'] == opponent)) | 
                            ((df['team1'] == opponent) & (df['team2'] == team_name))]
        vs_matches_with_result = vs_matches[vs_matches['winner'] != 'No Result']
        
        if len(vs_matches_with_result) < 3:  # Skip opponents with too few matches
            continue
            
        vs_wins = len(vs_matches_with_result[vs_matches_with_result['winner'] == team_name])
        vs_win_rate = (vs_wins / len(vs_matches_with_result)) * 100 if len(vs_matches_with_result) > 0 else 0
        
        opponent_performance.append({
            'opponent': opponent,
            'matches': len(vs_matches_with_result),
            'wins': vs_wins,
            'win_rate': vs_win_rate
        })
    
    opponent_df = pd.DataFrame(opponent_performance)
    best_opponent_df = opponent_df.sort_values('win_rate', ascending=False)
    worst_opponent_df = opponent_df.sort_values('win_rate', ascending=True)
    
    print("\nPerformance against other teams (best 5):")
    print(best_opponent_df.head(5))
    
    print("\nPerformance against other teams (worst 5):")
    print(worst_opponent_df.head(5))
    
    # Toss statistics
    toss_won_matches = team_matches[team_matches['toss_winner'] == team_name]
    toss_lost_matches = team_matches[team_matches['toss_winner'] != team_name]
    
    toss_won_matches_with_result = toss_won_matches[toss_won_matches['winner'] != 'No Result']
    toss_lost_matches_with_result = toss_lost_matches[toss_lost_matches['winner'] != 'No Result']
    
    toss_win_rate = (len(toss_won_matches) / len(team_matches)) * 100 if len(team_matches) > 0 else 0
    
    wins_after_winning_toss = len(toss_won_matches_with_result[toss_won_matches_with_result['winner'] == team_name])
    win_rate_after_winning_toss = (wins_after_winning_toss / len(toss_won_matches_with_result)) * 100 if len(toss_won_matches_with_result) > 0 else 0
    
    wins_after_losing_toss = len(toss_lost_matches_with_result[toss_lost_matches_with_result['winner'] == team_name])
    win_rate_after_losing_toss = (wins_after_losing_toss / len(toss_lost_matches_with_result)) * 100 if len(toss_lost_matches_with_result) > 0 else 0
    
    print(f"\nToss win rate: {toss_win_rate:.2f}%")
    print(f"Win rate after winning toss: {win_rate_after_winning_toss:.2f}%")
    print(f"Win rate after losing toss: {win_rate_after_losing_toss:.2f}%")
    
    # Batting first vs chasing
    batting_first_matches = team_matches[
        ((team_matches['team1'] == team_name) & (team_matches['toss_winner'] == team_name) & (team_matches['toss_decision'] == 'bat')) |
        ((team_matches['team1'] == team_name) & (team_matches['toss_winner'] != team_name) & (team_matches['toss_decision'] == 'field')) |
        ((team_matches['team2'] == team_name) & (team_matches['toss_winner'] == team_name) & (team_matches['toss_decision'] == 'field')) |
        ((team_matches['team2'] == team_name) & (team_matches['toss_winner'] != team_name) & (team_matches['toss_decision'] == 'bat'))
    ]

    # Chasing
    chasing_matches = team_matches[
        ((team_matches['team1'] == team_name) & (team_matches['toss_winner'] == team_name) & (team_matches['toss_decision'] == 'field')) |
        ((team_matches['team1'] == team_name) & (team_matches['toss_winner'] != team_name) & (team_matches['toss_decision'] == 'bat')) |
        ((team_matches['team2'] == team_name) & (team_matches['toss_winner'] == team_name) & (team_matches['toss_decision'] == 'bat')) |
        ((team_matches['team2'] == team_name) & (team_matches['toss_winner'] != team_name) & (team_matches['toss_decision'] == 'field'))
    ]
    
    batting_first_matches_with_result = batting_first_matches[batting_first_matches['winner'] != 'No Result']
    chasing_matches_with_result = chasing_matches[chasing_matches['winner'] != 'No Result']
    
    batting_first_wins = len(batting_first_matches_with_result[batting_first_matches_with_result['winner'] == team_name])
    chasing_wins = len(chasing_matches_with_result[chasing_matches_with_result['winner'] == team_name])
    
    batting_first_win_rate = (batting_first_wins / len(batting_first_matches_with_result)) * 100 if len(batting_first_matches_with_result) > 0 else 0
    chasing_win_rate = (chasing_wins / len(chasing_matches_with_result)) * 100 if len(chasing_matches_with_result) > 0 else 0
    
    print(f"\nBatting first: {batting_first_wins} wins out of {len(batting_first_matches_with_result)} matches ({batting_first_win_rate:.2f}%)")
    print(f"Chasing: {chasing_wins} wins out of {len(chasing_matches_with_result)} matches ({chasing_win_rate:.2f}%)")
    
    print("\nPerformance analysis for", team_name, "completed successfully.")
    print("==================================================")
    
    # Return performance statistics as a dictionary
    return {
        'team_name': team_name,
        'total_matches': total_matches,
        'total_wins': total_wins,
        'win_rate': win_rate,
        'season_performance': season_df,
        'venue_performance': venue_df,
        'opponent_performance': {
            'best': best_opponent_df,
            'worst': worst_opponent_df
        },
        'toss_statistics': {
            'toss_win_rate': toss_win_rate,
            'win_rate_after_winning_toss': win_rate_after_winning_toss,
            'win_rate_after_losing_toss': win_rate_after_losing_toss
        },
        'batting_first_win_rate': batting_first_win_rate,
        'chasing_win_rate': chasing_win_rate,
        'player_of_match': potm_counts.to_dict()
    }

def predict_ipl_2025_playoffs(preprocessed_df, model_path='ipl_match_prediction_model.pkl'):
    """
    Predicts the IPL 2025 playoff qualifiers and eliminated teams based on current points table
    and historical performance
    
    Parameters:
    -----------
    preprocessed_df : pandas DataFrame
        The preprocessed IPL dataset with features
    model_path : str, optional
        Path to the saved IPL match prediction model
        
    Returns:
    --------
    dict : A dictionary containing playoff qualifiers and eliminated teams
    """
    import pandas as pd
    import numpy as np
    
    print(f"==================================================")
    print(f"IPL 2025 PLAYOFF PREDICTION")
    print(f"==================================================")
    
    # Load the current IPL 2025 points table
    try:
        ipl_2025_points_table = pd.read_csv("IPL Points Tables/IPL_Points_Table_2025.csv")
        print("Successfully loaded IPL 2025 points table!")
        print("\nCurrent IPL 2025 standings:")
        print(ipl_2025_points_table)
    except Exception as e:
        print(f"Error loading IPL 2025 points table: {str(e)}")
        print("Falling back to historical performance-based prediction.")
        ipl_2025_points_table = None
    
    # Define the 10 teams for IPL 2025
    ipl_2025_teams = [
        'Mumbai Indians', 
        'Chennai Super Kings', 
        'Royal Challengers Bangalore', 
        'Kolkata Knight Riders', 
        'Delhi Capitals', 
        'Punjab Kings', 
        'Rajasthan Royals', 
        'Sunrisers Hyderabad',
        'Gujarat Titans',
        'Lucknow Super Giants'
    ]
    
    # Make a copy of the dataframe to avoid modifying the original
    df = preprocessed_df.copy()
    
    # Get recent performance data (last 3 years)
    current_year = 2025
    recent_years = [current_year - 3, current_year - 2, current_year - 1]  # 2022, 2023, 2024
    recent_df = df[df['year'].isin(recent_years)]
    
    # Calculate team performance metrics
    team_metrics = []
    
    for team in ipl_2025_teams:
        # Get recent matches for the team
        team_matches = recent_df[(recent_df['team1'] == team) | (recent_df['team2'] == team)]
        team_matches_with_result = team_matches[team_matches['winner'] != 'No Result']
        
        # Basic statistics
        total_matches = len(team_matches_with_result)
        total_wins = len(team_matches_with_result[team_matches_with_result['winner'] == team])
        win_rate = (total_wins / total_matches) * 100 if total_matches > 0 else 0
        
        # Recent form (last year weighted more)
        recent_form = 0
        yearly_weights = {
            recent_years[0]: 0.2,  # 2022: 20%
            recent_years[1]: 0.3,  # 2023: 30%
            recent_years[2]: 0.5,  # 2024: 50%
        }
        
        for year in recent_years:
            year_matches = team_matches_with_result[team_matches_with_result['year'] == year]
            year_wins = len(year_matches[year_matches['winner'] == team])
            year_win_rate = (year_wins / len(year_matches)) * 100 if len(year_matches) > 0 else 0
            recent_form += year_win_rate * yearly_weights[year]
            
        # Calculate batting strength (winning when batting first)
        batting_first_matches = team_matches[
            ((team_matches['team1'] == team) & (team_matches['toss_winner'] != team) & (team_matches['toss_decision'] == 'field')) |
            ((team_matches['team2'] == team) & (team_matches['toss_winner'] != team) & (team_matches['toss_decision'] == 'bat')) |
            ((team_matches['team1'] == team) & (team_matches['toss_winner'] == team) & (team_matches['toss_decision'] == 'bat')) |
            ((team_matches['team2'] == team) & (team_matches['toss_winner'] == team) & (team_matches['toss_decision'] == 'field'))
        ]
        
        batting_first_matches_with_result = batting_first_matches[batting_first_matches['winner'] != 'No Result']
        batting_first_wins = len(batting_first_matches_with_result[batting_first_matches_with_result['winner'] == team])
        batting_first_win_rate = (batting_first_wins / len(batting_first_matches_with_result)) * 100 if len(batting_first_matches_with_result) > 0 else 0
        
        # Calculate chasing strength (winning when chasing)
        chasing_matches = team_matches[
            ((team_matches['team1'] == team) & (team_matches['toss_winner'] != team) & (team_matches['toss_decision'] == 'bat')) |
            ((team_matches['team2'] == team) & (team_matches['toss_winner'] != team) & (team_matches['toss_decision'] == 'field')) |
            ((team_matches['team1'] == team) & (team_matches['toss_winner'] == team) & (team_matches['toss_decision'] == 'field')) |
            ((team_matches['team2'] == team) & (team_matches['toss_winner'] == team) & (team_matches['toss_decision'] == 'bat'))
        ]
        
        chasing_matches_with_result = chasing_matches[chasing_matches['winner'] != 'No Result']
        chasing_wins = len(chasing_matches_with_result[chasing_matches_with_result['winner'] == team])
        chasing_win_rate = (chasing_wins / len(chasing_matches_with_result)) * 100 if len(chasing_matches_with_result) > 0 else 0
        
        # Calculate playoff history in recent years (proxy: teams with high win rates)
        playoff_appearances = 0
        for year in recent_years:
            year_matches = team_matches[team_matches['year'] == year]
            year_matches_with_result = year_matches[year_matches['winner'] != 'No Result']
            year_wins = len(year_matches_with_result[year_matches_with_result['winner'] == team])
            year_total = len(year_matches_with_result)
            year_win_rate = (year_wins / year_total) * 100 if year_total > 0 else 0
            
            if year_win_rate > 55:  # Assuming teams with >55% win rate made playoffs
                playoff_appearances += 1
                
        # Create a composite strength score for 2025 prediction
        # Components: recent form (50%), balanced ability (25%), playoff history (25%)
        balanced_ability = (batting_first_win_rate + chasing_win_rate) / 2
        playoff_experience = (playoff_appearances / len(recent_years)) * 100
        
        strength_score = (0.5 * recent_form) + (0.25 * balanced_ability) + (0.25 * playoff_experience)
        
        # Adjust for known team changes in 2025
        adjustment_factors = {
            'Mumbai Indians': 1.05,  # Strong auction and retention strategy
            'Chennai Super Kings': 1.02,  # Consistent team with experienced players
            'Royal Challengers Bangalore': 1.03,  # Improved bowling attack
            'Kolkata Knight Riders': 1.06,  # Defending champions boost
            'Delhi Capitals': 0.98,  # Lost some key players
            'Punjab Kings': 0.99,  # Historically inconsistent
            'Rajasthan Royals': 1.04,  # Good overseas signings
            'Sunrisers Hyderabad': 1.01,  # Balanced squad
            'Gujarat Titans': 0.97,  # Recent form decline
            'Lucknow Super Giants': 1.0,  # No significant changes
        }
        
        strength_score *= adjustment_factors.get(team, 1.0)
        
        team_metrics.append({
            'team': team,
            'win_rate': win_rate,
            'recent_form': recent_form,
            'batting_first_win_rate': batting_first_win_rate,
            'chasing_win_rate': chasing_win_rate,
            'balanced_ability': balanced_ability,
            'playoff_appearances': playoff_appearances,
            'playoff_experience': playoff_experience,
            'strength_score': strength_score
        })
    
    # Create DataFrame and sort by strength score
    metrics_df = pd.DataFrame(team_metrics)
    
    # If points table is available, use it to influence predictions
    if ipl_2025_points_table is not None:
        print("\nGenerating predictions based on the current points table and historical performance...")
        
        # Create a mapping for team names in case they differ between datasets
        team_name_map = {
            'Royal Challengers Bangalore': 'Royal Challengers Bangalore',
            'RCB': 'Royal Challengers Bangalore',
            'Punjab Kings': 'Punjab Kings',
            'PBKS': 'Punjab Kings',
            'Mumbai Indians': 'Mumbai Indians',
            'MI': 'Mumbai Indians',
            'Gujarat Titans': 'Gujarat Titans',
            'GT': 'Gujarat Titans',
            'Delhi Capitals': 'Delhi Capitals',
            'DC': 'Delhi Capitals',
            'Lucknow Super Giants': 'Lucknow Super Giants',
            'LSG': 'Lucknow Super Giants',
            'Kolkata Knight Riders': 'Kolkata Knight Riders',
            'KKR': 'Kolkata Knight Riders',
            'Rajasthan Royals': 'Rajasthan Royals',
            'RR': 'Rajasthan Royals',
            'Sunrisers Hyderabad': 'Sunrisers Hyderabad',
            'SRH': 'Sunrisers Hyderabad',
            'Chennai Super Kings': 'Chennai Super Kings',
            'CSK': 'Chennai Super Kings'
        }
        
        # Normalize team names in points table
        if 'Team' in ipl_2025_points_table.columns:
            ipl_2025_points_table['Team'] = ipl_2025_points_table['Team'].map(lambda x: team_name_map.get(x, x))
        
        # Calculate remaining matches for each team
        if 'Played' in ipl_2025_points_table.columns:
            ipl_2025_points_table['Remaining'] = 14 - ipl_2025_points_table['Played']  # Assuming 14 matches per team
        
        # Calculate maximum possible points each team can achieve
        if 'Points' in ipl_2025_points_table.columns and 'Remaining' in ipl_2025_points_table.columns:
            ipl_2025_points_table['Max_Possible_Points'] = ipl_2025_points_table['Points'] + (ipl_2025_points_table['Remaining'] * 2)
            
            # Sort by current points, then by NRR
            current_standings = ipl_2025_points_table.sort_values(['Points', 'NRR'], ascending=[False, False])
            
            print("\nCurrent standings with maximum possible points:")
            print(current_standings[['Team', 'Played', 'Won', 'Lost', 'NRR', 'Points', 'Remaining', 'Max_Possible_Points']])
            
            # Blend historical strength with current performance
            for index, row in metrics_df.iterrows():
                team_name = row['team']
                if team_name in current_standings['Team'].values:
                    team_data = current_standings[current_standings['Team'] == team_name].iloc[0]
                    
                    # Calculate current form (wins/played)
                    current_form = team_data['Won'] / team_data['Played'] * 100 if team_data['Played'] > 0 else 0
                    
                    # Calculate relative position (normalized to 0-100)
                    position = current_standings['Team'].tolist().index(team_name) + 1
                    position_score = 100 - ((position - 1) / len(current_standings) * 100)
                    
                    # Update strength score: Blend historical (30%) with current performance (70%)
                    updated_strength = (0.3 * metrics_df.at[index, 'strength_score']) + (0.5 * current_form) + (0.2 * position_score)
                    metrics_df.at[index, 'strength_score'] = updated_strength
                    
                    # Add points data to metrics
                    metrics_df.at[index, 'current_points'] = team_data['Points']
                    metrics_df.at[index, 'max_possible_points'] = team_data['Max_Possible_Points']
                    metrics_df.at[index, 'nrr'] = team_data['NRR']
                    metrics_df.at[index, 'remaining_matches'] = team_data['Remaining']
        
        # Sort metrics by current points (primary), NRR (secondary), and strength score (tertiary)
        if 'current_points' in metrics_df.columns and 'nrr' in metrics_df.columns:
            metrics_df = metrics_df.sort_values(['current_points', 'nrr', 'strength_score'], ascending=[False, False, False])
        else:
            metrics_df = metrics_df.sort_values('strength_score', ascending=False)
    else:
        # If no points table, just sort by strength score
        metrics_df = metrics_df.sort_values('strength_score', ascending=False)
    
    # Determine playoff teams and eliminated teams
    playoff_teams = metrics_df.head(4)['team'].tolist()
    eliminated_teams = metrics_df.tail(len(metrics_df) - 4)['team'].tolist()
    
    # Print prediction results
    print("\nPredicted IPL 2025 Playoff Qualifiers:")
    for i, team in enumerate(playoff_teams, 1):
        team_row = metrics_df[metrics_df['team'] == team].iloc[0]
        if 'current_points' in metrics_df.columns:
            print(f"{i}. {team} - Current Points: {team_row['current_points']}, NRR: {team_row['nrr']:.3f}")
        else:
            print(f"{i}. {team}")
    
    print("\nPredicted Eliminated Teams:")
    for i, team in enumerate(eliminated_teams, 1):
        team_row = metrics_df[metrics_df['team'] == team].iloc[0]
        if 'current_points' in metrics_df.columns:
            print(f"{i}. {team} - Current Points: {team_row['current_points']}, NRR: {team_row['nrr']:.3f}")
        else:
            print(f"{i}. {team}")
    
    # Playoff qualification scenarios
    if 'current_points' in metrics_df.columns and 'remaining_matches' in metrics_df.columns:
        print("\nPlayoff Qualification Scenarios:")
        
        # Calculate threshold point - this is dynamic based on current standings
        if len(metrics_df) >= 5:
            fifth_team = metrics_df.iloc[4]
            threshold_points = fifth_team['max_possible_points']
            
            for i, team in enumerate(playoff_teams, 1):
                team_row = metrics_df[metrics_df['team'] == team].iloc[0]
                if team_row['current_points'] >= threshold_points:
                    print(f"{team} has already qualified for the playoffs.")
                else:
                    points_needed = threshold_points - team_row['current_points']
                    wins_needed = (points_needed + 1) // 2  # Ceiling division
                    if wins_needed > team_row['remaining_matches']:
                        print(f"{team} needs favorable results from other matches to qualify safely.")
                    else:
                        print(f"{team} needs approximately {wins_needed} wins from {team_row['remaining_matches']} remaining matches to safely qualify.")
            
            for i, team in enumerate(eliminated_teams[:4], 1):  # Only show top 4 eliminated teams
                team_row = metrics_df[metrics_df['team'] == team].iloc[0]
                if team_row['max_possible_points'] < threshold_points:
                    print(f"{team} is mathematically eliminated from playoff contention.")
                else:
                    points_needed = threshold_points - team_row['current_points']
                    wins_needed = (points_needed + 1) // 2  # Ceiling division
                    if wins_needed > team_row['remaining_matches']:
                        print(f"{team} is virtually eliminated (needs to win more matches than remaining).")
                    else:
                        print(f"{team} needs to win all {team_row['remaining_matches']} remaining matches and favorable NRR to have a chance.")

    # Return prediction results
    return {
        'playoff_teams': playoff_teams,
        'eliminated_teams': eliminated_teams,
        'team_metrics': metrics_df
    }

