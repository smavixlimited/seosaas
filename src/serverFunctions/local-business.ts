import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LocalBusinessService } from "@/services/local-business.service";
import {
  requireProjectContext,
  requireAuthenticatedContext,
} from "@/serverFunctions/middleware";

const localBusinessEmptySchema = z
  .object({
    projectId: z.string().optional(),
  })
  .passthrough()
  .optional();

export const getLocalBusinessDashboard = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(localBusinessEmptySchema)
  .handler(async ({ context }) => {
    return await LocalBusinessService.getLocalBusinessDashboard(
      context.projectId,
    );
  });

export const runLocalGeoGridScan = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      keyword: z.string().min(1),
      centerLat: z.number(),
      centerLng: z.number(),
      radiusKm: z.number().positive().default(5.0),
      gridSize: z.enum(["3x3", "5x5"]).default("3x3"),
    }),
  )
  .handler(async ({ data, context }) => {
    return await LocalBusinessService.runLocalGridScan({
      projectId: context.projectId,
      keyword: data.keyword,
      centerLat: data.centerLat,
      centerLng: data.centerLng,
      radiusKm: data.radiusKm,
      gridSize: data.gridSize,
    });
  });

export const generateAiReviewResponse = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      author: z.string().min(1),
      rating: z.number().min(1).max(5),
      reviewText: z.string().min(1),
      businessName: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    return await LocalBusinessService.draftAiReviewResponse(data);
  });

export const publishReviewReplyServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      reviewId: z.string().min(1),
      responseText: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    return await LocalBusinessService.publishReviewReply({
      projectId: context.projectId,
      reviewId: data.reviewId,
      responseText: data.responseText,
    });
  });

export const connectGoogleBusinessProfileServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireProjectContext)
  .validator(
    z.object({
      businessName: z.string().min(1),
      streetAddress: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      phoneNumber: z.string().optional(),
      primaryCategory: z.string().optional(),
      placeId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return await LocalBusinessService.connectGoogleBusinessProfile({
      projectId: context.projectId,
      ...data,
    });
  });

export const searchGooglePlacesServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      query: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    return await LocalBusinessService.searchGooglePlaces(data.query);
  });

export const createLocalLocationServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      locationName: z.string().min(1),
      businessName: z.string().min(1),
      streetAddress: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      countryCode: z.string().optional(),
      phoneNumber: z.string().optional(),
      websiteUrl: z.string().optional(),
      primaryCategory: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return await LocalBusinessService.createLocation({
      projectId: context.projectId,
      ...data,
    });
  });

export const getReviewCampaignKitServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      businessName: z.string().min(1),
      locationId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    return LocalBusinessService.getReviewCampaignKit(
      data.businessName,
      data.locationId,
    );
  });

export const startGbpOAuthServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      callbackURL: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { createSelfHostedGoogleAuthorizationUrl, GBP_INTEGRATION } =
      await import("@/server/features/google/selfHostedOAuth");
    const { getPublicOrigin } = await import("@/server/mcp/public-origin");
    const { getRequest } = await import("@tanstack/react-start/server");

    const req = getRequest();
    const origin = req
      ? getPublicOrigin(req)
      : process.env.VITE_APP_URL || "http://localhost:3000";

    const authUrl = await createSelfHostedGoogleAuthorizationUrl({
      integration: GBP_INTEGRATION,
      user: {
        userId: context.userId,
        userEmail: context.userEmail,
      },
      callbackURL: data.callbackURL,
      publicOrigin: origin,
    });

    return { authUrl };
  });

export const detectGoogleProfilesServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      projectId: z.string().optional(),
      userEmail: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    try {
      const { fetchLiveGoogleBusinessProfiles } =
        await import("@/server/features/google/gbpClient");
      const liveProfiles = await fetchLiveGoogleBusinessProfiles(
        context.userId,
      );
      if (liveProfiles && liveProfiles.length > 0) {
        return liveProfiles;
      }
    } catch (err) {
      console.warn("Could not query live GBP profiles:", err);
    }

    return await LocalBusinessService.detectGoogleBusinessProfiles(
      data?.userEmail || context.userEmail,
      data?.projectId,
    );
  });

export const saveBusinessLocationServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().optional(),
      businessName: z.string().min(1),
      streetAddress: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      countryCode: z.string().optional(),
      phoneNumber: z.string().optional(),
      websiteUrl: z.string().optional(),
      primaryCategory: z.string().optional(),
      placeId: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      connectGoogle: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return await LocalBusinessService.saveBusinessLocation({
      projectId: context.projectId,
      ...data,
    });
  });

export const connectDetectedProfileServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().optional(),
      profileId: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    return await LocalBusinessService.connectDetectedGoogleProfile({
      projectId: context.projectId,
      profileId: data.profileId,
    });
  });
