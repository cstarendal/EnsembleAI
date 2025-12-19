import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

// Custom render function with providers
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
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
