import { apiSlice } from '@/api/apiSlice.js';
import { setAccessToken, clearAccessToken } from '@/lib/token.js';
import { setCredentials, clearCredentials } from './authSlice.js';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        setAccessToken(data.data.accessToken);
        dispatch(setCredentials(data.data.user));
      },
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearAccessToken();
          dispatch(clearCredentials());
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data.user));
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.data.user));
      },
      invalidatesTags: ['Auth'],
    }),
    uploadAvatar: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return { url: '/auth/me/avatar', method: 'POST', body: formData };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.data.user));
      },
      invalidatesTags: ['Auth'],
    }),
    removeAvatar: builder.mutation({
      query: () => ({ url: '/auth/me/avatar', method: 'DELETE' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.data.user));
      },
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
