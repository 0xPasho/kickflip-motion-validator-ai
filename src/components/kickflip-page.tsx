import {
  CardTitle,
  CardDescription,
  CardHeader,
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import FileVideoUpload from "./file-video-upload";
import Link from "next/link";

export default function PageContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Kickflip</CardTitle>
            <CardDescription>
              Check why you are having trouble with the kickflip,{" "}
              <b className="text-red-500">you noob</b>.
            </CardDescription>
          </CardHeader>
          <FileVideoUpload />
          <Link href="https://github.com/0xPasho/learn-kickflip-ai">
            <Button className="mb-6">
              <GitHubLogoIcon className="mr-2" /> Github
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
