import { Router, Request, Response } from "express";
import { z } from "zod";
import { ContentStrategyService } from "../services/content/strategy.js";
import { BriefingRepository } from "../repositories/briefing.repository.js";
import { BrandProfileRepository } from "../repositories/brand-profile.repository.js";

const router = Router();
const contentService = new ContentStrategyService();
const briefingRepo = new BriefingRepository();
const brandProfileRepo = new BrandProfileRepository();

// Validation schema
const CreateContentPlanRequest = z.object({
  briefing_id: z.string().uuid("Invalid briefing_id format"),
  brand_profile_id: z.string().uuid("Invalid brand_profile_id format"),
  total_posts: z.number().int().min(1).max(50).optional(),
  inception_ratio: z.number().min(0).max(1).optional(),
  formats: z.enum(["carousel", "image", "mix"]).optional(),
});

type CreateContentPlanRequest = z.infer<typeof CreateContentPlanRequest>;

// POST /content/plan - Create content plan
router.post("/plan", async (req: Request, res: Response) => {
  try {
    // Validate request
    const validatedData = CreateContentPlanRequest.parse(req.body);

    // Fetch briefing
    const briefing = await briefingRepo.findById(validatedData.briefing_id);
    if (!briefing) {
      return res.status(404).json({
        error_code: "BRIEFING_NOT_FOUND",
        message: "Briefing not found",
        details: { briefing_id: validatedData.briefing_id },
      });
    }

    // Fetch brand profile
    const brandProfile = await brandProfileRepo.findById(validatedData.brand_profile_id);
    if (!brandProfile) {
      return res.status(404).json({
        error_code: "BRAND_PROFILE_NOT_FOUND",
        message: "Brand profile not found",
        details: { brand_profile_id: validatedData.brand_profile_id },
      });
    }

    // Create content plan
    const contentPlan = await contentService.createContentPlan(
      briefing,
      brandProfile,
      {
        totalPosts: validatedData.total_posts,
        inceptionRatio: validatedData.inception_ratio,
        formats: validatedData.formats,
      }
    );

    return res.status(201).json({
      success: true,
      data: contentPlan,
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
        error_code: "CONTENT_PLAN_GENERATION_ERROR",
        message: "Failed to generate content plan",
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
