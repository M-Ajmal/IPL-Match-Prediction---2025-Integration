import os
import csv
import pandas as pd

TEAM_MAPPING = {
    'Chennai_Super_Kings': {'id': 'csk', 'name': 'Chennai Super Kings', 'color': '#FFFF3C'},
    'Delhi_Capitals': {'id': 'dc', 'name': 'Delhi Capitals', 'color': '#0078BC'},
    'Gujarat_Titans': {'id': 'gt', 'name': 'Gujarat Titans', 'color': '#1C1C1C'},
    'Kolkata_Knight_Riders': {'id': 'kkr', 'name': 'Kolkata Knight Riders', 'color': '#3A225D'},
    'Lucknow_Super_Giants': {'id': 'lsg', 'name': 'Lucknow Super Giants', 'color': '#A72056'},
    'Mumbai_Indians': {'id': 'mi', 'name': 'Mumbai Indians', 'color': '#004BA0'},
    'Punjab_Kings': {'id': 'pbks', 'name': 'Punjab Kings', 'color': '#ED1C24'},
    'Rajasthan_Royals': {'id': 'rr', 'name': 'Rajasthan Royals', 'color': '#FF69B4'},
    'Royal_Challengers_Bengaluru': {'id': 'rcb', 'name': 'Royal Challengers Bengaluru', 'color': '#0080FF'},
    'Sunrisers_Hyderabad': {'id': 'srh', 'name': 'Sunrisers Hyderabad', 'color': '#F7A721'}
}

ID_TO_FILENAME = {v['id']: f"{k}.csv" for k, v in TEAM_MAPPING.items()}
DATA_FOLDER = "Team_Player"


ROLE_MAPPING = {
    'All-Rounder': 'All-Rounder',
    'Allrounder': 'All-Rounder', 
    'Allrounder  ': 'All-Rounder',
    'Batsman': 'Batsman',
    'Batsman  ': 'Batsman',
    'Bowler': 'Bowler',
    'Bowler  ': 'Bowler',
    'Wicketkeeper': 'Wicketkeeper',
    'Wicketkeeper  ': 'Wicketkeeper'
}

STANDARD_ROLES = ['All', 'All-Rounder', 'Batsman', 'Bowler', 'Wicketkeeper']

def get_all_teams():
    return [{'id': v['id'], 'name': v['name'], 'color': v['color']} for v in TEAM_MAPPING.values()]

def get_team_info(team_id):
    if team_id not in ID_TO_FILENAME:
        return {'error': f'Team with ID {team_id} not found'}
    
    csv_path = os.path.join(DATA_FOLDER, ID_TO_FILENAME[team_id])
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  
            player_count = sum(1 for _ in reader)
    except Exception as e:
        player_count = 0
    
    details = TEAM_MAPPING[[k for k, v in TEAM_MAPPING.items() if v['id'] == team_id][0]]
    return {
        'id': details['id'], 
        'name': details['name'], 
        'color': details['color'], 
        'playerCount': player_count
    }

def get_team_players(team_id, role_filter='All'):
    if team_id not in ID_TO_FILENAME:
        return {'error': f'Team with ID {team_id} not found'}
    
    csv_path = os.path.join(DATA_FOLDER, ID_TO_FILENAME[team_id])
    try:
        df = pd.read_csv(csv_path)
        expected_columns = ['Player Name', 'Image URL', 'Detail Page URL', 'role']
        for col in expected_columns:
            if col not in df.columns:
                return {'error': f'Column {col} not found in {csv_path}'}
        
        if 'role' in df.columns:
            df['normalized_role'] = df['role'].apply(lambda x: ROLE_MAPPING.get(x, x))
        
        if role_filter != 'All':
            df = df[df['normalized_role'] == role_filter]
        
        return df[expected_columns].to_dict(orient='records')
    except Exception as e:
        return {'error': f'Error processing team data: {str(e)}'}

def get_player_details(player_id):
    return {'error': 'Player lookup by ID not implemented'}

def get_all_roles():
    return STANDARD_ROLES

def normalize_csv_roles():
    for team_id, filename in ID_TO_FILENAME.items():
        csv_path = os.path.join(DATA_FOLDER, filename)
        try:
            df = pd.read_csv(csv_path)
            if 'role' in df.columns:
                df['role'] = df['role'].apply(lambda x: ROLE_MAPPING.get(x, x))
                df.to_csv(csv_path, index=False)
                print(f"Updated roles in {filename}")
        except Exception as e:
            print(f"Error updating {filename}: {str(e)}")