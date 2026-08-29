import unittest
from dataclasses import fields

from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import is_valid_live_job
from app.utils.date_parser import is_date_allowed, parse_posted_date
from app.services.jobstreet_scraper import JobstreetScraper
from app.services.kalibrr_scraper import KalibrrScraper
from app.services.lokerid_scraper import LokerIdScraper


class ScraperRegressionTests(unittest.TestCase):
    def test_scraper_settings_have_no_third_party_scrape_api(self) -> None:
        self.assertFalse(any(field.name.startswith("firecrawl_") for field in fields(Settings)))

    def test_jobstreet_empty_browser_html_uses_fallback_path(self) -> None:
        scraper = object.__new__(JobstreetScraper)

        self.assertEqual(
            scraper._extract_cards_from_html(None, page=1, role_slug="data-analyst"),
            [],
        )

    def test_lokerid_detects_current_card_markup_and_company(self) -> None:
        soup = BeautifulSoup(
            """
            <article>
              <span class="text-secondary-500">PT Reftech Jaya Optima</span>
              <a href="/penjualan/konsultan-penjualan/data-analyst.html"><h3>Data Analyst</h3></a>
            </article>
            """,
            "html.parser",
        )

        self.assertTrue(LokerIdScraper._has_matching_listing(soup, "Data Analyst"))
        company = soup.select_one("article span.text-secondary-500")
        self.assertEqual(company.get_text(strip=True), "PT Reftech Jaya Optima")

    def test_kalibrr_accepts_slug_based_job_urls_and_rejects_company_urls(self) -> None:
        scraper = object.__new__(KalibrrScraper)
        job_href = "/c/acme/jobs/data-analyst-123"
        company_href = "/c/acme"
        soup = BeautifulSoup(
            f'<a class="kalibrr-job-list-card" href="{job_href}"><h2>Data Analyst</h2></a>',
            "html.parser",
        )

        self.assertTrue(scraper._is_job_href(job_href))
        self.assertFalse(scraper._is_job_href(company_href))
        self.assertTrue(scraper._has_matching_listing(scraper._listing_cards(soup), "Data Analyst"))
        self.assertFalse(scraper._has_matching_listing(scraper._listing_cards(soup), "Backend Engineer"))
        self.assertTrue(
            is_valid_live_job(
                source="kalibrr",
                source_url=f"https://www.kalibrr.com{job_href}",
                title="Data Analyst",
                company="Acme Indonesia",
            )
        )

    def test_date_parser_supports_jobstreet_english_relative_dates(self) -> None:
        self.assertIsNotNone(parse_posted_date("1d ago"))
        self.assertIsNotNone(parse_posted_date("2 days ago"))
        self.assertIsNotNone(parse_posted_date("3h ago"))

    def test_date_filter_rejects_known_old_dates_and_keeps_unknown_dates(self) -> None:
        self.assertFalse(is_date_allowed("2020-01-01", max_days_ago=7, start_date=None))
        self.assertTrue(is_date_allowed(None, max_days_ago=7, start_date=None))

    def test_karir_job_urls_are_validated_as_live_listing_pages(self) -> None:
        self.assertTrue(
            is_valid_live_job(
                source="karir",
                source_url="https://karir.com/opportunities/1401466",
                title="Finance Supervisor",
                company="PT Dwinajaya Berkat Abadi",
            )
        )


if __name__ == "__main__":
    unittest.main()
