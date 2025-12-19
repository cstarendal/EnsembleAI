import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// Custom render function with providers
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  const result = render(ui, { wrapper: Wrapper, ...options });
  return {
    ...result,
    user: userEvent.setup(),
  };
}

// Re-export everything from testing-library
export {
  render as originalRender,
  screen,
  waitFor,
  within,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
export { renderWithProviders as render };
export { userEvent };
