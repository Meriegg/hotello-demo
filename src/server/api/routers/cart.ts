import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { createCartJwt, extractFromCartJwt } from "~/server/utils/cart-jwt";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { createCookieVerification } from "~/server/utils/cookies";

export const cartRouter = createTRPCRouter({
  addToCart: publicProcedure.input(z.object({ productId: z.string() }))
    .mutation(async ({ input: { productId } }) => {
      const cookieVerificationToken = createCookieVerification("cart");

      const cookieStore = cookies();
      const pastCookie = cookieStore.get("cart")?.value;
      if (!pastCookie) {
        const newToken = createCartJwt([productId]);

        return { cartToken: newToken, cookieVerificationToken };
      }

      const productIds = extractFromCartJwt(pastCookie);
      if (!productIds) {
        const newToken = createCartJwt([productId]);

        return { cartToken: newToken, cookieVerificationToken };
      }

      const newProductsToken = createCartJwt([
        ...new Set([...productIds, productId]),
      ]);

      return { cartToken: newProductsToken, cookieVerificationToken };
    }),
  getProductIds: publicProcedure.query(async () => {
    const cookieStore = cookies();
    const cartCookie = cookieStore.get("cart")?.value;
    if (!cartCookie) {
      return null;
    }

    return extractFromCartJwt(cartCookie);
  }),
  getProducts: publicProcedure.query(async ({ ctx: { db } }) => {
    const cookieStore = cookies();
    const cartCookie = cookieStore.get("cart")?.value;
    if (!cartCookie) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You do not have any items in your cart.",
      });
    }

    const productIds = extractFromCartJwt(cartCookie);
    if (!productIds || !productIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You do not have any items in your cart.",
      });
    }

    const products = await db.room.findMany({
      where: { id: { in: productIds } },
    });
    if (!products.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "Unable to find any valid product in your car, please try again or contact support.",
      });
    }

    if (products.length < productIds.length) {
      return {
        products,
        lessThanCookieWarn: true,
      };
    }

    return { products };
  }),
  getCartTotal: publicProcedure.query(async ({ ctx: { db } }) => {
    const cookieStore = cookies();
    const cartCookie = cookieStore.get("cart")?.value;
    if (!cartCookie) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You do not have any items in your cart.",
      });
    }

    const productIds = extractFromCartJwt(cartCookie);
    if (!productIds || !productIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You do not have any items in your cart.",
      });
    }

    const products = await db.room.findMany({
      where: { id: { in: productIds } },
    });
    if (!products.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "Unable to find any valid product in your car, please try again or contact support.",
      });
    }

    const prices: number[] = [];

    products.forEach((room) => {
      prices.push(
        !!room.discountPercentage && !!room.discountedPrice
          ? parseFloat(room.discountedPrice.toString())
          : parseFloat(room.price.toString()),
      );
    });

    const total = prices.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    return {
      products,
      total,
    };
  }),
  removeItem: publicProcedure.input(z.object({ productId: z.string() }))
    .mutation(async ({ input: { productId } }) => {
      const cookieStore = cookies();
      const cartCookie = cookieStore.get("cart")?.value;
      if (!cartCookie) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You don't have any items in your cart.",
        });
      }

      const productIds = extractFromCartJwt(cartCookie);
      if (!productIds || !productIds?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You don't have any items in your cart.",
        });
      }

      const newIds = productIds.filter((id: string) => id !== productId);

      const cookieVerificationToken = createCookieVerification("cart");
      const newToken = createCartJwt(newIds);

      return { newToken, cookieVerificationToken };
    }),
});
