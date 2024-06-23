from playwright.sync_api import Page, expect, BrowserContext
from pytest import fixture
from utils import sign_in


@fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "ignore_https_errors": True,
        "record_har_path": "test-results/test.har"
    }


@fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        # "devtools": True,
        # "headless": False,
    }


# @fixture(scope="function")
# def context(browser: Browser):
#     context = browser.new_context()
#     context.clear_cookies()
#     yield context
#     context.close()


# @fixture(scope="function")
# def page(context: Browser):
#     page = context.new_page()
#     yield page
#     page.close()


# def test_restricts_access_by_showing_loging_page(page: Page):
#     page.goto("https://web.auth-tools.home")
#     expect(page.get_by_role("heading", name="Login", level=1)).to_be_visible()
#     sign_in(page, "user1")
#     expect(page.get_by_role("heading", name="Hello, World!", level=1)).to_be_visible()


# def test_keeps_user_logged_in_on_reload(page: Page):
#     page.goto("https://web.auth-tools.home")
#     expect(page.get_by_role("heading", name="Login", level=1)).to_be_visible()
#     sign_in(page, "user1")
#     page.reload()
#     expect(page.get_by_role("heading", name="Hello, World!", level=1)).to_be_visible()


# def test_denies_access_to_user_without_permission(page: Page):
#     page.goto("https://web.auth-tools.home")
#     sign_in(page, "user2")
#     expect(page.get_by_text("Access denied")).to_be_visible()


# def test_denies_access_on_too_frequent_authentication(page: Page, context: BrowserContext):
#     page.goto("https://web.auth-tools.home")
#     sign_in(page, "user1")
#     context.clear_cookies(name="traefik.accessToken")
#     page.reload()
#     expect(page.get_by_text("Access denied")).to_be_visible()
