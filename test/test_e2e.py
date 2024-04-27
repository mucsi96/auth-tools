import re
from playwright.sync_api import Page, expect

def get_password():
    with open("/tmp/test_password") as f:
        return f.read().strip()

def test_redirects_to_authelia_on_sign_in_click(page: Page):
    page.goto("http://auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    expect(page).to_have_title("Login - Authelia")

def test_shows_user_details_after_sign_in(page: Page):
    page.goto("http://auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    page.get_by_label("Username").fill("john_doe")
    page.keyboard.press("Tab")
    page.get_by_label("Password").fill(get_password())
    page.keyboard.press("Enter")
    # page.get_by_role("button", name="SIGN IN").click()
    expect(page).to_have_title("Logine - Authelia")

def test_get_started_link(page: Page):
    page.goto("http://authelia.auth-tools.home")
    page.get_by_label("Username").fill("john_doe")
    page.get_by_label("Password").fill(get_password())
    page.get_by_role("button", name="SIGN IN").click()
    expect(page.get_by_role("heading", name="Installation")).to_be_visible()
