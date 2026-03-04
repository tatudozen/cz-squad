import { Router, Request, Response } from "express";
import { z } from "zod";
import { ContentPost } from "@copyzen/shared";
import { CarouselCopyGeneratorService } from "../services/generators/carousel.js";
import { BrandProfileRepository } from "../repositories/brand-profile.repository.js";

const router = Router();
const carouselService = new CarouselCopyGeneratorService();
const brandProfileRepo = new BrandProfileRepository();

// Validation schema
const GenerateCarouselRequest = z.object({
  brand_profile_id: z.string().uuid("Invalid brand_profile_id format"),
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
    slide_count: z.number().int().min(4).max(8).optional(),
    style: z.enum(["educational", "promotional", "narrative"]).optional(),
  }).optional(),
});

type GenerateCarouselRequest = z.infer<typeof GenerateCarouselRequest>;

// POST /carousel - Generate carousel copy
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request
    const validatedData = GenerateCarouselRequest.parse(req.body);

    // Fetch brand profile
    const brandProfile = await brandProfileRepo.findById(validatedData.brand_profile_id);
    if (!brandProfile) {
      return res.status(404).json({
        error_code: "BRAND_PROFILE_NOT_FOUND",
        message: "Brand profile not found",
        details: { brand_profile_id: validatedData.brand_profile_id },
      });
    }

    // Generate carousel
    const carousel = await carouselService.generateCarousel(
      validatedData.content_post as ContentPost,
      brandProfile,
      brandProfile.client_id,
      validatedData.options
    );

    return res.status(201).json({
      success: true,
      data: carousel,
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
        error_code: "CAROUSEL_GENERATION_ERROR",
        message: "Failed to generate carousel copy",
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
