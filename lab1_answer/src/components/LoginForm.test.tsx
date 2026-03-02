import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import user from "@testing-library/user-event";
import LoginForm from "./LoginForm";

// Define mockLogin globally and ensure it is used correctly
const mockLogin = vi.fn();
vi.mock("../requests/login", () => ({
  login: (username: string, password: string) => mockLogin(username, password),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", () => {
  return {
    useNavigate: () => mockNavigate,
  };
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should render login form correctly", () => {
    render(<LoginForm />);

    expect(screen.queryByLabelText("Username:")).toBeInTheDocument();
    expect(screen.queryByLabelText("Password:")).toBeInTheDocument();

    // assert there's a button and that its type attribute is "submit"
    const submitButton = screen.getByRole("button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");
  });

// We should use async/await here because user.type is asynchronous.
  it("Should be able to fill the form fields", async () => {
    user.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username:"), "testuser");
    await user.type(screen.getByLabelText("Password:"), "testpassword");

// We don't need waitFor here because once we finished typing, the input field contained the text in real time.
    // waitFor(() => {
      expect(screen.getByLabelText("Username:")).toHaveValue("testuser");
      expect(screen.getByLabelText("Password:")).toHaveValue("testpassword");
    // });
  });

// Same as abrove, user.type and user.click are asynchronous. 
  it("Should call login function on form submission", async () => {
	mockLogin.mockResolvedValue({ error: "Invalid username or password" });


    user.setup();

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText("Username:");
    const passwordInput = screen.getByLabelText("Password:");
    const submitButton = screen.getByRole("button");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpassword");

    await user.click(submitButton);

// It don't need waitFor here because await user.click(submitButton) have already called mocklogin. 
    // waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("testuser", "testpassword")
    // );
  });

  it("Should navigate to /todos on successful login", async () => {
    // mock successful login response
    mockLogin.mockResolvedValueOnce({ token: "fake_token" });

    user.setup();

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText("Username:");
    const passwordInput = screen.getByLabelText("Password:");
    const submitButton = screen.getByRole("button");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpassword");

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/todos");
    });
  });

  it("Should not navigate on failed login", async () => {
    // mock failed login response
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockLogin.mockResolvedValueOnce({ error: "Invalid credentials" });

    user.setup();

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText("Username:");
    const passwordInput = screen.getByLabelText("Password:");
    const submitButton = screen.getByRole("button");

    await user.type(usernameInput, "wronguser");
    await user.type(passwordInput, "wrongpassword");

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
