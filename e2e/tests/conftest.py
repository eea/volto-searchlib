import pytest
from playwright.sync_api import Page, expect
from config import get_settings
from page_objects.search_page import SearchPage

@pytest.fixture(scope="session")
def settings():
    return get_settings()

@pytest.fixture(scope="session", autouse=True)
def configure_expect_timeout(settings):
    expect.set_options(timeout=settings.expect_timeout)

@pytest.fixture
def context(browser, settings, request):
    # Enable video recording and tracing
    video_dir = f"{settings.reports_dir}/videos/{request.node.name}"
    ctx = browser.new_context(
        viewport={"width": 1280, "height": 1800},
        record_video_dir=video_dir
    )
    
    # Start tracing
    ctx.tracing.start(screenshots=True, snapshots=True, sources=True)
    
    yield ctx
    
    # Stop tracing and save to file
    trace_path = f"{settings.reports_dir}/traces/{request.node.name}.zip"
    ctx.tracing.stop(path=trace_path)
    
    ctx.close()

@pytest.fixture
def page(context, settings):
    p = context.new_page()
    p.set_default_timeout(settings.timeout)
    yield p
    p.close()

@pytest.fixture
def search_page(page, settings) -> SearchPage:
    """Navigate to search page and return page object."""
    sp = SearchPage(page)
    page.goto(settings.search_url)
    sp.search_input.wait_for(state="visible")
    return sp
