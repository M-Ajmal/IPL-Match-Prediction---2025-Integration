import pandas as pd
import numpy as np
from collections import defaultdict

def comprehensive_team_analysis(matches_df, ipl_2025_df, team_name=None):
    
    # Combine original matches with 2025 data
    matches_df_copy = matches_df.copy()
    
    # Standardize team names in original dataset
    team_name_mappings = {
        'Delhi Daredevils': 'Delhi Capitals',
        'Deccan Chargers': 'Sunrisers Hyderabad',
        'Kings XI Punjab': 'Punjab Kings',
        'Gujarat Lions': 'Gujarat Titans',
        'Royal Challengers Bangalore': 'Royal Challengers Bengaluru', 
        'Rising Pune Supergiants': 'Rising Pune Supergiant',
        'Rising Pune Supergiant': 'Rising Pune Supergiant'
        # Kochi Tuskers Kerala and Pune Warriors India are kept as is, not removed
    }
    
    # Apply team name standardization
    for old_name, new_name in team_name_mappings.items():
        matches_df_copy['team1'] = matches_df_copy['team1'].str.replace(old_name, new_name)
        matches_df_copy['team2'] = matches_df_copy['team2'].str.replace(old_name, new_name)
        # Also standardize winner column
        if 'winner' in matches_df_copy.columns:
            matches_df_copy['winner'] = matches_df_copy['winner'].str.replace(old_name, new_name)
    
    # Process 2025 data to match original structure
    ipl_2025_copy = ipl_2025_df[ipl_2025_df['Status'] == 'Completed'].copy()
    
    # Map 2025 data to original structure
    matches_2025 = pd.DataFrame({
        'team1': ipl_2025_copy['Team1'],
        'team2': ipl_2025_copy['Team2'],
        'winner': ipl_2025_copy['Winner'],
        'venue': ipl_2025_copy['Venue'],
        'season': 2025,
        'toss_winner': ipl_2025_copy['TossWinner'] if 'TossWinner' in ipl_2025_copy.columns else None,
        'toss_decision': ipl_2025_copy['TossDecision'] if 'TossDecision' in ipl_2025_copy.columns else None
    })
    
    # Get season information for original matches
    if 'date' in matches_df_copy.columns:
        matches_df_copy['date'] = pd.to_datetime(matches_df_copy['date'], errors='coerce')
        matches_df_copy['season'] = matches_df_copy['date'].dt.year
    else:
        if 'season' in matches_df_copy.columns:
            matches_df_copy['season'] = matches_df_copy['season']
        else:
            matches_df_copy['season'] = ((matches_df_copy['id'] - 1) // 60 + 2008).astype(int)
    
    # Combine both datasets
    all_matches = pd.concat([matches_df_copy, matches_2025], ignore_index=True)
    
    # Get all unique teams
    all_teams = list(set(all_matches['team1'].unique()) | set(all_matches['team2'].unique()))
    all_teams = [team for team in all_teams if pd.notna(team) and team != 'No Result']
    
    # If team_name is provided, make sure it's in the list of teams
    if team_name is not None:
        # Find closest match if team_name is not exact
        if team_name not in all_teams:
            closest_matches = [t for t in all_teams if team_name.lower() in t.lower()]
            if closest_matches:
                team_name = closest_matches[0]
                print(f"Using closest match: {team_name}")
            else:
                print(f"Team '{team_name}' not found. Available teams:")
                for team in sorted(all_teams):
                    print(f"- {team}")
                return None
    
    # Initialize team stats dictionary
    team_stats = {}
    
    ipl_winners = {
        2008: 'Rajasthan Royals',
        2009: 'Deccan Chargers',  
        2010: 'Chennai Super Kings',
        2011: 'Chennai Super Kings',
        2012: 'Kolkata Knight Riders',
        2013: 'Mumbai Indians',
        2014: 'Kolkata Knight Riders',
        2015: 'Mumbai Indians',
        2016: 'Sunrisers Hyderabad',
        2017: 'Mumbai Indians',
        2018: 'Chennai Super Kings',
        2019: 'Mumbai Indians',
        2020: 'Mumbai Indians',
        2021: 'Chennai Super Kings',
        2022: 'Gujarat Titans',
        2023: 'Chennai Super Kings',
        2024: 'Kolkata Knight Riders'
    }
    
    # Apply standardized team names to IPL winners
    for season, winner in ipl_winners.items():
        for old_name, new_name in team_name_mappings.items():
            if winner == old_name:
                ipl_winners[season] = new_name
    
    # Check if any team won in 2025
    if not ipl_2025_copy.empty:
        winner_2025 = ipl_2025_copy.loc[ipl_2025_copy['Winner'].notnull(), 'Winner'].mode()
        if len(winner_2025) > 0:
            ipl_winners[2025] = winner_2025.values[0]
    
    teams_to_analyze = [team_name] if team_name else all_teams
    
    # Analyze each team
    for team in teams_to_analyze:
        # Get matches where team played
        team_matches = all_matches[(all_matches['team1'] == team) | (all_matches['team2'] == team)]
        
        # Basic metrics
        total_matches = len(team_matches)
        wins = len(team_matches[team_matches['winner'] == team])
        losses = total_matches - wins
        win_rate = (wins / total_matches * 100) if total_matches > 0 else 0
        
        # IPL Titles
        ipl_titles = sum(1 for winner in ipl_winners.values() if winner == team)
        
        # Playoff appearances estimation
        seasons_played = all_matches[all_matches['season'].isin(range(2008, 2026))]
        playoff_appearances = 0
        
        for season in range(2008, 2026):
            season_matches = seasons_played[seasons_played['season'] == season]
            season_team_matches = season_matches[(season_matches['team1'] == team) | (season_matches['team2'] == team)]
            
            if len(season_team_matches) > 0:
                season_wins = len(season_team_matches[season_team_matches['winner'] == team])
                season_total = len(season_team_matches)
                season_win_rate = (season_wins / season_total) if season_total > 0 else 0
                
                # estimation: if win rate > 50%, likely made playoffs
                if season_win_rate > 0.5:
                    playoff_appearances += 1
        
        # Performance Indicators
        toss_wins = 0
        toss_losses = 0
        
        if 'toss_winner' in all_matches.columns:
            toss_matches = team_matches[team_matches['toss_winner'] == team]
            toss_wins = len(toss_matches[toss_matches['winner'] == team])
            toss_losses = len(toss_matches) - toss_wins
        
        # Season-by-Season Performance
        season_performance = {}
        for season in range(2008, 2026):
            season_matches = team_matches[team_matches['season'] == season]
            season_total = len(season_matches)
            
            if season_total > 0:
                season_wins = len(season_matches[season_matches['winner'] == team])
                season_win_rate = (season_wins / season_total) * 100
                season_performance[season] = {
                    'wins': season_wins,
                    'total': season_total,
                    'win_rate': season_win_rate
                }
        
        # Find best and worst seasons
        if season_performance:
            best_season = max(season_performance.items(), key=lambda x: x[1]['win_rate'])
            worst_season = min(season_performance.items(), key=lambda x: x[1]['win_rate'])
            avg_win_rate = sum(s['win_rate'] for s in season_performance.values()) / len(season_performance)
        else:
            best_season = worst_season = None
            avg_win_rate = 0
        
        # Venue-wise Performance
        venue_stats = defaultdict(lambda: {'played': 0, 'won': 0})
        
        if 'venue' in team_matches.columns:
            for _, match in team_matches.iterrows():
                venue = match['venue']
                if pd.notna(venue):
                    venue_stats[venue]['played'] += 1
                    if match['winner'] == team:
                        venue_stats[venue]['won'] += 1
        
        # Calculate win percentage per venue
        venue_performance = {}
        for venue, stats in venue_stats.items():
            if stats['played'] > 0:
                win_percentage = (stats['won'] / stats['played']) * 100
                venue_performance[venue] = {
                    'played': stats['played'],
                    'won': stats['won'],
                    'win_rate': win_percentage
                }
        
        # Find best and challenging venues
        if venue_performance:
            frequent_venues = {k: v for k, v in venue_performance.items() if v['played'] >= 3}
            if frequent_venues:
                best_venue = max(frequent_venues.items(), key=lambda x: x[1]['win_rate'])
                worst_venue = min(frequent_venues.items(), key=lambda x: x[1]['win_rate'])
            else:
                best_venue = worst_venue = None
        else:
            best_venue = worst_venue = None
        
        # Head-to-Head Records
        h2h_records = {}
        for opponent in all_teams:
            if opponent != team:
                h2h_matches = team_matches[
                    ((team_matches['team1'] == team) & (team_matches['team2'] == opponent)) |
                    ((team_matches['team1'] == opponent) & (team_matches['team2'] == team))
                ]
                
                h2h_total = len(h2h_matches)
                if h2h_total > 0:
                    h2h_wins = len(h2h_matches[h2h_matches['winner'] == team])
                    h2h_losses = h2h_total - h2h_wins
                    h2h_win_rate = (h2h_wins / h2h_total) * 100
                    
                    h2h_records[opponent] = {
                        'played': h2h_total,
                        'won': h2h_wins,
                        'lost': h2h_losses,
                        'win_rate': h2h_win_rate
                    }
        
        if h2h_records:
            frequent_opponents = {k: v for k, v in h2h_records.items() if v['played'] >= 5}
            if frequent_opponents:
                best_h2h = max(frequent_opponents.items(), key=lambda x: x[1]['win_rate'])
                worst_h2h = min(frequent_opponents.items(), key=lambda x: x[1]['win_rate'])
                most_played = max(h2h_records.items(), key=lambda x: x[1]['played'])
            else:
                best_h2h = worst_h2h = most_played = None
        else:
            best_h2h = worst_h2h = most_played = None
        
        team_stats[team] = {
            'total': {
                'matches': total_matches,
                'win_rate': win_rate,
                'ipl_titles': ipl_titles,
                'playoff_appearances': playoff_appearances
            },
            'win_loss_record': {
                'wins': wins,
                'losses': losses
            },
            'performance_indicators': {
                'toss_performance': {
                    'wins': toss_wins,
                    'losses': toss_losses
                }
            },
            'season_performance': {
                'by_season': season_performance,
                'best_season': best_season,
                'worst_season': worst_season,
                'avg_win_rate': avg_win_rate
            },
            'venue_performance': {
                'venues': venue_performance,
                'best_venue': best_venue,
                'worst_venue': worst_venue
            },
            'head_to_head': {
                'records': h2h_records,
                'best_record': best_h2h,
                'worst_record': worst_h2h,
                'most_played': most_played
            }
        }
    
    if team_name:
        return team_stats[team_name]
    else:
        return team_stats

def display_team_analysis(team_stats):
    print("\n" + "="*50)
    print(f"TEAM ANALYSIS")
    print("="*50)
    
    # Overall performance
    print("\nOVERALL PERFORMANCE:")
    print(f"Total Matches: {team_stats['total']['matches']}")
    print(f"Win-Loss Record: {team_stats['win_loss_record']['wins']}-{team_stats['win_loss_record']['losses']}")
    print(f"Win Rate: {team_stats['total']['win_rate']:.2f}%")
    print(f"IPL Titles: {team_stats['total']['ipl_titles']}")
    print(f"Playoff Appearances (est.): {team_stats['total']['playoff_appearances']}")
    
    # Best and worst seasons
    print("\nSEASON PERFORMANCE:")
    if team_stats['season_performance']['best_season']:
        best_year, best_stats = team_stats['season_performance']['best_season']
        print(f"Best Season: {best_year} - {best_stats['win_rate']:.2f}% win rate ({best_stats['wins']}/{best_stats['total']} matches)")
    
    if team_stats['season_performance']['worst_season']:
        worst_year, worst_stats = team_stats['season_performance']['worst_season']
        print(f"Worst Season: {worst_year} - {worst_stats['win_rate']:.2f}% win rate ({worst_stats['wins']}/{worst_stats['total']} matches)")
    
    print(f"Average Win Rate: {team_stats['season_performance']['avg_win_rate']:.2f}%")
    
    # Venue performance
    print("\n🏟️ VENUE PERFORMANCE:")
    if team_stats['venue_performance']['best_venue']:
        best_venue, best_venue_stats = team_stats['venue_performance']['best_venue']
        print(f"Best Venue: {best_venue} - {best_venue_stats['win_rate']:.2f}% win rate ({best_venue_stats['won']}/{best_venue_stats['played']} matches)")
    
    if team_stats['venue_performance']['worst_venue']:
        worst_venue, worst_venue_stats = team_stats['venue_performance']['worst_venue']
        print(f"Challenging Venue: {worst_venue} - {worst_venue_stats['win_rate']:.2f}% win rate ({worst_venue_stats['won']}/{worst_venue_stats['played']} matches)")
    
    # Head-to-head records
    print("\n🏏 HEAD-TO-HEAD RECORDS:")
    if team_stats['head_to_head']['best_record']:
        best_opponent, best_h2h_stats = team_stats['head_to_head']['best_record']
        print(f"Best Record: vs {best_opponent} - {best_h2h_stats['win_rate']:.2f}% win rate ({best_h2h_stats['won']}/{best_h2h_stats['played']} matches)")
    
    if team_stats['head_to_head']['worst_record']:
        worst_opponent, worst_h2h_stats = team_stats['head_to_head']['worst_record']
        print(f"Challenging Opponent: vs {worst_opponent} - {worst_h2h_stats['win_rate']:.2f}% win rate ({worst_h2h_stats['won']}/{worst_h2h_stats['played']} matches)")
    
    if team_stats['head_to_head']['most_played']:
        most_played_opp, most_played_stats = team_stats['head_to_head']['most_played']
        print(f"Most Played: vs {most_played_opp} - {most_played_stats['played']} matches ({most_played_stats['won']} wins, {most_played_stats['lost']} losses)")
    
    print("\n" + "="*50)

def get_team_analysis(matches_df, ipl_2025_df, team_name):
    team_stats = comprehensive_team_analysis(matches_df, ipl_2025_df, team_name)
    
    if team_stats:
        display_team_analysis(team_stats)
        return team_stats
    else:
        return None

def list_available_teams(matches_df, ipl_2025_df, return_list=False):
    matches_df_copy = matches_df.copy()
    
    team_name_mappings = {
        'Delhi Daredevils': 'Delhi Capitals',
        'Deccan Chargers': 'Sunrisers Hyderabad',
        'Kings XI Punjab': 'Punjab Kings',
        'Gujarat Lions': 'Gujarat Titans',
        'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
        'Rising Pune Supergiants': 'Rising Pune Supergiant',
        'Rising Pune Supergiant': 'Rising Pune Supergiant'
    }
    
    # Apply team name standardization
    for old_name, new_name in team_name_mappings.items():
        matches_df_copy['team1'] = matches_df_copy['team1'].str.replace(old_name, new_name)
        matches_df_copy['team2'] = matches_df_copy['team2'].str.replace(old_name, new_name)
    
    # Process 2025 data
    ipl_2025_copy = ipl_2025_df[ipl_2025_df['Status'] == 'Completed'].copy()
    
    # Combine teams from both datasets
    all_teams1 = set(matches_df_copy['team1'].unique())
    all_teams2 = set(matches_df_copy['team2'].unique()) 
    all_teams_2025_1 = set(ipl_2025_copy['Team1'].unique()) if 'Team1' in ipl_2025_copy.columns else set()
    all_teams_2025_2 = set(ipl_2025_copy['Team2'].unique()) if 'Team2' in ipl_2025_copy.columns else set()
    
    all_teams = all_teams1.union(all_teams2).union(all_teams_2025_1).union(all_teams_2025_2)
    all_teams = [team for team in all_teams if pd.notna(team) and team != 'No Result']
    sorted_teams = sorted(all_teams)
    
    if not return_list:
        print("\nAvailable teams for analysis:")
        for i, team in enumerate(sorted_teams, 1):
            print(f"{i}. {team}")
    
    return sorted_teams