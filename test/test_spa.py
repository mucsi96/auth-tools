from playwright.sync_api import Page, expect
from pytest import fixture
from utils import sign_in


@fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "ignore_https_errors": True,
        "record_har_path": "test-results/test.har",
    }


@fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        # "devtools": True,
        # "headless": False,
    }


def test_shows_login_page_if_user_is_not_signed_in(page: Page):
    page.goto("https://spa.auth-tools.home")
    expect(page).to_have_url("https://spa.auth-tools.home/login")
    expect(page.get_by_role("button", name="Sign in")).to_be_visible()
    expect(page.get_by_role("link", name="Admin")).not_to_be_visible()
    expect(page.get_by_role("button", name="UO")).not_to_be_visible()


def test_goes_to_home_page_after_signing_in(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    expect(page.get_by_role("heading", name="Login", level=1)).to_be_visible()
    sign_in(page, "user1")
    expect(page).to_have_url("https://spa.auth-tools.home/")


def test_shows_initials_after_signing_in(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    expect(page.get_by_role("button", name="UO")).to_be_visible()


def test_shows_user_details_after_signing_in(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    expect(page.get_by_text("Id: user1")).to_be_visible()
    expect(page.get_by_text("Name: User One")).to_be_visible()
    expect(page.get_by_text("Email: user1@example.com")).to_be_visible()
    expect(
        page.get_by_text(
            "Authorities: ROLE_Reader, ROLE_Writer, ROLE_Dashboard.Viewer, SCOPE_read, SCOPE_write"
        )
    ).to_be_visible()


def test_shows_user_info_in_account_dropdown(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    page.get_by_role("button", name="UO").click()
    list = page.get_by_role("list")
    expect(list.get_by_text("User One")).to_be_visible()
    expect(list.get_by_text("user1@example.com")).to_be_visible()


def test_shows_admin_link_for_user_with_admin_role(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    expect(page.get_by_role("link", name="Admin")).to_be_visible()


def test_does_not_show_admin_link_for_user_without_admin_role(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user2")
    expect(page.get_by_role("link", name="Admin")).not_to_be_visible()


def test_allows_change_for_user_with_admin_role(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    page.get_by_role("button", name="Change").click()
    expect(
        page.get_by_role("status").filter(has_text="User data changed successfully.")
    ).to_be_visible()


def test_denies_change_for_user_without_admin_role(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user2")
    page.get_by_role("button", name="Change").click()
    expect(
        page.get_by_role("status").filter(
            has_text="You are not allowed to change user data."
        )
    ).to_be_visible()


def test_denies_change_if_user_is_not_signed_in(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Change").click()
    expect(
        page.get_by_role("status").filter(
            has_text="You are not authorized to change user data."
        )
    ).to_be_visible()


def test_shows_login_page_after_signing_out(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    page.get_by_role("button", name="UO").click()
    page.get_by_role("button", name="Sign out").click()
    expect(page).to_have_url("https://spa.auth-tools.home/login")
    expect(page.get_by_role("button", name="Sign in")).to_be_visible()
    expect(page.get_by_role("link", name="Admin")).not_to_be_visible()
    expect(page.get_by_role("button", name="UO")).not_to_be_visible()


def test_denies_access_on_too_frequent_authentication(page: Page):
    page.goto("https://spa.auth-tools.home")
    page.get_by_role("button", name="Sign in").click()
    sign_in(page, "user1")
    page.get_by_role("button", name="UO").click()
    page.get_by_role("button", name="Sign out").click()
    page.get_by_role("button", name="Sign in").click()
    expect(page.get_by_text("Access denied")).to_be_visible()
