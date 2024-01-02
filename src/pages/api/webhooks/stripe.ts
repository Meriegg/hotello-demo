/// <reference types="stripe-event-types" />

import type { NextApiRequest, NextApiResponse } from "next";
import type { Stripe } from "stripe";
import { stripe } from "~/lib/stripe";
import { buffer } from "micro";
import { env } from "~/env.mjs";
import { db } from "~/server/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

type WebhookEventType = Stripe.DiscriminatedEvent;

const routeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  let event: WebhookEventType | null = null;

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(401).end().json({
      message: "No stripe signature found.",
    });
  }

  const reqBuf = await buffer(req);

  try {
    event = stripe.webhooks.constructEvent(
      reqBuf,
      signature,
      env.STRIPE_ENDPOINT_SECRET,
    ) as WebhookEventType;

    // eslint-disable-next-line
  } catch (err: any) {

    // eslint-disable-next-line
    console.log(`⚠️  Webhook signature verification failed.`, err?.message);
    return res.status(401).end().json({
      message: "Stripe webhook signature verification failed.",
    });
  }

  if (!event) {
    return res.status(500).end().json({ message: "Something went wrong." });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await db.booking.update({
        where: {
          paymentIntentId: event.data.object.id,
        },
        data: {
          paymentStatus: "PAID",
        },
      });
      break;
    case "payment_intent.processing":
      await db.booking.update({
        where: {
          paymentIntentId: event.data.object.id,
        },
        data: {
          paymentStatus: "PENDING",
        },
      });
      break;
    case "payment_intent.payment_failed":
      await db.booking.update({
        where: {
          paymentIntentId: event.data.object.id,
        },
        data: {
          paymentStatus: "FAILED",
        },
      });
      break;
    default:
      return res.status(400).end().json({ message: "Unsupported webhook." });
  }

  return res.status(200).end().json({ message: "Success." });
};

export default routeHandler;
