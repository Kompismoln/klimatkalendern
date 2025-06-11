import buildCurrentUserResolver from "@/apollo/user";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { cache } from "@/apollo/memory";
import {
  createMockClient,
  MockApolloClient,
  RequestHandler,
} from "mock-apollo-client";
import { vi } from "vitest";
import { nullMock } from "../common";

let mockClient: MockApolloClient | null;
let requestHandlers: Record<string, RequestHandler>;

export function getMockClient(queries: Array<string>): any {
  mockClient = createMockClient({
    cache,
    resolvers: buildCurrentUserResolver(cache),
  });
  requestHandlers = {
    nullHandle: vi.fn().mockResolvedValue(nullMock),
  };
  queries.forEach((query: any) => {
    mockClient.setRequestHandler(query, requestHandlers.nullHandle);
  });
  return { provide: { [DefaultApolloClient]: mockClient } };
}

export function createMockIntersectionObserver(): void {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
}
