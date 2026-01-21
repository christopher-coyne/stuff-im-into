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

export interface OnboardingDto {
  /** @example "johndoe" */
  username: string;
  /** @example "Film enthusiast and bookworm" */
  bio?: string;
}

export interface MeResponseDto {
  supabaseUser: object;
  user?: UserProfileDto;
}

export interface TabDto {
  id: string;
  name: string;
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

export interface CategoryDto {
  id: string;
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
     * @name AuthControllerOnboarding
     * @summary Complete profile setup after signup
     * @request POST:/auth/onboarding
     * @secure
     */
    authControllerOnboarding: (
      data: OnboardingDto,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          data?: UserProfileDto;
        },
        any
      >({
        path: `/auth/onboarding`,
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
        format: "json",
        ...params,
      }),
  };
  tabs = {
    /**
     * No description
     *
     * @tags Tabs
     * @name TabsControllerFindCategoriesForTab
     * @summary Get categories used in a specific tab
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
     * @name TabsControllerFindReviewsForTab
     * @summary Get paginated reviews for a specific tab
     * @request GET:/tabs/{tabId}/reviews
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
        format: "json",
        ...params,
      }),
  };
}
