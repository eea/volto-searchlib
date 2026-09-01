import time
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

    # AI Summary gating (issue 307513)
    AI_SUMMARY_TOGGLE = ".search-input .ai-summary-toggle"
    NO_RESULTS_MESSAGE = ".content-area:has-text('could not find any results')"

    # Backend endpoints
    AI_CHAT_ENDPOINT = "/_da/chat/"
    AI_CHAT_SESSION_ENDPOINT = "/_da/chat/create-chat-session"
    AI_CHAT_MESSAGE_ENDPOINT = "/_da/chat/send-chat-message"
    ES_SEARCH_ENDPOINT = "/_search"

    # Search results
    RESULTS_CONTAINER = ".listing"
    RESULT_ITEMS = ".listing-item, .result-item"
    PAGING_INFO = ".pagination, .sui-paging-info"

    # Disclaimer
    DISCLAIMER_TRIGGER = ".chatbot-header-right .icon-btn.outline"
    DISCLAIMER_MODAL = ".chatbot-disclaimer-modal"

class SearchPage:
    """Page object for interacting with the search page."""

    # Shared with the header/search-block AI Summary toggles (issue 307513)
    AI_SUMMARY_STORAGE_KEY = "eea-ai-summary-enabled"

    def __init__(self, page: Page):
        self.page = page
        self.selectors = SearchPageSelectors
        # Issue 307513: network-level tracking of LLM and search traffic
        self.chat_request_urls = []
        self.first_chat_request_at = None
        self.es_search_response_times = []
        self.page.on("request", self._on_request)
        self.page.on("response", self._on_response)

    def _on_request(self, request):
        if self.selectors.AI_CHAT_ENDPOINT in request.url:
            if self.first_chat_request_at is None:
                self.first_chat_request_at = time.monotonic()
            self.chat_request_urls.append(request.url)

    def _on_response(self, response):
        if (
            self.selectors.ES_SEARCH_ENDPOINT in response.url
            and response.request.method == "POST"
        ):
            self.es_search_response_times.append(time.monotonic())

    @property
    def search_input(self) -> Locator:
        return self.page.locator(self.selectors.SEARCH_INPUT).first

    @property
    def ai_summary_expanded(self) -> Locator:
        return self.page.locator(self.selectors.AI_SUMMARY_EXPANDED)

    @property
    def ai_summary_toggle(self) -> Locator:
        return self.page.locator(self.selectors.AI_SUMMARY_TOGGLE).first

    @property
    def no_results_message(self) -> Locator:
        return self.page.locator(self.selectors.NO_RESULTS_MESSAGE).first

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

    def wait_for_chat_quiescence(self, grace_ms: int = 8000):
        """Give any (incorrect) LLM request time to fire after results render."""
        print(f"  Action: Waiting {grace_ms}ms for potential LLM requests...")
        self.page.wait_for_timeout(grace_ms)

    def wait_for_chat_request(self, url_fragment: str, timeout_ms: int = 30000):
        """Wait until a chat request whose URL contains url_fragment is sent."""
        print(f"  Action: Waiting for chat request matching '{url_fragment}'...")
        deadline = time.monotonic() + timeout_ms / 1000
        while time.monotonic() < deadline:
            if any(url_fragment in url for url in self.chat_request_urls):
                return
            self.page.wait_for_timeout(200)
        raise TimeoutError(
            f"No chat request matching '{url_fragment}' within {timeout_ms}ms. "
            f"Observed: {self.chat_request_urls}"
        )

    def set_ai_summary_toggle(self, enabled: bool):
        """Persist the AI Summary preference and reload the page."""
        value = "1" if enabled else "0"
        print(f"  Action: Persisting AI Summary preference={value} and reloading")
        self.page.evaluate(
            f"() => localStorage.setItem('{self.AI_SUMMARY_STORAGE_KEY}', '{value}')"
        )
        self.page.reload()
        self.search_input.wait_for(state="visible")
