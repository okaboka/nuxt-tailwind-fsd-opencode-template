import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { useRuntimeConfig } from '#imports';

/**
 * Обертка над $fetch: подставляет baseURL из runtimeConfig.
 */
export const apiFetch = async <
  DataRes,
  DataReq extends NitroFetchRequest = Request,
>(
  url: string,
  opts: NitroFetchOptions<DataReq> = {},
): Promise<DataRes> => {
  const runtimeConfig = useRuntimeConfig();

  return $fetch<DataRes>(url, {
    ...opts,
    baseURL: runtimeConfig.public.apiBaseUrl,
  });
};
