import re
from playwright.sync_api import Page, expect
from pytest import fixture

def get_password():
    with open("/tmp/test_password") as f:
        return f.read().strip()

@fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "ignore_https_errors": True,
    }

@fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        # "devtools": True,
        "headless": False,
    }

def test_redirects_to_authelia_on_sign_in_click(page: Page):
    page.goto("https://auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    expect(page).to_have_title("Login - Authelia")

def test_authelia(page: Page):
    page.goto("https://authelia.auth-tools.home")
    page.get_by_label("Username").fill("john_doe")
    page.keyboard.press("Tab")
    page.get_by_label("Password").fill(get_password())
    page.keyboard.press("Enter")
    expect(page.get_by_text("Hi John Doe")).to_be_visible()

def test_shows_user_details_after_sign_in(page: Page):
    page.goto("https://auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    print(page.url)
    page.get_by_label("Username").fill("john_doe")
    page.keyboard.press("Tab")
    page.get_by_label("Password").fill(get_password())
    page.keyboard.press("Enter")
    page.get_by_role("button", name="Accept").click()
    expect(page.get_by_text("Hello John Doe!")).to_be_visible()

def test_shows_sign_in_error_on_deny(page: Page):
    page.goto("https://auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    print(page.url)
    page.get_by_label("Username").fill("john_doe")
    page.keyboard.press("Tab")
    page.get_by_label("Password").fill(get_password())
    page.keyboard.press("Enter")
    page.get_by_role("button", name="Deny").click()
    expect(page.get_by_role("status").filter(has_text="Authentication failed")).to_be_visible()

def test_sign_out(page: Page):
    page.goto("https://auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    print(page.url)
    page.get_by_label("Username").fill("john_doe")
    page.keyboard.press("Tab")
    page.get_by_label("Password").fill(get_password())
    page.keyboard.press("Enter")
    page.get_by_role("button", name="Accept").click()
    page.get_by_role("button", name="Sign out").click()
    expect(page.get_by_role("button", name="Sign in")).to_be_visible()
