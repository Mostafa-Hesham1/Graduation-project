from fastapi import APIRouter, HTTPException
from bs4 import BeautifulSoup
from pydantic import BaseModel
import requests
import csv
from time import sleep
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from requests.exceptions import TooManyRedirects, RequestException
import logging
import os
from fastapi.responses import FileResponse
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Request model for scraping parameters
class ScrapeRequest(BaseModel):
    main_url: str
    pages: int
    fuel_type: str
    transmission_type: str

def create_session():
    session = requests.Session()
    # If you have proxy issues, disable trusting env variables:
    session.trust_env = False
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))
    session.mount('http://', HTTPAdapter(max_retries=retries))
    return session

def extract_car_info(card, fuel_type, transmission_type):
    car_info = {
        'Name': card.find("div", class_="newCarListUnit_header").text.strip() if card.find("div", class_="newCarListUnit_header") else None,
        'Price': card.find("div", class_="main_price").text.strip() if card.find("div", class_="main_price") else None,
        'Color': None,
        'Mileage': None,
        'Make': None,
        'Model': None,
        'Year': None,
        'City': None,
        'Date Displayed': None,
        'Item URL': None,
        'Fuel Type': fuel_type,
        'Transmission Type': transmission_type,
    }

    meta_tags = card.find_all("span", class_="newCarListUnit_metaTag")
    if meta_tags:
        car_info['Color'] = meta_tags[0].text.strip()
        car_info['Mileage'] = meta_tags[-1].text.strip() if meta_tags[-1].text.strip() != "- Km" else None

    meta_container = card.find("div", class_="newCarListUnit_metaTags")
    if meta_container:
        meta_links = meta_container.find_all("span", class_="newCarListUnit_metaLink")
        if meta_links:
            if len(meta_links) > 0:
                car_info['Make'] = meta_links[0].text.strip()
            if len(meta_links) > 1:
                car_info['Model'] = meta_links[1].text.strip()
            if len(meta_links) > 2:
                car_info['City'] = meta_links[-1].text.strip()

    if car_info['Name']:
        for part in car_info['Name'].split():
            if part.isdigit() and len(part) == 4:
                car_info['Year'] = part
                break

    date_container = card.find("div", class_="otherData_Date")
    if date_container:
        date_span = date_container.find("span")
        if date_span:
            car_info['Date Displayed'] = date_span.text.strip()

    main_img = card.find("div", class_="newMainImg")
    if main_img:
        item_link = main_img.find('a')
        if item_link:
            car_info['Item URL'] = f"https://eg.hatla2ee.com{item_link.get('href')}"

    return car_info

@router.post("")
async def scrape_data(request: ScrapeRequest):
    try:
        data = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        session = create_session()
        date_str = datetime.now().strftime("%Y-%m-%d")
        csv_file_path = os.path.join(os.getcwd(), f'hatla2ee_scraped_data_{date_str}.csv')
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as temp_csvfile:
            fieldnames = ['Name', 'Price', 'Color', 'Mileage', 'Make', 'Model', 'Year', 'City', 'Date Displayed', 'Item URL', 'Fuel Type', 'Transmission Type']
            writer = csv.DictWriter(temp_csvfile, fieldnames=fieldnames)
            writer.writeheader()

            total_items = 0
            scraped_urls = set()

            for i in range(1, request.pages + 1):
                url = f"{request.main_url}/page/{i}"
                if url in scraped_urls:
                    continue
                scraped_urls.add(url)
                try:
                    response = session.get(url, headers=headers)
                except TooManyRedirects as e:
                    logger.error(f"Too many redirects for {url}: {str(e)}")
                    break
                except RequestException as e:
                    logger.error(f"Failed to fetch {url}: {str(e)}")
                    continue

                if response.status_code != 200:
                    logger.error(f"Failed to fetch {url}: Status code {response.status_code}")
                    continue

                soup = BeautifulSoup(response.content, "html.parser")
                car_cards = soup.find_all("div", class_="newCarListUnit_contain")
                if not car_cards:
                    break

                for card in car_cards:
                    car_info = extract_car_info(card, request.fuel_type, request.transmission_type)
                    writer.writerow(car_info)
                    data.append(car_info)
                    total_items += 1

                logger.info(f"Page {i} scraped successfully with {len(car_cards)} items.")
                logger.info(f"Total items scraped so far: {total_items}")
                sleep(5)

        logger.info(f"Total number of scraped items: {total_items}")
        return {"message": "Data scraped successfully", "data": data, "csv_file_path": csv_file_path}
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download_csv")
def download_csv():
    date_str = datetime.now().strftime("%Y-%m-%d")
    csv_file_path = os.path.join(os.getcwd(), f'hatla2ee_scraped_data_{date_str}.csv')
    if os.path.exists(csv_file_path):
        return FileResponse(csv_file_path, media_type='text/csv', filename=f'hatla2ee_scraped_data_{date_str}.csv')
    else:
        raise HTTPException(status_code=404, detail="CSV file not found")
