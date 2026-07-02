import { apiSlice } from '@/api/apiSlice.js';

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOfficeSettings: builder.query({
      query: () => '/settings/office',
      providesTags: [{ type: 'Settings', id: 'OFFICE' }],
    }),
    updateOfficeSettings: builder.mutation({
      query: (body) => ({ url: '/settings/office', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Settings', id: 'OFFICE' }],
    }),
  }),
});

export const { useGetOfficeSettingsQuery, useUpdateOfficeSettingsMutation } = settingsApi;
