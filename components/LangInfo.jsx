"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Info, X, Terminal } from "lucide-react";

const data = [
  {
    language: "java",
    info: "openjdk 11.0.17 2022-10-18\nOpenJDK Runtime Environment (build 11.0.17+8-post-Ubuntu-1ubuntu218.04)\nOpenJDK 64-Bit Server VM (build 11.0.17+8-post-Ubuntu-1ubuntu218.04, mixed mode, sharing)\n",
    color: "bg-orange-100 text-orange-700",
    version: "11.0.17",
  },
  {
    language: "cpp",
    info: "c++ (Ubuntu 7.5.0-3ubuntu1~18.04) 7.5.0\nCopyright (C) 2017 Free Software Foundation, Inc.\nThis is free software; see the source for copying conditions.  There is NO\nwarranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\n\n",
    color: "bg-blue-100 text-blue-700",
    version: "7.5.0",
  },
  {
    language: "py",
    info: "Python 3.6.9\n",
    color: "bg-yellow-100 text-yellow-700",
    version: "3.6.9",
  },
  {
    language: "c",
    info: "gcc (Ubuntu 7.5.0-3ubuntu1~18.04) 7.5.0\nCopyright (C) 2017 Free Software Foundation, Inc.\nThis is free software; see the source for copying conditions.  There is NO\nwarranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\n\n",
    color: "bg-gray-100 text-gray-700",
    version: "7.5.0",
  },
  {
    language: "js",
    info: "v16.13.2\n",
    color: "bg-green-100 text-green-700",
    version: "16.13.2",
  },
  {
    language: "cs",
    info: "Mono C# compiler version 4.6.2.0\n",
    color: "bg-purple-100 text-purple-700",
    version: "4.6.2",
  },
];

const LanguageCard = ({ item }) => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <h4 className="font-semibold uppercase">{item.language}</h4>
        </div>
        <Badge variant="secondary" className={item.color}>
          v{item.version}
        </Badge>
      </div>
      <div className="bg-gray-50 rounded-md p-3 mt-2">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
          {item.info.trim()}
        </pre>
      </div>
    </CardContent>
  </Card>
);

export default function LanguagePopup() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Info className="w-4 h-4" />
        <span>Language Info</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Language Information
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-4">
                  {data.map((item, index) => (
                    <LanguageCard key={index} item={item} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
