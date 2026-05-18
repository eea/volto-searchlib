FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install chromium

COPY . .

RUN mkdir -p reports && chmod 777 reports

ENV SEARCH_BASE_URL=https://www.eea.europa.eu
ENV SEARCH_PATH=/en/advanced-search
ENV HEADLESS=true
ENV REPORTS_DIR=/app/reports

CMD ["pytest", "tests/", "-v", "-s", "--tb=short"]
