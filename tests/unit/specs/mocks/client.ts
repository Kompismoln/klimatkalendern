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
export let requestHandlers: Record<string, RequestHandler>;

export function getMockClient(queries: Array<any>): any {
  mockClient = createMockClient({
    cache,
    resolvers: buildCurrentUserResolver(cache),
  });
  requestHandlers = {
    nullHandle: vi.fn().mockResolvedValue(nullMock),
  };
  queries.forEach((query: any, index: number) => {
    let mock_val = null;
    let query_gq = null;
    if (Array.isArray(query)) {
      query_gq = query[0];
      mock_val = query[1];
    } else {
      query_gq = query;
      mock_val = nullMock;
    }
    requestHandlers["handle_" + index.toString()] = vi
      .fn()
      .mockResolvedValue(mock_val);
    mockClient.setRequestHandler(
      query_gq,
      requestHandlers["handle_" + index.toString()]
    );
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
