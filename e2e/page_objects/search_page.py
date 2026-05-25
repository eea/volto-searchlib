from playwright.sync_api import Page, Locator, expect

class SearchPageSelectors:
    """CSS selectors for search page elements."""

    # Search input
    SEARCH_INPUT = "input#downshift-0-input, .search-input input, .searchbox input, input.sui-search-box__text-input"
    SEARCH_SUBMIT = ".search-input button[type='submit'], .sui-search-box__submit, button.sui-search-box__submit"

    # AI Summary section (ChatbotAnswer component)
    AI_SUMMARY_WRAPPER = ".chatbot-answer-wrapper"
    AI_SUMMARY_EXPANDED = ".chatbot-answer-wrapper.expanded"
    AI_SUMMARY_LABEL = ".chatbot-header .label"
    AI_SUMMARY_LOADING = ".chatbot-answer.loading"
    AI_SUMMARY_CONTENT = ".chatbot-summary-content"
    AI_SUMMARY_ERROR = ".chatbot-answer .ui.warning.message, .chatbot-answer .error"
    READ_MORE_BUTTON = ".get-answer-btn"
    DETAILED_CONTENT = ".chatbot-detailed-content"

    # Search results
    RESULTS_CONTAINER = ".listing"
    RESULT_ITEMS = ".listing-item, .result-item"
    PAGING_INFO = ".pagination, .sui-paging-info"

    # Disclaimer
    DISCLAIMER_TRIGGER = ".chatbot-header-right .icon-btn.outline"
    DISCLAIMER_MODAL = ".chatbot-disclaimer-modal"

class SearchPage:
    """Page object for interacting with the search page."""

    def __init__(self, page: Page):
        self.page = page
        self.selectors = SearchPageSelectors

    @property
    def search_input(self) -> Locator:
        return self.page.locator(self.selectors.SEARCH_INPUT).first

    @property
    def search_submit(self) -> Locator:
        return self.page.locator(self.selectors.SEARCH_SUBMIT).first

    @property
    def ai_summary_wrapper(self) -> Locator:
        return self.page.locator(self.selectors.AI_SUMMARY_WRAPPER)

    @property
    def ai_summary_loading(self) -> Locator:
        return self.page.locator(self.selectors.AI_SUMMARY_LOADING)

    @property
    def ai_summary_content(self) -> Locator:
        return self.page.locator(self.selectors.AI_SUMMARY_CONTENT)

    @property
    def ai_summary_error(self) -> Locator:
        return self.page.locator(self.selectors.AI_SUMMARY_ERROR)

    @property
    def read_more_button(self) -> Locator:
        return self.page.locator(self.selectors.READ_MORE_BUTTON)

    @property
    def detailed_content(self) -> Locator:
        return self.page.locator(self.selectors.DETAILED_CONTENT)

    @property
    def results_container(self) -> Locator:
        return self.page.locator(self.selectors.RESULTS_CONTAINER)

    @property
    def result_items(self) -> Locator:
        return self.page.locator(self.selectors.RESULT_ITEMS)

    @property
    def disclaimer_trigger(self) -> Locator:
        return self.page.locator(self.selectors.DISCLAIMER_TRIGGER)

    @property
    def disclaimer_modal(self) -> Locator:
        return self.page.locator(self.selectors.DISCLAIMER_MODAL)

    def search(self, query: str):
        """Perform a search."""
        print(f"  Action: Typing query '{query}'")
        self.search_input.fill(query)
        print("  Action: Pressing Enter")
        self.search_input.press("Enter")
        # Alternative: self.search_submit.click()
        print(f"  Action: Waiting for results container: {self.selectors.RESULTS_CONTAINER}")
        self.results_container.wait_for(state="visible")
        print("  Action: Results container visible.")

    def wait_for_ai_summary(self, timeout=30000):
        """Wait for the AI summary to be expanded."""
        print(f"  Action: Waiting for AI summary expansion: {self.selectors.AI_SUMMARY_EXPANDED}")
        self.page.wait_for_selector(self.selectors.AI_SUMMARY_EXPANDED, timeout=timeout)
        print("  Action: AI summary expanded.")
