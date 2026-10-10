/**
 * Etch blog registry — the single list of every published post.
 *
 * Posts live in ./posts/*.ts (one file per post) so the daily pipeline can
 * append new ones without touching existing files. Add the import + entry
 * here when a new post file lands.
 */
import type { BlogPost } from "./types";

import aiImageGeneratorIndia from "./posts/ai-image-generator-india-pay-per-creation";
import aiProductPhotographyIndia from "./posts/ai-product-photography-india-sellers";
import aiVideoCostIndia from "./posts/how-much-does-ai-video-cost-india";
import aiVideoNoSubscription from "./posts/ai-video-without-subscription";
import aiVoiceOverReels from "./posts/ai-voice-over-reels-india";
import autoCaptionsReels from "./posts/auto-captions-instagram-reels";
import payPerCreationExplained from "./posts/what-is-pay-per-creation-ai";
import aiVsPhotoshootIndia from "./posts/ai-photoshoot-cost-comparison-india";
import productAdsWithAi from "./posts/make-product-ads-with-ai";
import aiTrendTemplates from "./posts/ai-trends-templates-explained";
import aiPortraitPrompts from "./posts/ai-portrait-prompts-indian-faces";
import festiveCreativesAi from "./posts/festive-creatives-ai-playbook";
import aiFoodPhotography from "./posts/ai-food-photography-restaurant-menus";
import amazonListingImages from "./posts/amazon-listing-images-ai-india";
import aiJewelleryPhotography from "./posts/ai-jewellery-photography-india";
import remakeEconomics from "./posts/remake-economics-ai-revisions";
import aiImagePricingModels from "./posts/ai-image-pricing-models-compared";
import facelessYoutubeStack from "./posts/faceless-youtube-channels-ai-stack";
import etchVsSubscription from "./posts/etch-vs-subscription-ai-tools";
import afterYouPayLifecycle from "./posts/what-happens-after-you-pay";
import aiRealEstatePhotos from "./posts/ai-real-estate-photos-honest-india";
import aiWeddingCardDesign from "./posts/ai-wedding-card-invitation-design";
import aiYoutubeThumbnails from "./posts/ai-youtube-thumbnails-india";
import promptEngineeringFormula from "./posts/prompt-engineering-5-part-formula";
import aspectRatiosExplained from "./posts/aspect-ratios-explained-platforms";
import aiPitchDeckImages from "./posts/ai-images-pitch-decks-presentations";
import backgroundRemovalVsAi from "./posts/background-removal-vs-ai-backgrounds";
import flipkartCatalogRefresh from "./posts/flipkart-catalog-refresh-ai";
import aiGhostMannequin from "./posts/ai-ghost-mannequin-fashion-shots";
import aiHandmadeCraftPhotos from "./posts/ai-photos-handmade-craft-sellers";
import aiSkincareBeautyShots from "./posts/ai-skincare-beauty-shots-india";
import aiElectronicsProductShots from "./posts/ai-electronics-product-shots-india";
import aiHomeDecorLifestyleScenes from "./posts/ai-home-decor-lifestyle-scenes-india";
import aiContentBudgetWorksheet from "./posts/ai-content-budget-worksheet-small-business";
import realCostOfFreeAiTools from "./posts/real-cost-of-free-ai-tools";
import ai4PackVsSingleOrders from "./posts/ai-4-pack-vs-single-orders";
import pricingTransparencyChecklist from "./posts/pricing-transparency-checklist-ai-tools";
import aiVideoHooksTextOverlays from "./posts/ai-video-hooks-text-overlays";
import repurposeVideoIntoShorts from "./posts/repurpose-video-into-shorts-ai-trim";
import voiceOverScriptsForEar from "./posts/voice-over-scripts-for-ear";
import diwaliPosterStepByStep from "./posts/diwali-poster-for-your-shop-step-by-step";
import phoneProductPhotography from "./posts/phone-product-photography-basics";
import fiveSecondPromoVideo from "./posts/five-second-promo-video-how-to";
import freeDesignToolsRoundup from "./posts/free-design-tools-roundup-india";
import festiveCampaignChecklist from "./posts/festive-campaign-checklist";
import adCopyCtasConvert from "./posts/ad-copy-ctas-that-convert";
import instagramAdCreativeSizes from "./posts/instagram-ad-creative-sizes-guide";
import shootProductVideoPhone from "./posts/shoot-product-video-with-phone";
import beforeAfterAdMakeover from "./posts/before-after-ad-makeover";
import festivalMarketingCalendar from "./posts/festival-marketing-calendar-small-business";

export const BLOG_POSTS: BlogPost[] = [
  aiImageGeneratorIndia,
  aiProductPhotographyIndia,
  aiVideoCostIndia,
  aiVideoNoSubscription,
  aiVoiceOverReels,
  autoCaptionsReels,
  payPerCreationExplained,
  aiVsPhotoshootIndia,
  productAdsWithAi,
  aiTrendTemplates,
  aiPortraitPrompts,
  festiveCreativesAi,
  aiFoodPhotography,
  amazonListingImages,
  aiJewelleryPhotography,
  remakeEconomics,
  aiImagePricingModels,
  facelessYoutubeStack,
  etchVsSubscription,
  afterYouPayLifecycle,
  aiRealEstatePhotos,
  aiWeddingCardDesign,
  aiYoutubeThumbnails,
  promptEngineeringFormula,
  aspectRatiosExplained,
  aiPitchDeckImages,
  backgroundRemovalVsAi,
  flipkartCatalogRefresh,
  aiGhostMannequin,
  aiHandmadeCraftPhotos,
  aiSkincareBeautyShots,
  aiElectronicsProductShots,
  aiHomeDecorLifestyleScenes,
  aiContentBudgetWorksheet,
  realCostOfFreeAiTools,
  ai4PackVsSingleOrders,
  pricingTransparencyChecklist,
  aiVideoHooksTextOverlays,
  repurposeVideoIntoShorts,
  voiceOverScriptsForEar,
  diwaliPosterStepByStep,
  phoneProductPhotography,
  fiveSecondPromoVideo,
  freeDesignToolsRoundup,
  festiveCampaignChecklist,
  adCopyCtasConvert,
  instagramAdCreativeSizes,
  shootProductVideoPhone,
  beforeAfterAdMakeover,
  festivalMarketingCalendar,
]
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelated(post: BlogPost, limit = 3): BlogPost[] {
  const related = post.related
    .map(getPost)
    .filter((p): p is BlogPost => Boolean(p));
  if (related.length >= limit) return related.slice(0, limit);
  // Backfill with newest posts so the section is never empty.
  for (const p of BLOG_POSTS) {
    if (p.slug !== post.slug && !related.includes(p)) {
      related.push(p);
      if (related.length >= limit) break;
    }
  }
  return related.slice(0, limit);
}

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map((p) => p.category))];
