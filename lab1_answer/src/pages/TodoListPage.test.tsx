import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TodoListPage from "./TodoListPage";
import type { Todo } from "../types/types";

// We still need mockResolvedValue([]) because useEffect run time is unpredictable, so we should force vi.fn() to return an empty resolved value.
const mockGetTodoList = vi.fn().mockResolvedValue([]);
vi.mock("../requests/getTodoList", () => ({
  getTodoList: () => mockGetTodoList(),
}));

describe("TodoListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

// We need async/await here because waitFor return a promise(waitFor is asynchronous).
  it("Should render TodoListPage correctly", async () => {
    // render(<TodoListPage />);

    const todoList: Todo[] = [
      { id: 1, title: "Test Todo 1", completed: false },
      { id: 2, title: "Test Todo 2", completed: true },
    ];

    mockGetTodoList.mockResolvedValueOnce(todoList);

// We should render "TodoListPage after mockGetTodoList.mockResolvedValueOnce(todoList);", because render trigger useEffect which calls getTodoList() immediately, and getToDoList return a promise.
    render(<TodoListPage />);

    await waitFor(() => {
      expect(screen.getByText("Todo List")).toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
      expect(
        screen.getByText("Test Todo 1 [Not Completed]")
      ).toBeInTheDocument();
      expect(screen.getByText("Test Todo 2 [Completed]")).toBeInTheDocument();
    });
  });

  it("Should display error message on fetch failure", async () => {
    mockGetTodoList.mockRejectedValueOnce(new Error("Fetch error"));

    render(<TodoListPage />);

// The same, waitFor is asynchronous.
    await waitFor(() => {
      expect(
        screen.getByText("Error fetching todo list. Please try again later.")
      ).toBeInTheDocument();
    });
  });
});
