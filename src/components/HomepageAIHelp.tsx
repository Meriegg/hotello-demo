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

const MessageDisplay = ({
  message,
  label,
  className,
}: {
  message: string | JSX.Element;
  label: "You" | "Our AI" | null;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "glassmorphic relative w-full rounded-xl px-4 py-3 text-left text-sm text-neutral-200",
        className,
      )}
    >
      {typeof message === "string" ? (
        <p className="text-white">{message}</p>
      ) : (
        <>{message}</>
      )}
      {label && (
        <p className="absolute bottom-2 right-2 text-xs text-neutral-200">
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

const AiResponseDisplay = ({
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
}) => {
  const rateConversation = api.ai.rateConversation.useMutation();

  return (
    <div className="flex w-full flex-col gap-2">
      <MessageDisplay
        label={!dbChosenRoom ? "Our AI" : null}
        message={aiMessage}
        className={!!dbChosenRoom ? "rounded-b-md" : ""}
      />
      {!!dbChosenRoom && (
        <MessageDisplay
          label="Our AI"
          message={
            <div className="flex w-full items-center gap-3">
              <img
                src={dbChosenRoom.images[0]}
                className="max-w-[150px] rounded-xl"
              />
              <div className="flex flex-col gap-4 py-1">
                <p className="text-left text-xs text-white">
                  {dbChosenRoom.name}
                </p>
                <div className="flex flex-col gap-1 pl-3">
                  <p className="text-xs text-neutral-200">
                    • ${dbChosenRoom.price / 100} per. night
                  </p>
                  <p className="text-xs text-neutral-200">
                    • Accommodates {dbChosenRoom.accommodates}{" "}
                    {dbChosenRoom.accommodates > 1 ? "people" : "person"}
                  </p>
                </div>

                <Link
                  href={`/rooms/${dbChosenRoom.id}`}
                  className="text-xs text-white underline"
                >
                  View more details
                </Link>
              </div>
            </div>
          }
          className="rounded-t-md"
        />
      )}
      <div className="flex items-center justify-between text-xs text-neutral-200">
        <button
          className="text-white underline"
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
        {(!!rateConversation.data || !!rateConversation.isError) && (
          <p className="text-xs font-bold text-white">
            Thank you for your feedback!
          </p>
        )}
        {!rateConversation.data && !rateConversation.isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-200">
            <p className="font-bold">Was this helpful?</p>
            <button
              onClick={() =>
                rateConversation.mutate({
                  conversationId,
                  feedback: "helpful",
                })
              }
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
                })
              }
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
      className="mt-6 flex flex-col items-start gap-4 px-2 text-white"
      style={{ width: "min(450px, 100%)" }}
    >
      <div
        ref={mainContainerRef}
        className="flex w-full flex-col items-start gap-2"
      >
        <p className="text-sm text-white">What are you looking for?</p>
        {finalPrompt ? null : (
          <div
            ref={inputContainerRef}
            className="glassmorphic flex w-full items-center justify-start gap-0 rounded-xl"
          >
            {!inputVal && <Bot className="ml-3 h-6 w-6 text-neutral-200" />}
            <Textarea
              minRows={1}
              maxRows={10}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full border-none bg-transparent py-3 pl-4 pr-9 text-sm placeholder:text-neutral-200"
              placeholder="Get help from our AI"
              style={{
                resize: "none",
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={getAiHelp.isLoading}
              className="absolute bottom-3 right-1 text-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <SendIcon className="mr-3 h-5 w-5" />
            </button>
          </div>
        )}
        {finalPrompt && <MessageDisplay label="You" message={finalPrompt} />}
      </div>
      {getAiHelp.isLoading && (
        <div className="glassmorphic flex min-h-[150px] w-full items-center justify-center rounded-xl px-3">
          <Loader
            label="Asking our ai..."
            labelClassName="text-neutral-200"
            loaderClassName="text-neutral-200"
          />
        </div>
      )}
      {getAiHelp.isError && (
        <div className="glassmorphic flex min-h-[150px] w-full flex-col items-center justify-center gap-4 rounded-xl px-3 text-sm">
          <p className="text-base font-bold text-red-400">
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
