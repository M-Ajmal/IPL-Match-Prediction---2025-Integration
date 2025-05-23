import os
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

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_orange_cap_data():
    # Configure headless Chrome
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    # Apply stealth to avoid detection
    stealth(driver,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
    )

    try:
        url = "https://www.iplt20.com/stats/2025"
        driver.get(url)

        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "np-mostrunsTable")))

        # Locate and parse the table
        table = driver.find_element(By.CLASS_NAME, "np-mostrunsTable")
        header = table.find_element(By.CLASS_NAME, "st-table__head")
        rows_wrap = table.find_element(By.CLASS_NAME, "st-table-wrap")

        headers = [th.text.strip() for th in header.find_elements(By.TAG_NAME, "th")]
        rows = rows_wrap.find_elements(By.TAG_NAME, "tr")

        data = []
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            if cols:
                row_data = [col.text.strip() for col in cols]
                data.append(row_data)

        # Prepare output file path
        folder_name = os.path.join("Ipl_Stat_2025", "batting")
        os.makedirs(folder_name, exist_ok=True)
        file_path = os.path.join(folder_name, "orange_cap.csv")

        # Overwrite the CSV file with latest data
        with open(file_path, "w", newline='', encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(data)

        logger.info(f"✅ Orange Cap CSV successfully updated with latest data at {file_path}")

    except Exception as e:
        logger.error(f"❌ Error extracting Orange Cap data: {e}")

    finally:
        driver.quit()

if __name__ == '__main__':
    fetch_orange_cap_data()
