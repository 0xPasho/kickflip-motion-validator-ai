"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

type PreviewType = "fail" | "win";
const VideoPreview = ({
  url,
  onSelect,
  selected,
}: {
  url: string;
  onSelect: () => void;
  selected: boolean;
}) => {
  return (
    <div className="flex flex-col cursor-pointer" onClick={onSelect}>
      {selected && (
        <div className="bg-primary text-center text-white rounded-full absolute px-4">
          Selected
        </div>
      )}
      <div
        className={cn(
          "border-2 px-4",
          selected ? "border-primary " : "border-transparent"
        )}
      >
        <video src={url} autoPlay loop muted className="h-full w-full" />
      </div>
    </div>
  );
};
const DefaultVideoSelector = ({
  onSelectPreviewVideo,
  selectedPreviewType,
}: {
  onSelectPreviewVideo: (type: PreviewType) => void;
  selectedPreviewType?: PreviewType;
}) => {
  return (
    <div className="flex flex-row">
      <VideoPreview
        url={"/kick-fail.mp4"}
        selected={selectedPreviewType === "fail"}
        onSelect={() => {
          onSelectPreviewVideo("fail");
        }}
      />

      <VideoPreview
        selected={selectedPreviewType === "win"}
        url={"/kick-win.mp4"}
        onSelect={() => {
          onSelectPreviewVideo("win");
        }}
      />
    </div>
  );
};

const FileVideoUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [openAiKey, setOpenAiKey] = useState("");
  const [videoResponse, setVideoResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewType, setPreviewType] = useState<PreviewType>();
  async function extractFramesFromVideo(videoFile: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      let frames: string[] = [];

      video.src = URL.createObjectURL(videoFile);
      video.load();

      video.addEventListener("loadedmetadata", async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const duration = video.duration;
        const frameInterval = Math.ceil(duration / 50); // Capture a frame every 50 seconds
        let currentTime = 0;

        while (currentTime <= duration) {
          await new Promise<void>((r) => {
            video.currentTime = currentTime;
            video.addEventListener(
              "seeked",
              () => {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                frames.push(canvas.toDataURL());
                r();
              },
              { once: true }
            );
          });
          currentTime += frameInterval;
        }

        resolve(frames);
      });

      video.addEventListener("error", (error) => {
        reject(error);
      });
    });
  }

  async function handleVideoUpload(videoFile: File) {
    const frames = await extractFramesFromVideo(videoFile); // Extracting frames

    // Send frames to your API
    const response = await fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ frames, openAiKey }),
    });

    const data = await response.json();
    console.log(data);
    setVideoResponse(data.openAIResult.choices[0].message.content);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!openAiKey) {
      alert("Add your OpenAi key first 😡");
    }
    setIsLoading(true);
    const videoName = `kick-${previewType}.mp4`;
    const video = `${process.env.NEXT_PUBLIC_VERCEL_URL}/${videoName}`;
    if (file) {
      await handleVideoUpload(file);
    } else if (previewType) {
      let response = await fetch(video);
      let data = await response.blob();
      const metadata = { type: "video/mp4" };
      await handleVideoUpload(new File([data], videoName, metadata));
    } else {
      console.log("No file selected");
    }
    setIsLoading(false);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const newFile = event.target.files ? event.target.files[0] : null;
    setFile(newFile);
  }

  return (
    <>
      <CardContent className="py-6  overflow-y-auto max-h-[70vh]">
        <div className="space-y-4">
          <form onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Your OpenAI Key</Label>
              <Input
                id="openAiKey"
                placeholder="Enter your Open Ai Key "
                required
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
              />
            </div>
            <div className="my-6">
              <Label htmlFor="username">Add your MP4 KICKFLIP video</Label>
              <Input
                type="file"
                name="file"
                accept="video/mp4"
                onChange={onFileChange}
              />
              <Button
                type="submit"
                disabled={(!file && !previewType) || isLoading}
                className="mt-2 w-full"
              >
                Upload
              </Button>
              <span className="text-xs">
                Make sure you upload a video between 8 and 15 seconds. And do
                not try to upload videos of like 1 GB.
              </span>
            </div>

            <DefaultVideoSelector
              onSelectPreviewVideo={setPreviewType}
              selectedPreviewType={previewType}
            />
          </form>
        </div>
      </CardContent>
      {isLoading && (
        <div className="text-center w-full">
          Please wait! Video is being processed....
        </div>
      )}
      {!!videoResponse && (
        <div>
          <h1 className="text-lg font-bold">Response from the video</h1>
          <span className="text-md px-4">{videoResponse}</span>
        </div>
      )}
    </>
  );
};

export default FileVideoUpload;
