"use client";

import { z } from "zod";
import { Bot, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Loader } from "./ui/loader";
import type { Room } from "@prisma/client";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { setISODay } from "date-fns";

const MessageDisplay = (
  { message, label, className }: {
    message: string | JSX.Element;
    label: "You" | "Our AI" | null;
    className?: string;
  },
) => {
  return (
    <div
      className={cn(
        "w-full relative glassmorphic px-4 py-3 text-sm text-neutral-200 text-left rounded-xl",
        className,
      )}
    >
      {typeof message === "string"
        ? <p className="text-white">{message}</p>
        : <>{message}</>}
      {label && (
        <p className="absolute text-xs text-neutral-200 right-2 bottom-2">
          {label}
        </p>
      )}
    </div>
  );
};

type RoomWithCategory = Room & {
  category: {
    name: string;
  };
};

const AiResponseDisplay = (
  {
    response: { aiMessage, dbChosenRoom },
    setFinalPrompt,
    setPrompt,
    resetMutation,
    conversationId,
  }: {
    response: {
      aiMessage: string;
      dbChosenRoom: RoomWithCategory | null;
    };
    conversationId: string;
    setFinalPrompt: (val: string | null) => void;
    setPrompt: (val: string) => void;
    resetMutation: () => void;
  },
) => {
  const rateConversation = api.ai.rateConversation.useMutation();

  return (
    <div className="w-full flex flex-col gap-2">
      <MessageDisplay
        label={!dbChosenRoom ? "Our AI" : null}
        message={aiMessage}
        className={!!dbChosenRoom ? "rounded-b-md" : ""}
      />
      {!!dbChosenRoom && (
        <MessageDisplay
          label="Our AI"
          message={
            <div className="w-full flex items-center gap-3">
              <img
                src={dbChosenRoom.images[0]}
                className="max-w-[150px] rounded-xl"
              />
              <div className="flex flex-col gap-4 py-1">
                <p className="text-xs text-white text-left">
                  {dbChosenRoom.name}
                </p>
                <div className="flex flex-col gap-1 pl-3">
                  <p className="text-xs text-neutral-200">
                    • ${dbChosenRoom.price.toString()} per. night
                  </p>
                  <p className="text-xs text-neutral-200">
                    • Accommodates {dbChosenRoom.accommodates}{" "}
                    {dbChosenRoom.accommodates > 1 ? "people" : "person"}
                  </p>
                </div>

                <Link
                  href={`/rooms/${dbChosenRoom.id}`}
                  className="text-white text-xs underline"
                >
                  View more details
                </Link>
              </div>
            </div>
          }
          className="rounded-t-md"
        />
      )}
      <div className="text-xs flex items-center text-neutral-200 justify-between">
        <button
          className="underline text-white"
          onClick={() => {
            setFinalPrompt(null);
            setPrompt("");
            resetMutation();
          }}
        >
          Ask again?
        </button>
        {rateConversation.isLoading && (
          <Loader
            label="Sending..."
            containerClassName="w-fit p-0 text-neutral-200"
            loaderClassName="p-0 text-neutral-200"
            labelClassName="p-0 text-neutral-200 text-xs"
          />
        )}
        {(!!rateConversation.data ||
          !!rateConversation.isError) && (
          <p className="text-xs text-white font-bold">
            Thank you for your feedback!
          </p>
        )}
        {!rateConversation.data && !rateConversation.isLoading && (
          <div className="text-xs text-neutral-200 flex items-center gap-2">
            <p className="font-bold">Was this helpful?</p>
            <button
              onClick={() =>
                rateConversation.mutate({
                  conversationId,
                  feedback: "helpful",
                })}
              className="text-white underline"
            >
              Yes
            </button>
            <span>•</span>
            <button
              onClick={() =>
                rateConversation.mutate({
                  conversationId,
                  feedback: "not_helpful",
                })}
              className="text-white underline"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const HomepageAIHelp = () => {
  const [mainContainerRef] = useAutoAnimate();
  const [inputContainerRef] = useAutoAnimate();
  const [inputVal, setInputVal] = useState("");
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const getAiHelp = api.ai.getHomeHelp.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const sendMessage = () => {
    const { success } = z.string().safeParse(inputVal);
    if (!success) {
      return;
    }

    getAiHelp.mutate({ prompt: inputVal });
    setFinalPrompt(inputVal);
  };

  return (
    <div
      ref={mainContainerRef}
      className="flex flex-col items-start gap-4 mt-6 text-white px-2"
      style={{ width: "min(450px, 100%)" }}
    >
      <div
        ref={mainContainerRef}
        className="w-full flex flex-col gap-2 items-start"
      >
        <p className="text-sm text-white">What are you looking for?</p>
        {finalPrompt ? null : (
          <div
            ref={inputContainerRef}
            className="glassmorphic w-full rounded-xl flex items-center justify-start gap-0"
          >
            {!inputVal && <Bot className="w-6 h-6 ml-3 text-neutral-200" />}
            <Textarea
              minRows={1}
              maxRows={10}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-transparent py-3 text-sm pl-4 pr-9 border-none placeholder:text-neutral-200"
              placeholder="Get help from our AI"
              style={{
                resize: "none",
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={getAiHelp.isLoading}
              className="text-neutral-200 absolute right-1 bottom-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-5 h-5 mr-3" />
            </button>
          </div>
        )}
        {finalPrompt && <MessageDisplay label="You" message={finalPrompt} />}
      </div>
      {getAiHelp.isLoading && (
        <div className="w-full min-h-[150px] flex items-center justify-center px-3 glassmorphic rounded-xl">
          <Loader
            label="Asking our ai..."
            labelClassName="text-neutral-200"
            loaderClassName="text-neutral-200"
          />
        </div>
      )}
      {getAiHelp.isError && (
        <div className="w-full min-h-[150px] flex flex-col text-sm items-center justify-center px-3 glassmorphic rounded-xl gap-4">
          <p className="text-red-400 font-bold text-base">
            Oops, we got an error
          </p>
          <p className="text-sm text-neutral-200">
            {getAiHelp.error?.message ||
              "Please try again later or contact support"}
          </p>
        </div>
      )}
      {!getAiHelp.isLoading && !getAiHelp.isError && getAiHelp.data && (
        <AiResponseDisplay
          response={{
            aiMessage: getAiHelp.data.aiResponse,
            dbChosenRoom: getAiHelp.data.dbChosenRoom,
          }}
          resetMutation={() => {
            getAiHelp.reset();
          }}
          conversationId={getAiHelp.data.conversationId}
          setFinalPrompt={setFinalPrompt}
          setPrompt={setInputVal}
        />
      )}
    </div>
  );
};
