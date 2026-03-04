import { Router, Request, Response } from "express";
import { z } from "zod";
import { ContentPost } from "@copyzen/shared";
import { StaticPostCopyGeneratorService } from "../services/generators/static-post.js";
import { BrandProfileRepository } from "../repositories/brand-profile.repository.js";

const router = Router();
const staticPostService = new StaticPostCopyGeneratorService();
const brandProfileRepo = new BrandProfileRepository();

const GenerateStaticPostRequest = z.object({
  brand_profile_id: z.string().uuid(),
  platform: z.enum(["instagram", "linkedin"]),
  content_post: z.object({
    type: z.enum(["carousel", "image"]),
    mode: z.enum(["inception", "atração-fatal"]),
    theme: z.string(),
    targetPlatform: z.enum(["instagram", "linkedin"]),
    publishOrder: z.number(),
    creativeBrief: z.string(),
    funwheelCTA: z.string().nullable(),
  }),
  options: z.object({
    style: z.enum(["educational", "promotional", "narrative"]).optional(),
  }).optional(),
});

type GenerateStaticPostRequest = z.infer<typeof GenerateStaticPostRequest>;

router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = GenerateStaticPostRequest.parse(req.body);

    const brandProfile = await brandProfileRepo.findById(validatedData.brand_profile_id);
    if (!brandProfile) {
      return res.status(404).json({
        error_code: "BRAND_PROFILE_NOT_FOUND",
        message: "Brand profile not found",
      });
    }

    const post = await staticPostService.generateStaticPost(
      validatedData.content_post as ContentPost,
      brandProfile,
      brandProfile.client_id,
      validatedData.platform,
      validatedData.options
    );

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error_code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({
        error_code: "STATIC_POST_GENERATION_ERROR",
        message: "Failed to generate post",
        details: { reason: error.message },
      });
    }

    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
});

export default router;
