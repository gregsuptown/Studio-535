import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { 
  catalogCategories, 
  catalogSubcategories, 
  catalogProducts,
  productPricingTiers,
  type CatalogCategory,
  type CatalogProduct
} from "../drizzle/schema";
import { eq, like, and, or, desc, asc, sql } from "drizzle-orm";

export const catalogRouter = router({
  // ==========================================
  // PUBLIC ENDPOINTS - Customer-facing catalog
  // ==========================================

  /**
   * Get all active categories
   */
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    const categories = await db
      .select()
      .from(catalogCategories)
      .where(eq(catalogCategories.isActive, 1))
      .orderBy(asc(catalogCategories.displayOrder));
    return categories;
  }),

  /**
   * Get single category by slug
   */
  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [category] = await db
        .select()
        .from(catalogCategories)
        .where(and(
          eq(catalogCategories.slug, input.slug),
          eq(catalogCategories.isActive, 1)
        ));
      
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }
      return category;
    }),

  /**
   * Get subcategories for a category
   */
  getSubcategories: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const subcategories = await db
        .select()
        .from(catalogSubcategories)
        .where(and(
          eq(catalogSubcategories.categoryId, input.categoryId),
          eq(catalogSubcategories.isActive, 1)
        ))
        .orderBy(asc(catalogSubcategories.displayOrder));
      return subcategories;
    }),

  /**
   * Get products with filtering and pagination
   */
  getProducts: publicProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      subcategoryId: z.number().optional(),
      search: z.string().optional(),
      designLevel: z.enum(["low", "medium", "high"]).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      featured: z.boolean().optional(),
      page: z.number().default(1),
      limit: z.number().default(24),
      sortBy: z.enum(["name", "price", "newest", "featured"]).default("name"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const offset = (input.page - 1) * input.limit;
      
      // Build where conditions
      const conditions = [eq(catalogProducts.isActive, 1)];
      
      if (input.categoryId) {
        conditions.push(eq(catalogProducts.categoryId, input.categoryId));
      }
      if (input.subcategoryId) {
        conditions.push(eq(catalogProducts.subcategoryId, input.subcategoryId));
      }
      if (input.designLevel) {
        conditions.push(eq(catalogProducts.designLevel, input.designLevel));
      }
      if (input.featured) {
        conditions.push(eq(catalogProducts.isFeatured, 1));
      }
      if (input.minPrice) {
        conditions.push(sql`${catalogProducts.retailPrice} >= ${input.minPrice}`);
      }
      if (input.maxPrice) {
        conditions.push(sql`${catalogProducts.retailPrice} <= ${input.maxPrice}`);
      }
      if (input.search) {
        conditions.push(
          or(
            like(catalogProducts.name, `%${input.search}%`),
            like(catalogProducts.keywords, `%${input.search}%`),
            like(catalogProducts.searchText, `%${input.search}%`)
          )!
        );
      }

      // Determine sort order
      let orderBy;
      switch (input.sortBy) {
        case "price":
          orderBy = asc(catalogProducts.retailPrice);
          break;
        case "newest":
          orderBy = desc(catalogProducts.createdAt);
          break;
        case "featured":
          orderBy = desc(catalogProducts.isFeatured);
          break;
        default:
          orderBy = asc(catalogProducts.name);
      }

      // Get products
      const products = await db
        .select()
        .from(catalogProducts)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(catalogProducts)
        .where(and(...conditions));

      return {
        products,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / input.limit),
        },
      };
    }),

  /**
   * Get single product by SKU
   */
  getProductBySku: publicProcedure
    .input(z.object({ sku: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [product] = await db
        .select()
        .from(catalogProducts)
        .where(and(
          eq(catalogProducts.jdsSku, input.sku),
          eq(catalogProducts.isActive, 1)
        ));
      
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      // Get pricing tiers
      const pricingTiers = await db
        .select()
        .from(productPricingTiers)
        .where(eq(productPricingTiers.productId, product.id))
        .orderBy(asc(productPricingTiers.minQuantity));

      // Get category info
      const [category] = await db
        .select()
        .from(catalogCategories)
        .where(eq(catalogCategories.id, product.categoryId));

      return { ...product, pricingTiers, category };
    }),

  /**
   * Get featured products for homepage
   */
  getFeaturedProducts: publicProcedure
    .input(z.object({ limit: z.number().default(8) }))
    .query(async ({ input }) => {
      const db = await getDb();
      const products = await db
        .select()
        .from(catalogProducts)
        .where(and(
          eq(catalogProducts.isActive, 1),
          eq(catalogProducts.isFeatured, 1)
        ))
        .orderBy(desc(catalogProducts.displayOrder))
        .limit(input.limit);
      return products;
    }),

  // ==========================================
  // ADMIN ENDPOINTS - Catalog management
  // ==========================================

  /**
   * Create or update a category
   */
  upsertCategory: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      slug: z.string(),
      name: z.string(),
      description: z.string().optional(),
      designLevel: z.enum(["low", "medium", "high"]),
      serviceType: z.string().optional(),
      imageUrl: z.string().optional(),
      displayOrder: z.number().default(0),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      if (input.id) {
        // Update existing
        await db
          .update(catalogCategories)
          .set({
            slug: input.slug,
            name: input.name,
            description: input.description,
            designLevel: input.designLevel,
            serviceType: input.serviceType,
            imageUrl: input.imageUrl,
            displayOrder: input.displayOrder,
            isActive: input.isActive ? 1 : 0,
          })
          .where(eq(catalogCategories.id, input.id));
        return { id: input.id };
      } else {
        // Insert new
        const [result] = await db
          .insert(catalogCategories)
          .values({
            slug: input.slug,
            name: input.name,
            description: input.description,
            designLevel: input.designLevel,
            serviceType: input.serviceType,
            imageUrl: input.imageUrl,
            displayOrder: input.displayOrder,
            isActive: input.isActive ? 1 : 0,
          });
        return { id: result.insertId };
      }
    }),

  /**
   * Create or update a product
   */
  upsertProduct: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      categoryId: z.number(),
      subcategoryId: z.number().optional(),
      jdsSku: z.string(),
      jdsClassCode: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      descriptionLong: z.string().optional(),
      wholesalePrice: z.number().optional(),
      retailPrice: z.number().optional(),
      dimensions: z.string().optional(),
      weight: z.string().optional(),
      material: z.string().optional(),
      color: z.string().optional(),
      imageUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      keywords: z.string().optional(),
      designLevel: z.enum(["low", "medium", "high"]).default("medium"),
      isFeatured: z.boolean().default(false),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Build searchable text
      const searchText = [
        input.name,
        input.description,
        input.keywords,
        input.material,
        input.jdsSku,
      ].filter(Boolean).join(" ");

      if (input.id) {
        await db
          .update(catalogProducts)
          .set({
            categoryId: input.categoryId,
            subcategoryId: input.subcategoryId,
            jdsSku: input.jdsSku,
            jdsClassCode: input.jdsClassCode,
            name: input.name,
            description: input.description,
            descriptionLong: input.descriptionLong,
            wholesalePrice: input.wholesalePrice,
            retailPrice: input.retailPrice,
            dimensions: input.dimensions,
            weight: input.weight,
            material: input.material,
            color: input.color,
            imageUrl: input.imageUrl,
            thumbnailUrl: input.thumbnailUrl,
            keywords: input.keywords,
            searchText,
            designLevel: input.designLevel,
            isFeatured: input.isFeatured ? 1 : 0,
            isActive: input.isActive ? 1 : 0,
          })
          .where(eq(catalogProducts.id, input.id));
        return { id: input.id };
      } else {
        const [result] = await db
          .insert(catalogProducts)
          .values({
            categoryId: input.categoryId,
            subcategoryId: input.subcategoryId,
            jdsSku: input.jdsSku,
            jdsClassCode: input.jdsClassCode,
            name: input.name,
            description: input.description,
            descriptionLong: input.descriptionLong,
            wholesalePrice: input.wholesalePrice,
            retailPrice: input.retailPrice,
            dimensions: input.dimensions,
            weight: input.weight,
            material: input.material,
            color: input.color,
            imageUrl: input.imageUrl,
            thumbnailUrl: input.thumbnailUrl,
            keywords: input.keywords,
            searchText,
            designLevel: input.designLevel,
            isFeatured: input.isFeatured ? 1 : 0,
            isActive: input.isActive ? 1 : 0,
          });
        return { id: result.insertId };
      }
    }),

  /**
   * Bulk import products from CSV data
   */
  bulkImportProducts: adminProcedure
    .input(z.object({
      products: z.array(z.object({
        categoryId: z.number(),
        jdsSku: z.string(),
        jdsClassCode: z.string().optional(),
        name: z.string(),
        description: z.string().optional(),
        wholesalePrice: z.number().optional(),
        retailPrice: z.number().optional(),
        imageUrl: z.string().optional(),
        keywords: z.string().optional(),
        designLevel: z.enum(["low", "medium", "high"]).default("medium"),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      let imported = 0;
      let skipped = 0;

      for (const product of input.products) {
        try {
          const searchText = [product.name, product.description, product.keywords, product.jdsSku]
            .filter(Boolean).join(" ");

          await db
            .insert(catalogProducts)
            .values({
              categoryId: product.categoryId,
              jdsSku: product.jdsSku,
              jdsClassCode: product.jdsClassCode,
              name: product.name,
              description: product.description,
              wholesalePrice: product.wholesalePrice,
              retailPrice: product.retailPrice,
              imageUrl: product.imageUrl,
              keywords: product.keywords,
              searchText,
              designLevel: product.designLevel,
            })
            .onDuplicateKeyUpdate({
              set: {
                name: product.name,
                description: product.description,
                wholesalePrice: product.wholesalePrice,
                retailPrice: product.retailPrice,
                imageUrl: product.imageUrl,
              },
            });
          imported++;
        } catch (error) {
          skipped++;
        }
      }

      return { imported, skipped, total: input.products.length };
    }),

  /**
   * Delete a product
   */
  deleteProduct: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(catalogProducts).where(eq(catalogProducts.id, input.id));
      return { success: true };
    }),

  /**
   * Get catalog stats for admin dashboard
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    
    const [categoryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(catalogCategories);
    
    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(catalogProducts);
    
    const [featuredCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(catalogProducts)
      .where(eq(catalogProducts.isFeatured, 1));

    return {
      categories: Number(categoryCount.count),
      products: Number(productCount.count),
      featured: Number(featuredCount.count),
    };
  }),

  /**
   * Seed initial categories
   */
  seedCategories: publicProcedure.mutation(async () => {
    const db = await getDb();
    
    const categories = [
      {
        slug: "awards-trophies",
        name: "Awards & Trophies",
        description: "Crystal awards, plaques, sports trophies, and certificates. Perfect for recognition ceremonies, sports events, and corporate achievements.",
        productCount: 2500,
        designLevel: "medium" as const,
        serviceType: "Personalization & Engraving",
        displayOrder: 1,
      },
      {
        slug: "laser-engraving-materials",
        name: "Laser Engraving Materials",
        description: "Acrylic sheets, leather patches, engraving stock, and specialty materials for precision laser work.",
        productCount: 1300,
        designLevel: "high" as const,
        serviceType: "Full Custom Design & Precision Work",
        displayOrder: 2,
      },
      {
        slug: "gift-products",
        name: "Gift Products",
        description: "Engraved knives, tools, corporate gifts, and personalized items perfect for any occasion.",
        productCount: 1161,
        designLevel: "medium" as const,
        serviceType: "Personalization",
        displayOrder: 3,
      },
      {
        slug: "display-cases",
        name: "Display & Cases",
        description: "Trophy cases, shelving, and retail displays for showcasing your achievements and products.",
        productCount: 878,
        designLevel: "low" as const,
        serviceType: "Assembly & Installation",
        displayOrder: 4,
      },
      {
        slug: "signage-tools",
        name: "Signage Tools",
        description: "Cutting tools, installation accessories, and specialty equipment for sign-making.",
        productCount: 200,
        designLevel: "low" as const,
        serviceType: "Stock Items",
        displayOrder: 5,
      },
    ];

    for (const cat of categories) {
      await db
        .insert(catalogCategories)
        .values(cat)
        .onDuplicateKeyUpdate({ set: { name: cat.name } });
    }

    return { seeded: categories.length };
  }),
});
