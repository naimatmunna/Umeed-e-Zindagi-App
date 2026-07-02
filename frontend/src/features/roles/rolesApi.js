import { apiSlice } from '@/api/apiSlice.js';

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: (params = {}) => ({ url: '/roles', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((r) => ({ type: 'Role', id: r.id })), { type: 'Role', id: 'LIST' }]
          : [{ type: 'Role', id: 'LIST' }],
    }),
    getRole: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Role', id }],
    }),
    createRole: builder.mutation({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
