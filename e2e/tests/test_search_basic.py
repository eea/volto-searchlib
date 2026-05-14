import pytest
from playwright.sync_api import expect
from page_objects.search_page import SearchPage

@pytest.mark.basic
class TestSearchBasic:
    def test_search_page_loads(self, search_page: SearchPage):
        """Verify the search page loads with correct elements."""
        print(f"\nVerifying search page loads at: {search_page.page.url}")
        expect(search_page.search_input).to_be_visible()
        # expect(search_page.search_submit).to_be_visible()

    def test_search_returns_results(self, search_page: SearchPage):
        """Verify that a search returns result items."""
        query = "climate change"
        print(f"\nTesting search results for query: {query}")
        search_page.search(query)
        
        print("Waiting for results container...")
        expect(search_page.results_container).to_be_visible()
        expect(search_page.result_items.first).to_be_visible()
        count = search_page.result_items.count()
        print(f"Results found: {count}")
        assert count > 0

    def test_search_no_console_errors(self, search_page: SearchPage):
        """Verify that searching doesn't trigger console errors."""
        query = "air quality"
        print(f"\nTesting console errors for query: {query}")
        errors = []
        search_page.page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        search_page.page.on("pageerror", lambda err: errors.append(err.message))
        
        search_page.search(query)
        
        # Filter out known non-critical errors if any exist
        critical_errors = [e for e in errors if "Failed to load resource" not in e]
        assert len(critical_errors) == 0, f"Detected console errors: {critical_errors}"
