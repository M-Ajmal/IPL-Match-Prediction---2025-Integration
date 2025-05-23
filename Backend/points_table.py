import csv
import os
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Mapping team abbreviations to full names
team_name_map = {
    'DD': 'Delhi Daredevils',
    'DC': 'Delhi Capitals',
    'PBKS': 'Punjab Kings',
    'KXIP': 'Punjab Kings',
    'CSK': 'Chennai Super Kings',
    'MI': 'Mumbai Indians',
    'KKR': 'Kolkata Knight Riders',
    'RCB': 'Royal Challengers Bangalore',
    'RR': 'Rajasthan Royals',
    'SRH': 'Sunrisers Hyderabad',
    'DEC': 'Deccan Chargers',
    'GL': 'Gujarat Lions',
    'RPS': 'Rising Pune Supergiant',
    'PWI': 'Pune Warriors India',
    'KTK': 'Kochi Tuskers Kerala',
    'GT': 'Gujarat Titans',
    'LSG': 'Lucknow Super Giants'
}

def get_webdriver():
    """Initialize and return a Chrome WebDriver with appropriate options."""
    # Setup Chrome options for headless mode
    options = Options()
    options.add_argument("--headless")  # Classic headless mode
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    )
    
    # Initialize WebDriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

def fetch_points_table(year):
    """
    Fetch IPL points table for a specific year from the official website.
    
    Args:
        year (int): The IPL season year to fetch data for
        
    Returns:
        list: A list of dictionaries with the points table data
    """
    # Output folder
    folder_name = "IPL Points Tables"
    os.makedirs(folder_name, exist_ok=True)
    
    driver = get_webdriver()
    
    try:
        url = f"https://www.iplt20.com/points-table/men/{year}"
        driver.get(url)

        # Wait for any table to appear first (ensures JS loaded)
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )

        # Scroll to bottom to help JS render content
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(5)

        try:
            table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "ih-pt-tab-bg"))
            )
        except TimeoutException:
            raise Exception(f"Points table not found for {year}")

        rows = table.find_elements(By.TAG_NAME, "tr")
        if not rows:
            raise Exception(f"No data rows found for {year}")

        original_headers = [th.text.strip().upper() for th in rows[0].find_elements(By.TAG_NAME, "th")]
        if not original_headers:
            raise Exception(f"No headers found for {year}")

        if original_headers[-1].strip().upper() == "RECENT FORM":
            original_headers = original_headers[:-1]

        header_map = {
            "TEAM": "Team",
            "P": "Played",
            "W": "Won",
            "L": "Lost",
            "NRR": "NRR",
            "PTS": "Points"
        }

        headers = [header_map[h] for h in original_headers if h in header_map]
        data = []

        for row in rows[1:]:
            cols = row.find_elements(By.TAG_NAME, "td")
            if not cols:
                continue

            raw_row = [col.text.strip() for col in cols]
            if len(raw_row) > len(original_headers):
                raw_row = raw_row[:-1]

            row_dict = dict(zip(original_headers, raw_row))

            filtered_row = []
            for key in header_map.keys():
                value = row_dict.get(key, "")
                if key == "TEAM":
                    value = team_name_map.get(value.upper(), value)
                filtered_row.append(value)

            if any(filtered_row):
                data.append(dict(zip(headers, filtered_row)))

        if data:
            file_path = os.path.join(folder_name, f"IPL_Points_Table_{year}.csv")
            with open(file_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()
                writer.writerows(data)
                
            print(f"✅ {year} Done: {file_path}")
            return data
        else:
            raise Exception(f"No data found for {year}")

    except Exception as e:
        raise Exception(f"Error fetching data for {year}: {str(e)}")
    finally:
        driver.quit()

def get_saved_points_table(year):
    """
    Get saved IPL points table data for a specific year.
    
    Args:
        year (int): The IPL season year to get data for
        
    Returns:
        list: A list of dictionaries with the points table data, or None if not found
    """
    folder_name = "IPL Points Tables"
    file_path = os.path.join(folder_name, f"IPL_Points_Table_{year}.csv")
    
    if not os.path.exists(file_path):
        return None
    
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        # Convert the DataFrame to a list of dictionaries
        data = df.to_dict(orient='records')
        return data
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return None

def update_all_points_tables(years=None):
    """
    Update IPL points tables for specified years or current year.
    
    Args:
        years (list): Optional list of years to update. If None, only updates current year.
    """
    if years is None:
        import datetime
        current_year = datetime.datetime.now().year
        years = [current_year]
    
    for year in years:
        try:
            print(f"Updating points table for {year}...")
            fetch_points_table(year)
        except Exception as e:
            print(f"Failed to update points table for {year}: {str(e)}")

if __name__ == "__main__":
    # When run directly, update the current year's data
    update_all_points_tables()