import json

import pytest
from playwright.sync_api import expect

from config import get_settings
from page_objects.search_page import SearchPage, SearchPageSelectors

# Grace period after results have rendered: the summary trigger now fires
# right after Elasticsearch completes, so anything that is going to fire
# has fired by then.
CHAT_GRACE_MS = 8000

# Ticket FR 4 examples that must NOT trigger the LLM.
TICKET_KEYWORD_EXAMPLES = ["SOER", "PDF", "climate", "climate adaptation strategy"]


def _load_fixture_questions():
    settings = get_settings()
    fixture_path = settings.fixtures_path / "questions.json"
    with open(fixture_path) as fixture_file:
        return json.load(fixture_file)["test_cases"]


@pytest.mark.ai_summary
class TestAISummaryGating:
    """Network-level proofs for the issue 307513 acceptance criteria:

    * No LLM call for obvious keyword searches.
    * No LLM request when the AI summary is disabled in user preferences.
    * The preference persists across sessions (browser storage).
    * Search results visible without waiting for AI generation.
    * Search remains fully functional if AI generation fails.
    """

    @pytest.mark.parametrize(
        "test_case",
        _load_fixture_questions(),
        ids=lambda test_case: test_case["id"],
    )
    def test_intent_gate_from_fixture(self, search_page: SearchPage, test_case):
        """questions.json: qualifying questions reach the LLM, keywords never do."""
        query = test_case["question"]
        expect_ai = test_case["expect_ai_summary"]
        print(f"\nFixture case {test_case['id']}: '{query}' (expect AI: {expect_ai})")
        search_page.search(query)

        if expect_ai:
            search_page.wait_for_ai_summary()
            # The expanded state can appear as soon as the fetch starts
            # (skeleton), so wait for both LLM requests explicitly.
            search_page.wait_for_chat_request(
                SearchPageSelectors.AI_CHAT_SESSION_ENDPOINT
            )
            search_page.wait_for_chat_request(
                SearchPageSelectors.AI_CHAT_MESSAGE_ENDPOINT
            )
            print(f"LLM calls observed: {len(search_page.chat_request_urls)}")
        else:
            search_page.wait_for_chat_quiescence(CHAT_GRACE_MS)
            assert not search_page.chat_request_urls, (
                f"No LLM calls expected for '{query}', got: "
                f"{search_page.chat_request_urls}"
            )
            expect(search_page.ai_summary_expanded).to_be_hidden()
            print("No LLM calls observed.")

    @pytest.mark.parametrize("query", TICKET_KEYWORD_EXAMPLES)
    def test_ticket_keyword_examples_make_no_llm_calls(
        self, search_page: SearchPage, query
    ):
        """Ticket FR 4 examples: keyword/retrieval searches never call the LLM."""
        print(f"\nTesting ticket keyword example: '{query}'")
        search_page.search(query)
        search_page.wait_for_chat_quiescence(CHAT_GRACE_MS)
        assert not search_page.chat_request_urls, (
            f"No LLM calls expected for '{query}', got: "
            f"{search_page.chat_request_urls}"
        )
        expect(search_page.ai_summary_expanded).to_be_hidden()
        print("No LLM calls observed.")

    def test_zero_results_question_makes_no_llm_calls(self, search_page: SearchPage):
        """A question with no results must not burn an LLM call (FR 4)."""
        query = "What is the zorpflimble blargh?"
        print(f"\nTesting zero-result question: '{query}'")
        # The listing stays hidden with zero results, so drive the search
        # manually and wait for the empty state instead.
        search_page.search_input.fill(query)
        search_page.search_input.press("Enter")
        expect(search_page.no_results_message).to_be_visible()
        assert search_page.result_items.count() == 0, (
            "Expected zero results for the nonsense question"
        )
        search_page.wait_for_chat_quiescence(CHAT_GRACE_MS)
        assert not search_page.chat_request_urls, (
            f"No LLM calls expected for a zero-result search, got: "
            f"{search_page.chat_request_urls}"
        )
        expect(search_page.ai_summary_expanded).to_be_hidden()
        print("No LLM calls observed.")

    def test_disabled_preference_prevents_llm_calls_and_persists(
        self, search_page: SearchPage
    ):
        """AI summaries off: no LLM request even for a question, the box
        shows the opt-in state, and the preference persists across
        reloads (FR 2)."""
        query = "How does climate change affect biodiversity?"
        print(f"\nTesting disabled AI summary with question: '{query}'")
        search_page.set_ai_summary_toggle(False)

        search_page.search(query)
        search_page.wait_for_chat_quiescence(CHAT_GRACE_MS)
        assert not search_page.chat_request_urls, (
            f"No LLM calls expected with AI summaries off, got: "
            f"{search_page.chat_request_urls}"
        )
        # The question is intent-eligible, so the box stays visible in its
        # disabled state with the opt-in button.
        expect(search_page.ai_summary_disabled_box).to_be_visible()
        expect(search_page.ai_summary_enable_button).to_be_visible()

        # The preference must survive a page reload.
        search_page.page.reload()
        search_page.search_input.wait_for(state="visible")
        expect(search_page.ai_summary_disabled_box).to_be_visible(timeout=30000)
        stored = search_page.page.evaluate(
            f"() => localStorage.getItem('{SearchPage.AI_SUMMARY_STORAGE_KEY}')"
        )
        assert stored == "0", f"Preference not persisted, got: {stored!r}"
        assert not search_page.chat_request_urls, (
            f"No LLM calls expected after reload, got: "
            f"{search_page.chat_request_urls}"
        )
        print("Disabled preference persisted across reload, no LLM calls observed.")

    def test_in_box_opt_out_stops_llm_calls_and_shows_opt_in(
        self, search_page: SearchPage
    ):
        """The opt-out in the summary box stops the LLM, persists the
        preference and flips the box to its opt-in state."""
        query = "How does climate change affect biodiversity?"
        print(f"\nTesting in-box opt-out with question: '{query}'")
        search_page.search(query)
        search_page.wait_for_ai_summary()
        search_page.wait_for_chat_request(
            SearchPageSelectors.AI_CHAT_SESSION_ENDPOINT
        )
        search_page.wait_for_chat_request(
            SearchPageSelectors.AI_CHAT_MESSAGE_ENDPOINT
        )
        calls_before = len(search_page.chat_request_urls)

        expect(search_page.ai_summary_disable_button).to_be_visible()
        search_page.ai_summary_disable_button.click()
        print("Clicked the in-box opt-out.")

        expect(search_page.ai_summary_disabled_box).to_be_visible()
        expect(search_page.ai_summary_enable_button).to_be_visible()
        stored = search_page.page.evaluate(
            f"() => localStorage.getItem('{SearchPage.AI_SUMMARY_STORAGE_KEY}')"
        )
        assert stored == "0", f"Preference not persisted, got: {stored!r}"

        # No further LLM traffic after the opt-out.
        search_page.wait_for_chat_quiescence(CHAT_GRACE_MS)
        assert len(search_page.chat_request_urls) == calls_before, (
            f"No LLM calls expected after the opt-out, got new: "
            f"{search_page.chat_request_urls[calls_before:]}"
        )
        print("Opt-out persisted, box shows the opt-in state, no new LLM calls.")

    def test_results_render_before_first_llm_call(self, search_page: SearchPage):
        """The first LLM request must not start before the Elasticsearch
        response for the query has arrived (FR 3 progressive loading)."""
        query = "What are the main sources of air pollution in Europe?"
        print(f"\nTesting results-first ordering for: '{query}'")
        es_responses_before = len(search_page.es_search_response_times)
        search_page.search(query)
        search_page.wait_for_ai_summary()

        es_times = search_page.es_search_response_times[es_responses_before:]
        assert es_times, "No Elasticsearch response observed for the query"
        assert search_page.chat_request_urls, "No LLM request observed"
        assert search_page.first_chat_request_at is not None

        es_at = es_times[0]
        chat_at = search_page.first_chat_request_at
        print(f"ES response at {es_at:.3f}s, first LLM request at {chat_at:.3f}s")
        assert chat_at >= es_at - 0.25, (
            "LLM request started before the search results were available"
        )

    def test_search_still_works_when_ai_fails(self, search_page: SearchPage):
        """If the AI backend fails, results still render and the page stays
        functional (acceptance criteria)."""
        query = "How does climate change affect biodiversity?"
        print(f"\nTesting AI failure path for: '{query}'")
        search_page.page.route("**/_da/chat/**", lambda route: route.abort())

        search_page.search(query)
        expect(search_page.result_items.first).to_be_visible()
        print("Results visible despite the AI failure.")

        search_page.wait_for_chat_quiescence(CHAT_GRACE_MS)
        expect(search_page.ai_summary_expanded).to_be_hidden()
        print("AI area stays hidden, search remains functional.")
