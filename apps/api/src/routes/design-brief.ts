import { Router, Request, Response } from "express";
import { z } from "zod";
import { DesignBriefGeneratorService } from "../services/generators/design-brief.js";
import { BrandProfileRepository } from "../repositories/brand-profile.repository.js";

const router = Router();
const designBriefService = new DesignBriefGeneratorService();
const brandProfileRepo = new BrandProfileRepository();

const CarouselDesignBriefRequest = z.object({
  carousel: z.object({
    plan_item_id: z.string(),
    brand_profile_id: z.string(),
    mode: z.enum(["inception", "atração-fatal"]),
    slides: z.array(z.object({
      slide_number: z.number(),
      main_text: z.string(),
      support_text: z.string().optional(),
      design_note: z.string(),
      is_cover: z.boolean(),
      is_cta: z.boolean(),
    })),
    caption: z.string(),
    design_brief: z.string(),
  }),
  brand_profile_id: z.string().uuid(),
  client_id: z.string().uuid(),
});

const StaticPostDesignBriefRequest = z.object({
  post: z.object({
    plan_item_id: z.string(),
    brand_profile_id: z.string(),
    mode: z.enum(["inception", "atração-fatal"]),
    platform: z.enum(["instagram", "linkedin"]),
    main_text: z.string(),
    hashtags: z.array(z.string()),
    design_note: z.string(),
    character_count: z.number(),
    hashtag_count: z.number(),
  }),
  brand_profile_id: z.string().uuid(),
  client_id: z.string().uuid(),
});

// POST /design-brief/carousel
router.post("/carousel", async (req: Request, res: Response) => {
  try {
    const validatedData = CarouselDesignBriefRequest.parse(req.body);

    const brandProfile = await brandProfileRepo.findById(validatedData.brand_profile_id);
    if (!brandProfile) {
      return res.status(404).json({
        error_code: "BRAND_PROFILE_NOT_FOUND",
        message: "Brand profile not found",
      });
    }

    const designBrief = await designBriefService.generateCarouselDesignBrief(
      validatedData.carousel,
      brandProfile,
      validatedData.client_id
    );

    return res.status(201).json({
      success: true,
      data: designBrief,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error_code: "VALIDATION_ERROR",
        message: "Invalid request body",
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({
        error_code: "DESIGN_BRIEF_ERROR",
        message: "Failed to generate design brief",
      });
    }

    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
});

// POST /design-brief/static-post
router.post("/static-post", async (req: Request, res: Response) => {
  try {
    const validatedData = StaticPostDesignBriefRequest.parse(req.body);

    const brandProfile = await brandProfileRepo.findById(validatedData.brand_profile_id);
    if (!brandProfile) {
      return res.status(404).json({
        error_code: "BRAND_PROFILE_NOT_FOUND",
        message: "Brand profile not found",
      });
    }

    const designBrief = await designBriefService.generateStaticPostDesignBrief(
      validatedData.post,
      brandProfile,
      validatedData.client_id
    );

    return res.status(201).json({
      success: true,
      data: designBrief,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error_code: "VALIDATION_ERROR",
        message: "Invalid request body",
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({
        error_code: "DESIGN_BRIEF_ERROR",
        message: "Failed to generate design brief",
      });
    }

    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
});

export default router;
