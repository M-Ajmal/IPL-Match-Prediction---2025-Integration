# BestBowlingFigures.py

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

def fetch_best_bowling_figures_data():
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Configure Chrome
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    # Apply stealth mode
    stealth(driver,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
    )

    try:
        # Go to the IPL 2025 stats page
        url = "https://www.iplt20.com/stats/2025"
        driver.get(url)
        wait = WebDriverWait(driver, 15)

        # Wait for the tabs to load
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "cSBListItems")))

        # Scroll to load the tab buttons
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(2)

        # Click on 'Best Bowling Figures'
        target_tab = wait.until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Best Bowling Figures') and contains(@class, 'cSBListItems')]"))
        )
        driver.execute_script("arguments[0].click();", target_tab)
        logger.info("✅ Clicked on 'Best Bowling Figures' tab.")

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

        # Extract table rows
        data = []
        rows = driver.find_elements(By.XPATH, "//table/tbody/tr")
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            row_data = [col.text.strip() for col in cols]
            if any(row_data):
                data.append(row_data)

        # Save to CSV (overwrite every time)
        folder = os.path.join("Ipl_Stat_2025", "bowling")
        os.makedirs(folder, exist_ok=True)
        file_path = os.path.join(folder, "best_bowling_figures.csv")

        with open(file_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(data)

        logger.info(f"✅ Best Bowling Figures CSV successfully updated at {file_path}")

    except Exception as e:
        logger.error(f"❌ Error extracting Best Bowling Figures data: {e}")
        raise

    finally:
        driver.quit()

if __name__ == "__main__":
    fetch_best_bowling_figures_data()
