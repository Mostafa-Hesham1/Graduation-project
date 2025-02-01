from fastapi import APIRouter, HTTPException
from bs4 import BeautifulSoup  # Ensure this import is correct
from pydantic import BaseModel
import requests
import csv
from time import sleep
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
import os
from fastapi.responses import FileResponse
from datetime import datetime

router = APIRouter()

class ScrapeRequest(BaseModel):
    main_url: str
    pages: int
    fuel_type: str
    transmission_type: str

def create_session():
    session = requests.Session()
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
        'Fuel Type': fuel_type,  # Set Fuel Type from request
        'Transmission Type': transmission_type,  # Set Transmission Type from request
    }

    meta_tags = card.find_all("span", class_="newCarListUnit_metaTag")
    if meta_tags:
        car_info['Color'] = meta_tags[0].text.strip()
        car_info['Mileage'] = meta_tags[-1].text.strip() if meta_tags[-1].text.strip() != "- Km" else None

    meta_links = card.find("div", class_="newCarListUnit_metaTags").find_all("span", class_="newCarListUnit_metaLink")
    if meta_links:
        car_info['Make'] = meta_links[0].text.strip()
        car_info['Model'] = meta_links[1].text.strip()
        car_info['City'] = meta_links[-1].text.strip()

    # Extract year from the name
    if car_info['Name']:
        name_parts = car_info['Name'].split()
        for part in name_parts:
            if part.isdigit() and len(part) == 4:  # Assuming the year is a 4-digit number
                car_info['Year'] = part
                break

    date_displayed = card.find("div", class_="otherData_Date").find("span")
    if date_displayed:
        car_info['Date Displayed'] = date_displayed.text.strip()

    item_url = card.find("div", class_="newMainImg").find('a')
    if item_url:
        car_info['Item URL'] = f"https://eg.hatla2ee.com{item_url.get('href')}"

    return car_info

@router.post("/")
def scrape_data(request: ScrapeRequest):
    try:
        data = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        session = create_session()

        date_str = datetime.now().strftime("%Y-%m-%d")
        csv_file_path = os.path.join(os.getcwd(), f'hatla2ee_scraped_data_{date_str}.csv')
        file_exists = os.path.isfile(csv_file_path)

        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as temp_csvfile:  # Use 'w' mode to overwrite file
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

                response = session.get(url, headers=headers)
                if response.status_code != 200:
                    logging.error(f"Failed to fetch {url}: Status code {response.status_code}")
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

                logging.info(f"***** Page {i} Scrapped Successfully with {len(car_cards)} Items *****")
                logging.info(f"***** Total items scraped so far: {total_items} *****")
                sleep(5)

        logging.info(f"***** Total Number of Scrapped Items: {total_items} *****")

        if data:
            return {"message": "Data scraped successfully", "data": data, "csv_file_path": csv_file_path}
        else:
            return {"message": "No data collected", "data": data, "csv_file_path": csv_file_path}

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download_csv")
def download_csv():
    date_str = datetime.now().strftime("%Y-%m-%d")
    csv_file_path = os.path.join(os.getcwd(), f'hatla2ee_scraped_data_{date_str}.csv')
    if os.path.exists(csv_file_path):
        return FileResponse(csv_file_path, media_type='text/csv', filename=f'hatla2ee_scraped_data_{date_str}.csv')
    else:
        raise HTTPException(status_code=404, detail="CSV file not found")

# Ensure the router is included in the main application
# filepath: /c:/Users/Mostafa/Desktop/VehicleSouq/backend/main.py
from fastapi import FastAPI
from routes import scrape

app = FastAPI()

app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
