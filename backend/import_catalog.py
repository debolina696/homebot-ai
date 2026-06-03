"""
HomeBot AI — Product Catalog Importer
Usage: python backend/import_catalog.py products_catalog.xlsx
"""

import sys
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def import_catalog(excel_file):
    print(f"Reading {excel_file}...")

    # Read Excel
    try:
        df = pd.read_excel(excel_file)
        print(f"Found {len(df)} rows in Excel")
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    # Connect to database
    try:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            conn = psycopg2.connect(
                host     = os.getenv("DB_HOST",     "localhost"),
                database = os.getenv("DB_NAME",     "homebot_db"),
                user     = os.getenv("DB_USER",     "postgres"),
                password = os.getenv("DB_PASSWORD", "runka@1993"),
                port     = 5432
            )
        print("Connected to database!")
    except Exception as e:
        print(f"Database connection error: {e}")
        return

    cur           = conn.cursor()
    success_count = 0
    error_count   = 0

    for index, row in df.iterrows():
        try:
            # Skip empty rows
            if pd.isna(row.get('name')) or pd.isna(row.get('price')):
                continue

            cur.execute("""
                INSERT INTO products
                (name, description, price, unit, stock_qty,
                 style_tag, brand, room_id, length_cm, width_cm,
                 height_cm, material, color, image_url)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                str(row['name']),
                str(row.get('description', '')),
                float(row['price']),
                str(row.get('unit', 'per piece')),
                int(row.get('stock_qty', 0)),
                str(row.get('style_tag', 'modern')),
                str(row.get('brand', 'Unknown')),
                int(row['room_id']),
                float(row['length_cm']) if pd.notna(row.get('length_cm')) else None,
                float(row['width_cm'])  if pd.notna(row.get('width_cm'))  else None,
                float(row['height_cm']) if pd.notna(row.get('height_cm')) else None,
                str(row.get('material', '')),
                str(row.get('color', '')),
                str(row.get('image_url', ''))
            ))
            success_count += 1
            print(f"✅ {row['name']}")

        except Exception as e:
            error_count += 1
            print(f"❌ Row {index+2}: {e}")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nImport Complete!")
    print(f"✅ Imported : {success_count} products")
    print(f"❌ Failed   : {error_count} products")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python backend/import_catalog.py your_file.xlsx")
        print("Example: python backend/import_catalog.py products_catalog.xlsx")
    else:
        import_catalog(sys.argv[1])