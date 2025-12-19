import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

// Custom render function with providers
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };

