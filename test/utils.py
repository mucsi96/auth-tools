from playwright.sync_api import Page

def sign_in(page: Page, username: str):
    page.get_by_role("textbox", name="Username:").fill(username)
    page.get_by_role("textbox", name="Password:").fill("password")
    page.get_by_role("button", name="Login").click()