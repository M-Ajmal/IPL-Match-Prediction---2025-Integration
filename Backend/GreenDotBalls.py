# GreenDotBalls.py

import os 
import time
import csv
import logging
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium_stealth import stealth

def fetch_green_dot_balls_data():
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Configure browser
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    # Apply stealth
    stealth(driver,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True)

    try:
        # Navigate to IPL stats page
        url = "https://www.iplt20.com/stats/2025"
        driver.get(url)
        wait = WebDriverWait(driver, 15)

        # Wait for category tabs
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "cSBListItems")))
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(2)

        # Click "TATA IPL Green Dot Balls" tab
        dot_balls_tab = wait.until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'TATA IPL Green Dot Balls') and contains(@class, 'cSBListItems')]"))
        )
        driver.execute_script("arguments[0].click();", dot_balls_tab)
        logger.info("✅ Clicked on 'TATA IPL Green Dot Balls' tab.")

        # Wait for table to load
        wait.until(EC.presence_of_element_located((By.XPATH, "//table")))
        time.sleep(2)

        # Extract headers
        headers = []
        header_section = driver.find_element(By.CLASS_NAME, "st-table__head")
        th_elements = header_section.find_elements(By.TAG_NAME, "th")
        for th in th_elements:
            header_text = th.text.strip() or th.get_attribute("innerText").strip()
            headers.append(header_text)

        # Extract table data
        table = driver.find_element(By.XPATH, "//table")
        rows_wrap = table.find_element(By.TAG_NAME, "tbody")
        rows = rows_wrap.find_elements(By.TAG_NAME, "tr")

        data = []
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            if cols:
                row_data = [col.text.strip() for col in cols]
                data.append(row_data)

        # Save to CSV (overwrite always)
        folder_name = os.path.join("Ipl_Stat_2025", "bowling")
        os.makedirs(folder_name, exist_ok=True)
        file_path = os.path.join(folder_name, "tata_ipl_green_dot_balls.csv")

        with open(file_path, "w", newline='', encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(data)

        logger.info(f"✅ Green Dot Balls CSV successfully updated at {file_path}")

    except Exception as e:
        logger.error(f"❌ Error extracting Green Dot Balls data: {e}")
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    fetch_green_dot_balls_data()
