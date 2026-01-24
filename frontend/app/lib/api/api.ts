/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface StandardResponse {
  /** @example 200 */
  status: number;
  data: object;
}

export interface AuthResponseDto {
  accessToken?: string;
  user?: object;
}

export interface AuthDto {
  /** @example "user@example.com" */
  email: string;
  /** @example "password123" */
  password: string;
}

export interface UserProfileDto {
  id: string;
  username: string;
  bio?: object;
  avatarUrl?: object;
  theme:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
  role: "USER" | "ADMIN";
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface MeResponseDto {
  supabaseUser: object;
  user?: UserProfileDto;
}

export interface TabDto {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface UserResponseDto {
  id: string;
  username: string;
  bio?: object;
  avatarUrl?: object;
  theme:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
  role: "USER" | "ADMIN";
  /** @format date-time */
  createdAt: string;
  reviewCount: number;
  bookmarkCount: number;
  tabs: TabDto[];
  /** Whether the current user has bookmarked this user */
  isBookmarked: boolean;
}

export interface CreateUserDto {
  /** Unique username (letters, numbers, underscores only) */
  username: string;
  bio?: string;
  avatarUrl?: string;
  theme?:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
}

export interface UpdateUserDto {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  theme?:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
}

export interface TabResponseDto {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface CreateTabDto {
  /**
   * Name of the tab
   * @example "Movies"
   */
  name: string;
}

export interface ReorderTabsDto {
  /**
   * Array of tab IDs in the desired order
   * @example ["tab-id-1","tab-id-2","tab-id-3"]
   */
  tabIds: string[];
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface CreateCategoryDto {
  /**
   * Name of the category
   * @example "Favorites"
   */
  name: string;
}

export interface ReviewListItemDto {
  id: string;
  title: string;
  mediaType: "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";
  mediaUrl?: object;
  mediaConfig?: object;
  /** @format date-time */
  publishedAt: string;
  categories: CategoryDto[];
  /** Whether the current user has bookmarked this review */
  isBookmarked: boolean;
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedReviewsDto {
  items: ReviewListItemDto[];
  meta: PaginationMetaDto;
}

export interface MetaFieldDto {
  label: string;
  value: string;
}

export interface ReviewUserDto {
  id: string;
  username: string;
  avatarUrl?: object;
  theme:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
}

export interface ReviewTabDto {
  id: string;
  name: string;
  slug: string;
}

export interface ReviewCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface RelatedReviewDto {
  id: string;
  title: string;
  mediaUrl?: object;
}

export interface ReviewDetailDto {
  id: string;
  title: string;
  description?: object;
  mediaType: "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";
  mediaUrl?: object;
  mediaConfig?: object;
  metaFields?: MetaFieldDto[];
  /** @format date-time */
  publishedAt: string;
  user: ReviewUserDto;
  tab: ReviewTabDto;
  categories: ReviewCategoryDto[];
  relatedReviews: RelatedReviewDto[];
  /** Whether the current user has bookmarked this review */
  isBookmarked: boolean;
}

export interface MetaFieldInputDto {
  /**
   * Label for the meta field
   * @example "Director"
   */
  label: string;
  /**
   * Value for the meta field
   * @example "Denis Villeneuve"
   */
  value: string;
}

export interface CreateReviewDto {
  /**
   * Title of the review
   * @example "Blade Runner 2049"
   */
  title: string;
  /** Tab ID this review belongs to */
  tabId: string;
  /** Markdown description/content */
  description?: string;
  /**
   * Type of media
   * @example "VIDEO"
   */
  mediaType: "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";
  /** URL of the media */
  mediaUrl?: string;
  /** Category IDs to assign to this review */
  categoryIds?: string[];
  /** Meta fields (key-value pairs) */
  metaFields?: MetaFieldInputDto[];
  /** Whether to publish immediately (default: false) */
  publish?: boolean;
}

export interface UpdateReviewDto {
  /**
   * Title of the review
   * @example "Blade Runner 2049"
   */
  title?: string;
  /** Markdown description/content */
  description?: string;
  /**
   * Type of media
   * @example "VIDEO"
   */
  mediaType?: "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";
  /** URL of the media */
  mediaUrl?: string;
  /** Category IDs to assign to this review */
  categoryIds?: string[];
  /** Meta fields (key-value pairs) */
  metaFields?: MetaFieldInputDto[];
  /** Whether to publish immediately (default: false) */
  publish?: boolean;
}

export interface BookmarkedReviewUserDto {
  id: string;
  username: string;
  avatarUrl?: object;
  theme:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
}

export interface BookmarkedReviewDto {
  id: string;
  title: string;
  description?: object;
  mediaType: "VIDEO" | "SPOTIFY" | "IMAGE" | "TEXT";
  mediaUrl?: object;
  /** @format date-time */
  bookmarkedAt: string;
  user: BookmarkedReviewUserDto;
}

export interface BookmarkedUserDto {
  id: string;
  username: string;
  bio?: object;
  avatarUrl?: object;
  theme:
    | "DEFAULT"
    | "EMBER"
    | "OCEAN"
    | "FOREST"
    | "VIOLET"
    | "ROSE"
    | "MINIMAL";
  reviewCount: number;
  /** @format date-time */
  bookmarkedAt: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API
 * @version 1.0
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags App
   * @name AppControllerGetHello
   * @request GET:/
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/`,
      method: "GET",
      ...params,
    });

  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerSignUp
     * @summary Create a new account
     * @request POST:/auth/signup
     */
    authControllerSignUp: (data: AuthDto, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          data?: AuthResponseDto;
        },
        any
      >({
        path: `/auth/signup`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogin
     * @summary Login with email and password
     * @request POST:/auth/login
     */
    authControllerLogin: (data: AuthDto, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: AuthResponseDto;
        },
        any
      >({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerMe
     * @summary Get current user profile
     * @request GET:/auth/me
     * @secure
     */
    authControllerMe: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: MeResponseDto;
        },
        any
      >({
        path: `/auth/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAll
     * @summary Get all users (for explore page)
     * @request GET:/users
     * @secure
     */
    usersControllerFindAll: (
      query?: {
        /**
         * Page number
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * Number of items per page
         * @min 1
         * @default 10
         * @example 10
         */
        limit?: number;
        /** Search by username */
        search?: string;
        /** @default "most_popular" */
        sortBy?: "most_popular" | "recently_active" | "newest" | "most_reviews";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: UserResponseDto[];
        },
        any
      >({
        path: `/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetMe
     * @summary Get current user profile
     * @request GET:/users/me
     * @secure
     */
    usersControllerGetMe: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: UserResponseDto;
        },
        any
      >({
        path: `/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpsertMe
     * @summary Create or replace current user profile
     * @request PUT:/users/me
     * @secure
     */
    usersControllerUpsertMe: (
      data: CreateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: UserResponseDto;
        },
        any
      >({
        path: `/users/me`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdateMe
     * @summary Update current user profile
     * @request PATCH:/users/me
     * @secure
     */
    usersControllerUpdateMe: (
      data: UpdateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: UserResponseDto;
        },
        any
      >({
        path: `/users/me`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindByUsername
     * @summary Get user by username
     * @request GET:/users/{username}
     * @secure
     */
    usersControllerFindByUsername: (
      username: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: UserResponseDto;
        },
        any
      >({
        path: `/users/${username}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  tabs = {
    /**
     * No description
     *
     * @tags Tabs
     * @name TabsControllerCreateTab
     * @summary Create a new tab
     * @request POST:/tabs
     * @secure
     */
    tabsControllerCreateTab: (data: CreateTabDto, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          data?: TabResponseDto;
        },
        any
      >({
        path: `/tabs`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tabs
     * @name TabsControllerReorderTabs
     * @summary Reorder tabs
     * @request PATCH:/tabs/reorder
     * @secure
     */
    tabsControllerReorderTabs: (
      data: ReorderTabsDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: TabResponseDto[];
        },
        any
      >({
        path: `/tabs/reorder`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tabs
     * @name TabsControllerFindCategoriesForTab
     * @summary Get categories for a specific tab
     * @request GET:/tabs/{tabId}/categories
     */
    tabsControllerFindCategoriesForTab: (
      tabId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: CategoryDto[];
        },
        any
      >({
        path: `/tabs/${tabId}/categories`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tabs
     * @name TabsControllerCreateCategory
     * @summary Create a new category for a tab
     * @request POST:/tabs/{tabId}/categories
     * @secure
     */
    tabsControllerCreateCategory: (
      tabId: string,
      data: CreateCategoryDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          data?: CategoryDto;
        },
        any
      >({
        path: `/tabs/${tabId}/categories`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tabs
     * @name TabsControllerFindReviewsForTab
     * @summary Get paginated reviews for a specific tab
     * @request GET:/tabs/{tabId}/reviews
     * @secure
     */
    tabsControllerFindReviewsForTab: (
      tabId: string,
      query?: {
        /**
         * Page number
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * Number of items per page
         * @min 1
         * @default 10
         * @example 10
         */
        limit?: number;
        /** Search by title */
        search?: string;
        /** Filter by category ID */
        categoryId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: PaginatedReviewsDto;
        },
        any
      >({
        path: `/tabs/${tabId}/reviews`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  reviews = {
    /**
     * No description
     *
     * @tags Reviews
     * @name ReviewsControllerCreate
     * @summary Create a new review
     * @request POST:/reviews
     * @secure
     */
    reviewsControllerCreate: (
      data: CreateReviewDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          data?: ReviewDetailDto;
        },
        any
      >({
        path: `/reviews`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reviews
     * @name ReviewsControllerFindById
     * @summary Get a single review by ID
     * @request GET:/reviews/{id}
     * @secure
     */
    reviewsControllerFindById: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: ReviewDetailDto;
        },
        any
      >({
        path: `/reviews/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reviews
     * @name ReviewsControllerUpdate
     * @summary Update a review
     * @request PATCH:/reviews/{id}
     * @secure
     */
    reviewsControllerUpdate: (
      id: string,
      data: UpdateReviewDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: ReviewDetailDto;
        },
        any
      >({
        path: `/reviews/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  bookmarks = {
    /**
     * No description
     *
     * @tags Bookmarks
     * @name BookmarksControllerGetReviewBookmarks
     * @summary Get bookmarked reviews for current user
     * @request GET:/bookmarks/reviews
     * @secure
     */
    bookmarksControllerGetReviewBookmarks: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: BookmarkedReviewDto[];
        },
        any
      >({
        path: `/bookmarks/reviews`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Bookmarks
     * @name BookmarksControllerGetUserBookmarks
     * @summary Get bookmarked users for current user
     * @request GET:/bookmarks/users
     * @secure
     */
    bookmarksControllerGetUserBookmarks: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          data?: BookmarkedUserDto[];
        },
        any
      >({
        path: `/bookmarks/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Bookmarks
     * @name BookmarksControllerBookmarkReview
     * @summary Bookmark a review
     * @request POST:/bookmarks/reviews/{reviewId}
     * @secure
     */
    bookmarksControllerBookmarkReview: (
      reviewId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/bookmarks/reviews/${reviewId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Bookmarks
     * @name BookmarksControllerUnbookmarkReview
     * @summary Remove a review bookmark
     * @request DELETE:/bookmarks/reviews/{reviewId}
     * @secure
     */
    bookmarksControllerUnbookmarkReview: (
      reviewId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/bookmarks/reviews/${reviewId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Bookmarks
     * @name BookmarksControllerBookmarkUser
     * @summary Bookmark a user
     * @request POST:/bookmarks/users/{userId}
     * @secure
     */
    bookmarksControllerBookmarkUser: (
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/bookmarks/users/${userId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Bookmarks
     * @name BookmarksControllerUnbookmarkUser
     * @summary Remove a user bookmark
     * @request DELETE:/bookmarks/users/{userId}
     * @secure
     */
    bookmarksControllerUnbookmarkUser: (
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/bookmarks/users/${userId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
}
