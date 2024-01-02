import { z } from "zod";
import { env } from "~/env.mjs";
import { OpenAI } from "openai";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const aiRouter = createTRPCRouter({
  getHomeHelp: publicProcedure.input(z.object({ prompt: z.string() })).mutation(
    async ({ ctx: { db }, input: { prompt } }) => {
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      const rooms = await db.room.findMany({
        select: {
          name: true,
          price: true,
          id: true,
          accommodates: true,
          hasSpecialNeeds: true,
        },
      });
      const finalPrompt =
        `You are being used on a hotel website for a “Get help from our AI feature”. This feature allows the user to type in what they are looking for (ex: a room that accommodates 2 people below $300 per night) and get the room that suits them the best, you are going to help choose that room. I will give you 2 inputs, the user’s input and the current rooms present in the database. Here is what each of the fields on the rooms mean: name: the name of the room, price: the price of the room per night (IN USD MULTIPLIED BY 100), id: the id of the room, discountedPrice: this is the discounted price of the room (it will be null if there is no discount available) (IN USD), hasSpecialNeeds: this will be true if the room supports persons with special needs. This is how you will receive the input: “{userInput: string, currentRooms: [THE ROOMS]}”, and this is how you will respond “{yourResponse: string, chosenRoom: ROOM}”. The yourResponse will be a short message, for example “Hello there 😊, I have detected that this room fits your needs perfectly!” and the chosenRoom can either be a room or null if you can’t find a match, of course the \`yourResponse\` should be a short message like: "I wasn't able to find a specific match for your requirements".

YOUR INPUTS: { userInput: "${prompt}", currentRooms: [${JSON.stringify(rooms.map((room) => JSON.stringify(room)))
        }] }

Remembed to only respond in the json format i gave you!
All prices are in USD ($)`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        stream: false,
        messages: [
          {
            role: "user",
            content: finalPrompt,
          },
        ],
      });
      // const completion: any = {
      //   choices: [
      //     {
      //       message: {
      //         content: `{
      // "yourResponse": "Hello there 😊, I have detected that this room fits your needs perfectly!",
      // "chosenRoom": {"id": "cloe51pjy0001ihhaf6w6cn6j"}
      // }`,
      //       },
      //     },
      //   ],
      // };

      const completionMessage = completion.choices[0]?.message.content;
      const parsedData = JSON.parse(completionMessage ?? "null") as {
        yourResponse: string;
        chosenRoom: { id: string };
      };

      const { success } = z.object({
        yourResponse: z.string(),
        chosenRoom: z.any(),
      }).safeParse(parsedData);
      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not get a response, please try again.",
        });
      }

      const chosenRoom = parsedData.chosenRoom
        ? await db.room.findUnique({
          where: { id: parsedData?.chosenRoom?.id },
          include: { category: true },
        })
        : null;

      const dbResponse = await db.aiHelpResponse.create({
        data: {
          aiTextResponse: parsedData.yourResponse,
          fullAiResponse: parsedData,
          aiRoomidResponse: chosenRoom?.id,
          userPrompt: prompt,
        },
      });

      return {
        aiResponse: parsedData.yourResponse,
        aiChosenRoom: parsedData.chosenRoom,
        dbChosenRoom: chosenRoom,
        conversationId: dbResponse.id,
      };
    },
  ),
  rateConversation: publicProcedure.input(
    z.object({
      conversationId: z.string(),
      feedback: z.enum(["helpful", "not_helpful"]),
    }),
  ).mutation(async ({ ctx: { db }, input: { conversationId, feedback } }) => {
    const modifiedConversation = await db.aiHelpResponse.update({
      where: {
        id: conversationId,
      },
      data: {
        feedback,
      },
    });

    return modifiedConversation;
  }),
});
